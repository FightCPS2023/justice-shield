"""Document routes - upload, analysis, CRUD"""
import os
import re
import json
import uuid
import base64
import asyncio
import io
from datetime import datetime, timezone
from typing import Optional
from fastapi import APIRouter, HTTPException, Depends, File, UploadFile, Form, BackgroundTasks

from database import get_db
from auth import get_current_user
from config import EMERGENT_LLM_KEY, UPLOAD_DIR, WHISPER_MAX_SIZE
from utils.credits import get_user_tier, check_doc_upload_limit, get_case_with_ownership, increment_ai_credits, save_case_memory
from models.schemas import DocumentCreate


os.makedirs(UPLOAD_DIR, exist_ok=True)

router = APIRouter()

ANALYSIS_CONCURRENCY = 2
ANALYSIS_SEMAPHORE = asyncio.Semaphore(ANALYSIS_CONCURRENCY)
ANALYSIS_QUEUE = asyncio.Queue()
ANALYSIS_QUEUE_DOC_IDS = set()
ANALYSIS_QUEUE_STARTED = False
ANALYSIS_QUEUE_LOCK = asyncio.Lock()

MAX_ANALYSIS_RETRIES = 3
TRANSIENT_ERROR_KEYWORDS = [
    "badgateway",
    "bad gateway",
    "502",
    "rate limit",
    "timeout",
    "temporarily",
    "gateway"
]

DOCUMENT_EXTENSIONS = {'.pdf', '.txt', '.doc', '.docx', '.rtf'}
IMAGE_EXTENSIONS = {'.png', '.jpg', '.jpeg', '.gif', '.bmp', '.webp', '.heic'}
AUDIO_EXTENSIONS = {'.mp3', '.wav', '.m4a', '.aac', '.ogg', '.flac', '.wma'}
VIDEO_EXTENSIONS = {'.mp4', '.mov', '.avi', '.mkv', '.wmv', '.webm', '.m4v'}
ALLOWED_EXTENSIONS = DOCUMENT_EXTENSIONS | IMAGE_EXTENSIONS | AUDIO_EXTENSIONS | VIDEO_EXTENSIONS

ADA_CROSS_REFERENCE = """
ADA CROSS-REFERENCE REQUIREMENT:
- Always evaluate ADA Title II (public entities) and Title III (public accommodations) for disability accommodations, access barriers, discrimination, and service modifications.
- When relevant, cite Title II/III issues and include remedies, strategies, and case notes.
"""


async def run_document_analysis_bg(doc_id, case_id, case, content, filename, user_id):
    """Background task: runs document analysis after upload response is sent"""
    try:
        result = await analyze_uploaded_document(doc_id, case_id, case, content, filename, user_id)
        db = get_db()
        await db.documents.update_one(
            {"_id": doc_id},
            {"$set": {
                "analysis": result.get("analysis"),
                "analysis_status": "complete" if "error" not in result else "error",
                "analysis_error": result.get("error"),
                "extracted_violations": result.get("violations", []),
                "extracted_timeline": result.get("timeline", [])
            }}
        )

        analysis = result.get("analysis")
        if analysis and isinstance(analysis, dict):
            memory_lines = []
            summary = analysis.get("summary")
            if summary:
                memory_lines.append(f"Summary: {summary if isinstance(summary, str) else json.dumps(summary)}")
            key_allegations = analysis.get("key_allegations") or []
            if key_allegations:
                formatted = []
                for item in key_allegations[:5]:
                    if isinstance(item, dict):
                        formatted.append(item.get("allegation") or item.get("claim") or json.dumps(item))
                    else:
                        formatted.append(str(item))
                memory_lines.append("Key Allegations: " + "; ".join([f for f in formatted if f]))
            defense_opps = analysis.get("defense_opportunities") or []
            if defense_opps:
                formatted = []
                for item in defense_opps[:5]:
                    if isinstance(item, dict):
                        formatted.append(item.get("opportunity") or item.get("summary") or json.dumps(item))
                    else:
                        formatted.append(str(item))
                memory_lines.append("Defense Opportunities: " + "; ".join([f for f in formatted if f]))
            recommended_actions = analysis.get("recommended_immediate_actions") or analysis.get("recommended_actions") or []
            if recommended_actions:
                formatted = [str(a) for a in recommended_actions[:5]]
                memory_lines.append("Recommended Actions: " + "; ".join([f for f in formatted if f]))

            memory_content = "\n".join([line for line in memory_lines if line])
            if memory_content:
                await save_case_memory(
                    case_id=case_id,
                    user_id=user_id,
                    title=f"Doc Analysis Memory: {filename}",
                    content=memory_content,
                    tags=["auto", "document-analysis"],
                    source="document_analysis",
                    metadata={"doc_id": doc_id}
                )

        print(f"[BG] Analysis complete for doc {doc_id}")
        return result
    except Exception as e:
        print(f"[BG] Analysis error for doc {doc_id}: {e}")
        db = get_db()
        await db.documents.update_one(
            {"_id": doc_id},
            {"$set": {"analysis_status": "error", "analysis_error": str(e)}}
        )
        return {"error": str(e), "analysis": None}


def _is_transient_error(error_text: str) -> bool:
    if not error_text:
        return False
    text = error_text.lower()
    return any(keyword in text for keyword in TRANSIENT_ERROR_KEYWORDS)


async def _seed_analysis_queue():
    db = get_db()
    async for item in db.analysis_queue.find({"status": "queued"}).sort("created_at", 1).limit(500):
        doc_id = item.get("doc_id")
        if doc_id and doc_id not in ANALYSIS_QUEUE_DOC_IDS:
            await ANALYSIS_QUEUE.put(doc_id)
            ANALYSIS_QUEUE_DOC_IDS.add(doc_id)


async def _process_analysis_job(doc_id: str):
    db = get_db()
    queue_item = await db.analysis_queue.find_one({"doc_id": doc_id})
    if not queue_item:
        return

    await db.analysis_queue.update_one(
        {"doc_id": doc_id},
        {"$set": {"status": "processing", "started_at": datetime.now(timezone.utc).isoformat(), "error": None}}
    )

    doc = await db.documents.find_one({"_id": doc_id})
    if not doc:
        await db.analysis_queue.update_one(
            {"doc_id": doc_id},
            {"$set": {"status": "error", "error": "Document not found", "completed_at": datetime.now(timezone.utc).isoformat()}}
        )
        return

    case = await db.cases.find_one({"_id": doc.get("case_id")})
    if not case:
        await db.analysis_queue.update_one(
            {"doc_id": doc_id},
            {"$set": {"status": "error", "error": "Case not found", "completed_at": datetime.now(timezone.utc).isoformat()}}
        )
        await db.documents.update_one(
            {"_id": doc_id},
            {"$set": {"analysis_status": "error", "analysis_error": "Case not found"}}
        )
        return

    await db.documents.update_one({"_id": doc_id}, {"$set": {"analysis_status": "analyzing", "analysis_error": None}})

    content = doc.get("content", "")
    if doc.get("source") == "upload" and doc.get("extraction_status") != "complete":
        await db.documents.update_one(
            {"_id": doc_id},
            {"$set": {"extraction_status": "processing", "extraction_error": None}}
        )
        extracted_text, extraction_error = await extract_text_from_file(
            doc.get("file_path", ""),
            doc.get("file_type", ""),
            doc.get("filename", "document"),
            doc.get("file_size", 0)
        )
        extraction_status = "complete" if not extraction_error else "error"
        await db.documents.update_one(
            {"_id": doc_id},
            {"$set": {
                "content": extracted_text,
                "extraction_status": extraction_status,
                "extraction_error": extraction_error
            }}
        )
        content = extracted_text

    try:
        result = await run_document_analysis_bg(
            doc_id,
            doc.get("case_id"),
            case,
            content,
            doc.get("filename", "document"),
            doc.get("user_id")
        )

        if result and result.get("error"):
            error_text = result.get("error", "")
            retry_count = int(doc.get("analysis_retry_count", 0) or 0)
            if _is_transient_error(error_text) and retry_count < MAX_ANALYSIS_RETRIES:
                retry_count += 1
                await db.documents.update_one(
                    {"_id": doc_id},
                    {"$set": {
                        "analysis_status": "queued",
                        "analysis_error": None,
                        "analysis_retry_count": retry_count
                    }}
                )
                await db.analysis_queue.update_one(
                    {"doc_id": doc_id},
                    {"$set": {
                        "status": "queued",
                        "error": None,
                        "started_at": None,
                        "completed_at": None,
                        "created_at": datetime.now(timezone.utc).isoformat()
                    }}
                )
                await _ensure_analysis_worker()
                if doc_id not in ANALYSIS_QUEUE_DOC_IDS:
                    await ANALYSIS_QUEUE.put(doc_id)
                    ANALYSIS_QUEUE_DOC_IDS.add(doc_id)
                return

            await db.analysis_queue.update_one(
                {"doc_id": doc_id},
                {"$set": {"status": "error", "error": error_text, "completed_at": datetime.now(timezone.utc).isoformat()}}
            )
            return

        await db.analysis_queue.update_one(
            {"doc_id": doc_id},
            {"$set": {"status": "complete", "completed_at": datetime.now(timezone.utc).isoformat()}}
        )
    except Exception as e:
        await db.analysis_queue.update_one(
            {"doc_id": doc_id},
            {"$set": {"status": "error", "error": str(e), "completed_at": datetime.now(timezone.utc).isoformat()}}
        )


async def _analysis_queue_worker():
    await _seed_analysis_queue()
    while True:
        doc_id = await ANALYSIS_QUEUE.get()
        ANALYSIS_QUEUE_DOC_IDS.discard(doc_id)
        await _process_analysis_job(doc_id)
        ANALYSIS_QUEUE.task_done()


async def _ensure_analysis_worker():
    global ANALYSIS_QUEUE_STARTED
    if ANALYSIS_QUEUE_STARTED:
        return
    async with ANALYSIS_QUEUE_LOCK:
        if ANALYSIS_QUEUE_STARTED:
            return
        ANALYSIS_QUEUE_STARTED = True
        asyncio.create_task(_analysis_queue_worker())


async def _enqueue_analysis_job(doc_id: str, case_id: str, user_id: str, reason: str = "upload"):
    db = get_db()
    created_at = datetime.now(timezone.utc).isoformat()
    await db.analysis_queue.update_one(
        {"doc_id": doc_id},
        {"$set": {
            "doc_id": doc_id,
            "case_id": case_id,
            "user_id": user_id,
            "status": "queued",
            "reason": reason,
            "created_at": created_at,
            "started_at": None,
            "completed_at": None,
            "error": None
        }},
        upsert=True
    )
    await db.documents.update_one(
        {"_id": doc_id},
        {"$set": {"analysis_status": "queued", "analysis_error": None}}
    )

    await _ensure_analysis_worker()

    if doc_id not in ANALYSIS_QUEUE_DOC_IDS:
        await ANALYSIS_QUEUE.put(doc_id)
        ANALYSIS_QUEUE_DOC_IDS.add(doc_id)

    queue_position = await db.analysis_queue.count_documents({
        "case_id": case_id,
        "user_id": user_id,
        "status": "queued",
        "created_at": {"$lte": created_at}
    })

    return queue_position


# ============== DOCUMENTS ENDPOINTS ==============

@router.post("/api/documents")
async def create_document(doc_data: DocumentCreate, current_user: dict = Depends(get_current_user)):
    """Add a document to a case"""
    db = get_db()
    await get_case_with_ownership(doc_data.case_id, current_user["user_id"])
    
    doc_id = str(uuid.uuid4())
    doc = {
        "_id": doc_id,
        "case_id": doc_data.case_id,
        "user_id": current_user["user_id"],
        "title": doc_data.title,
        "content": doc_data.content,
        "doc_type": doc_data.doc_type,
        "date": doc_data.date or datetime.now(timezone.utc).strftime("%Y-%m-%d"),
        "source": "manual",
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.documents.insert_one(doc)
    doc["id"] = doc.pop("_id")
    return doc

@router.get("/api/documents/{case_id}")
async def list_documents(case_id: str, current_user: dict = Depends(get_current_user)):
    """List all documents for a case"""
    db = get_db()
    await get_case_with_ownership(case_id, current_user["user_id"])
    
    docs = []
    async for doc in db.documents.find({"case_id": case_id}).sort("created_at", -1).limit(200):
        doc["id"] = doc.pop("_id")
        docs.append(doc)
    return {"documents": docs}

@router.delete("/api/documents/{doc_id}")
async def delete_document(doc_id: str, current_user: dict = Depends(get_current_user)):
    """Delete a document"""
    db = get_db()
    doc = await db.documents.find_one({"_id": doc_id, "user_id": current_user["user_id"]})
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    
    await db.documents.delete_one({"_id": doc_id})
    return {"message": "Document deleted"}


# ============== DOCUMENT UPLOAD & AI ANALYSIS ==============

UPLOAD_DIR = "/tmp/cps_uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

# Maximum file size for Whisper transcription (from config)

async def transcribe_audio_video(content: bytes, filename: str, file_ext: str, file_size: int) -> str:
    """
    Transcribe audio/video files using OpenAI Whisper.
    Returns transcription text or None if transcription fails.
    """
    if not EMERGENT_LLM_KEY:
        print(f"Transcription skipped for {filename}: No API key available")
        return None
    
    # Check file size limit for Whisper (25MB)
    if file_size > WHISPER_MAX_SIZE:
        print(f"Transcription skipped for {filename}: File too large ({file_size // (1024*1024)}MB > 25MB limit)")
        return None
    
    # Supported formats for Whisper
    whisper_formats = {'.mp3', '.mp4', '.mpeg', '.mpga', '.m4a', '.wav', '.webm'}
    
    # Map some extensions to supported formats
    ext_mapping = {
        '.mov': '.mp4',  # MOV is essentially MP4
        '.aac': '.m4a',
        '.ogg': '.webm',
    }
    
    actual_ext = ext_mapping.get(file_ext, file_ext)
    if actual_ext not in whisper_formats:
        print(f"Transcription skipped for {filename}: Format {file_ext} not supported by Whisper")
        return None
    
    try:
        from emergentintegrations.llm.openai import OpenAISpeechToText
        import io
        
        print(f"Starting transcription for {filename} ({file_size // 1024}KB)...")
        
        stt = OpenAISpeechToText(api_key=EMERGENT_LLM_KEY)
        
        # Create a file-like object from the content
        audio_file = io.BytesIO(content)
        audio_file.name = filename  # Set filename for the API
        
        # Transcribe with verbose_json to get better results
        response = await stt.transcribe(
            file=audio_file,
            model="whisper-1",
            response_format="verbose_json",
            language="en",  # Default to English for legal proceedings
            prompt="This is a recording related to a CPS (Child Protective Services) case. It may include conversations with caseworkers, attorneys, court proceedings, or family discussions."
        )
        
        transcription_text = response.text if hasattr(response, 'text') else str(response)
        
        if transcription_text and transcription_text.strip():
            print(f"Transcription successful for {filename}: {len(transcription_text)} characters")
            return transcription_text.strip()
        else:
            print(f"Transcription returned empty for {filename}")
            return None
            
    except Exception as e:
        print(f"Transcription error for {filename}: {str(e)}")
        return None


async def extract_text_from_file(file_path: str, file_ext: str, filename: str, file_size: int):
    try:
        with open(file_path, 'rb') as f:
            content = f.read()
    except Exception as e:
        return f"[File: {filename}]\n\nFile uploaded successfully. Text extraction failed due to a read error.", f"Failed to read file: {str(e)}"

    if file_ext == '.txt':
        return content.decode('utf-8', errors='ignore'), None

    if file_ext == '.docx':
        try:
            from docx import Document
            doc = Document(io.BytesIO(content))
            paragraphs = [p.text.strip() for p in doc.paragraphs if p.text and p.text.strip()]
            extracted = "\n".join(paragraphs)
            if extracted:
                return f"[Word Document: {filename}]\n\n{extracted}", None
            return f"[Word Document: {filename}]\n\nNo readable text found in the .docx.", "No text extracted"
        except Exception as e:
            return f"[Word Document: {filename}]\n\nDocument uploaded. Text extraction failed.", str(e)

    if file_ext == '.rtf':
        try:
            from striprtf.striprtf import rtf_to_text
            extracted = rtf_to_text(content.decode('utf-8', errors='ignore'))
            if extracted and extracted.strip():
                return f"[RTF Document: {filename}]\n\n{extracted.strip()}", None
            return f"[RTF Document: {filename}]\n\nNo readable text found in the RTF.", "No text extracted"
        except Exception as e:
            return f"[RTF Document: {filename}]\n\nDocument uploaded. Text extraction failed.", str(e)

    if file_ext == '.pdf':
        try:
            from pypdf import PdfReader
            pdf_reader = PdfReader(io.BytesIO(content))
            pdf_text_parts = []
            pages_with_no_text = []

            for page_num, page in enumerate(pdf_reader.pages, 1):
                try:
                    page_text = page.extract_text()
                    if page_text and page_text.strip() and len(page_text.strip()) > 20:
                        pdf_text_parts.append(f"--- Page {page_num} ---\n{page_text}")
                    else:
                        pages_with_no_text.append(page_num)
                except Exception:
                    pages_with_no_text.append(page_num)

            if len(pages_with_no_text) > len(pdf_reader.pages) * 0.5 or (len(pdf_text_parts) == 0 and len(pdf_reader.pages) > 0):
                try:
                    from pdf2image import convert_from_bytes
                    import pytesseract

                    print(f"Attempting OCR for scanned PDF: {filename}")
                    images = await asyncio.to_thread(convert_from_bytes, content, dpi=200, fmt='png')
                    ocr_text_parts = []

                    for page_num, image in enumerate(images, 1):
                        try:
                            ocr_text = await asyncio.to_thread(pytesseract.image_to_string, image)
                            if ocr_text and ocr_text.strip():
                                ocr_text_parts.append(f"--- Page {page_num} (OCR) ---\n{ocr_text.strip()}")
                        except Exception as ocr_page_err:
                            print(f"OCR failed for page {page_num}: {str(ocr_page_err)}")

                    if ocr_text_parts:
                        extracted_text = f"[PDF Document: {filename}] (Text extracted via OCR)\n\n" + "\n\n".join(ocr_text_parts)
                    elif pdf_text_parts:
                        extracted_text = f"[PDF Document: {filename}]\n\n" + "\n\n".join(pdf_text_parts)
                    else:
                        extracted_text = f"[PDF Document: {filename}]\n\nNote: This PDF appears to be image-based with no readable text. OCR extraction was attempted but found no content."
                except ImportError as ie:
                    print(f"OCR libraries not available: {str(ie)}")
                    if pdf_text_parts:
                        extracted_text = f"[PDF Document: {filename}]\n\n" + "\n\n".join(pdf_text_parts)
                    else:
                        extracted_text = f"[PDF Document: {filename}]\n\nNote: This PDF appears to be scanned/image-based. OCR is not available."
                except Exception as ocr_err:
                    print(f"OCR extraction failed for {filename}: {str(ocr_err)}")
                    if pdf_text_parts:
                        extracted_text = f"[PDF Document: {filename}]\n\n" + "\n\n".join(pdf_text_parts)
                    else:
                        extracted_text = f"[PDF Document: {filename}]\n\nNote: PDF text extraction encountered issues."
            elif pdf_text_parts:
                extracted_text = f"[PDF Document: {filename}]\n\n" + "\n\n".join(pdf_text_parts)
            else:
                extracted_text = f"[PDF Document: {filename}]\n\nNote: This PDF has no extractable text content."

            return extracted_text, None
        except Exception as e:
            print(f"PDF extraction error for {filename}: {str(e)}")
            return f"[PDF Document: {filename}]\n\nPDF uploaded successfully. Text extraction encountered an issue.", str(e)

    if file_ext in IMAGE_EXTENSIONS:
        if not EMERGENT_LLM_KEY:
            return f"[Image: {filename}]\n\nImage uploaded. AI Vision is not available.", "AI Vision unavailable: missing API key"
        try:
            import base64 as _b64
            from emergentintegrations.llm.chat import LlmChat, UserMessage, ImageContent

            print(f"[UPLOAD] Analyzing image with AI Vision: {filename}")
            image_base64 = _b64.b64encode(content).decode('utf-8')
            vision_chat = LlmChat(
                api_key=EMERGENT_LLM_KEY,
                session_id=f"image-analysis-{uuid.uuid4()}",
                system_message="You are a legal document OCR and evidence analyzer for CPS cases. Extract ALL visible text and describe the image thoroughly."
            ).with_model("openai", "gpt-5.2")

            image_content = ImageContent(image_base64=image_base64)
            user_message = UserMessage(
                text=f"Extract ALL text from this image (OCR). Describe everything visible. File: {filename}",
                file_contents=[image_content]
            )

            analysis_response = None
            for vision_attempt in range(2):
                try:
                    analysis_response = await asyncio.wait_for(
                        vision_chat.send_message(user_message),
                        timeout=30
                    )
                    print(f"[UPLOAD] Vision success on attempt {vision_attempt + 1}")
                    break
                except Exception as retry_err:
                    print(f"[UPLOAD] Vision attempt {vision_attempt + 1} failed: {retry_err}")
                    if vision_attempt == 0:
                        await asyncio.sleep(2)
                        vision_chat = LlmChat(
                            api_key=EMERGENT_LLM_KEY,
                            session_id=f"image-analysis-{uuid.uuid4()}-retry",
                            system_message="You are a legal document OCR and evidence analyzer. Extract ALL visible text and describe the image."
                        ).with_model("openai", "gpt-5.2")
                        image_content = ImageContent(image_base64=image_base64)
                        user_message = UserMessage(
                            text=f"Extract ALL text from this image (OCR). Describe everything visible. File: {filename}",
                            file_contents=[image_content]
                        )

            if analysis_response and analysis_response.strip():
                extracted_text = f"[Image: {filename}] (AI Vision Analysis)\n\n{analysis_response}"
            else:
                extracted_text = f"[Image: {filename}]\n\nImage uploaded. AI Vision could not extract text."
            return extracted_text, None
        except Exception as vision_err:
            print(f"[UPLOAD] Vision error for {filename}: {str(vision_err)}")
            return f"[Image: {filename}]\n\nImage uploaded. AI Vision could not extract text.", str(vision_err)

    if file_ext in AUDIO_EXTENSIONS:
        transcription_text = await transcribe_audio_video(content, filename, file_ext, file_size)
        if transcription_text:
            return f"[Audio Recording: {filename}] (Transcribed)\n\n{transcription_text}", None
        return f"[Audio Recording: {filename}]\n\nAudio file uploaded ({file_size // 1024}KB). Transcription was not available.", None

    if file_ext in VIDEO_EXTENSIONS:
        transcription_text = await transcribe_audio_video(content, filename, file_ext, file_size)
        if transcription_text:
            return f"[Video Recording: {filename}] (Audio Transcribed)\n\n{transcription_text}", None
        return f"[Video Recording: {filename}]\n\nVideo file uploaded ({file_size // (1024*1024)}MB). Audio transcription was not available.", None

    if file_ext in {'.doc', '.docx', '.rtf'}:
        return f"[Word Document: {filename}]\n\nDocument uploaded. For best text extraction, consider converting to PDF.", None

    return f"[File: {filename}]\n\nFile uploaded successfully.", None


@router.post("/api/documents/upload")
async def upload_document(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    case_id: str = Form(...),
    title: str = Form(...),
    doc_type: str = Form(default="cps_document"),
    auto_analyze: bool = Form(default=True),
    current_user: dict = Depends(get_current_user)
):
    """
    Upload a document file and optionally run AI analysis.
    Supports: PDF, TXT, images, audio, video files
    Returns: Document record with extracted text and optional AI analysis
    """
    db = get_db()

    # Enforce document upload limit
    user_tier = await get_user_tier(current_user["user_id"])
    if not await check_doc_upload_limit(current_user["user_id"], user_tier):
        raise HTTPException(status_code=403, detail="Document upload limit reached for your plan. Please upgrade to upload more documents.")

    # Verify case ownership
    await get_case_with_ownership(case_id, current_user["user_id"])
    
    # Validate file type - expanded to include audio/video
    allowed_extensions = ALLOWED_EXTENSIONS
    file_ext = os.path.splitext(file.filename)[1].lower()
    if file_ext not in allowed_extensions:
        raise HTTPException(status_code=400, detail=f"File type {file_ext} not supported. Allowed: PDF, TXT, DOC, images, audio (MP3, WAV, etc), video (MP4, MOV, etc)")
    
    # Read file content
    content = await file.read()
    file_size = len(content)
    
    # Larger limit for video/audio files (50MB)
    max_size = 50 * 1024 * 1024 if file_ext in {'.mp4', '.mov', '.avi', '.mkv', '.wmv', '.webm', '.m4v', '.mp3', '.wav', '.m4a'} else 10 * 1024 * 1024
    if file_size > max_size:
        raise HTTPException(status_code=400, detail=f"File too large. Maximum {max_size // (1024*1024)}MB for this file type.")
    
    # Determine file category
    image_extensions = IMAGE_EXTENSIONS
    audio_extensions = AUDIO_EXTENSIONS
    video_extensions = VIDEO_EXTENSIONS
    
    # Extract text based on file type
    extracted_text = ""
    file_category = "document"
    extraction_status = "queued"
    extraction_error = None

    if file_ext == '.txt':
        extracted_text = content.decode('utf-8', errors='ignore')
        file_category = "document"
        extraction_status = "complete"
    elif file_ext == '.pdf':
        file_category = "document"
        extracted_text = f"[PDF Document: {file.filename}]\n\nText extraction queued for background processing."
    elif file_ext in image_extensions:
        file_category = "image"
        extracted_text = f"[Image: {file.filename}]\n\nAI Vision extraction queued for background processing."
    elif file_ext in audio_extensions:
        file_category = "audio"
        extracted_text = f"[Audio Recording: {file.filename}]\n\nTranscription queued for background processing."
    elif file_ext in video_extensions:
        file_category = "video"
        extracted_text = f"[Video Recording: {file.filename}]\n\nTranscription queued for background processing."
    elif file_ext in {'.docx', '.rtf'}:
        file_category = "document"
        extracted_text = f"[Document: {file.filename}]\n\nText extraction queued for background processing."
    elif file_ext == '.doc':
        file_category = "document"
        extracted_text = f"[Word Document: {file.filename}]\n\nDocument uploaded. Please convert .doc to PDF or .docx for reliable text extraction."
        extraction_status = "complete"
    else:
        extracted_text = f"[File: {file.filename}]\n\nFile uploaded successfully."
        extraction_status = "complete"
    
    # Save file
    print(f"[UPLOAD] Saving file: {file.filename}")
    file_id = str(uuid.uuid4())
    file_path = os.path.join(UPLOAD_DIR, f"{file_id}{file_ext}")
    with open(file_path, 'wb') as f:
        f.write(content)
    
    # Create document record
    print("[UPLOAD] Creating DB record...")
    doc_id = str(uuid.uuid4())
    doc = {
        "_id": doc_id,
        "case_id": case_id,
        "user_id": current_user["user_id"],
        "title": title,
        "filename": file.filename,
        "file_path": file_path,
        "file_size": file_size,
        "file_type": file_ext,
        "file_category": file_category,  # document, image, audio, video
        "doc_type": doc_type,
        "content": extracted_text,
        "extraction_status": extraction_status,
        "extraction_error": extraction_error,
        "source": "upload",
        "analysis": None,
        "analysis_status": "queued" if auto_analyze and EMERGENT_LLM_KEY else None,
        "analysis_error": None,
        "analysis_retry_count": 0,
        "extracted_violations": [],
        "extracted_timeline": [],
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    print("[UPLOAD] Inserting doc into DB...")
    await db.documents.insert_one(doc)
    print(f"[UPLOAD] DB insert done for {doc_id}")
    
    # Run AI analysis in background if requested (don't block upload response)
    analysis_result = None
    if auto_analyze:
        if not EMERGENT_LLM_KEY:
            analysis_result = {
                "status": "error",
                "message": "AI analysis unavailable: missing API key"
            }
            await db.documents.update_one(
                {"_id": doc_id},
                {"$set": {"analysis_status": "error", "analysis_error": "AI analysis unavailable: missing API key"}}
            )
        else:
            queue_position = await _enqueue_analysis_job(doc_id, case_id, current_user["user_id"], "upload")
            analysis_result = {
                "status": "queued",
                "message": "Document queued for AI analysis...",
                "queue_position": queue_position
            }
    
    doc["id"] = doc.pop("_id")
    if analysis_result and analysis_result.get("status"):
        doc["analysis_status"] = analysis_result.get("status")
    doc["analysis_result"] = analysis_result
    
    print(f"[UPLOAD] Returning response for {doc['id']}")
    return doc


async def analyze_uploaded_document(doc_id: str, case_id: str, case: dict, content: str, filename: str, user_id: str):
    """
    THE CPS PUNISHER - Document Analysis Engine
    Detects fraud, perjury, constitutional violations, procedural errors, and more.
    """
    db = get_db()
    if not EMERGENT_LLM_KEY:
        return {"error": "AI analysis unavailable: missing API key", "analysis": None}
    from emergentintegrations.llm.chat import LlmChat, UserMessage
    
    print(f"[ANALYSIS] Starting for doc {doc_id}, content length: {len(content)}")
    state = case.get("state", "Unknown")
    
    system_message = f"""You are THE CPS PUNISHER LEGAL AI - an aggressive CPS defense analyst for families in {state}.
Detect ALL: fraud, perjury, constitutional violations (4th/5th/6th/14th Amendments), procedural errors, ASFA/CAPTA/ICWA/ADA violations, caseworker misconduct, evidentiary issues.
Be AGGRESSIVE - flag ANY possible violation. This family's children may be at stake.

Respond ONLY with valid JSON matching this structure:
{{"summary":"overview","document_type":"petition/report/order/letter/other","overall_assessment":"HIGHLY PROBLEMATIC/PROBLEMATIC/CONCERNING/STANDARD","credibility_score":1-10,
"fraud_and_perjury":[{{"finding":"what","explanation":"why","severity":"critical/high/medium"}}],
"constitutional_violations":[{{"amendment":"4th/14th/etc","violation_type":"type","description":"detail","defense_strategy":"motion","severity":"critical/high/medium"}}],
"procedural_violations":[{{"procedure_violated":"name","description":"detail","remedy":"relief","severity":"critical/high/medium"}}],
"federal_law_violations":[{{"statute":"ASFA/CAPTA/etc","specific_violation":"detail","remedy":"action","severity":"critical/high/medium"}}],
"caseworker_misconduct":[{{"caseworker_name":"name","misconduct_type":"type","description":"detail","severity":"critical/high/medium"}}],
"evidentiary_issues":[{{"issue_type":"hearsay/speculation/etc","problematic_statement":"quote","challenge_strategy":"objection","severity":"high/medium/low"}}],
"key_allegations":[{{"allegation":"what","weaknesses":"problems","defense":"how to refute"}}],
"timeline_events":[{{"date":"YYYY-MM-DD","event":"what","legal_significance":"why it matters"}}],
"defense_opportunities":[{{"opportunity":"strategy","legal_basis":"law","likelihood_of_success":"strong/moderate/worth_trying"}}],
"motions_to_file":[{{"motion_type":"dismiss/suppress/etc","basis":"grounds","urgency":"immediate/soon/later"}}],
"recommended_immediate_actions":["action1","action2"],
"case_notes_to_add":[{{"note_title":"title","note_content":"detail","importance":"critical/high/medium"}}]}}""" + ADA_CROSS_REFERENCE

    chat = LlmChat(
        api_key=EMERGENT_LLM_KEY,
        session_id=f"doc-analysis-{doc_id}",
        system_message=system_message
    ).with_model("openai", "gpt-5.2")
    
    prompt = f"""Analyze this CPS document uploaded by a parent in {state}:

FILENAME: {filename}

DOCUMENT CONTENT:
{content[:15000]}

Provide your complete analysis in JSON format. Be thorough - this parent's family is at stake."""

    max_retries = 4
    response = None
    error_text = ""
    retry_delays = [2, 5, 10, 20]
    
    for attempt in range(max_retries + 1):
        try:
            print(f"[ANALYSIS] Sending LLM request for doc {doc_id} (attempt {attempt + 1})...")
            async with ANALYSIS_SEMAPHORE:
                response = await asyncio.wait_for(
                    chat.send_message(UserMessage(text=prompt)),
                    timeout=90
                )
            print(f"[ANALYSIS] LLM response received for doc {doc_id}, length: {len(response)}")
            break
        except asyncio.TimeoutError:
            error_text = "timeout"
            print(f"[ANALYSIS] LLM TIMEOUT for doc {doc_id}")
            if attempt == max_retries:
                return {"error": "Analysis timed out. Please try again.", "analysis": None}
        except Exception as e:
            error_text = str(e)
            print(f"[ANALYSIS] LLM ERROR for doc {doc_id}: {error_text}")
            if attempt == max_retries:
                return {"error": f"Analysis failed: {error_text}", "analysis": None}
        
        wait_seconds = retry_delays[min(attempt, len(retry_delays) - 1)]
        if "rate limit" in error_text.lower() or "429" in error_text:
            wait_seconds = max(wait_seconds, 8)
        await asyncio.sleep(wait_seconds)
        
        chat = LlmChat(
            api_key=EMERGENT_LLM_KEY,
            session_id=f"doc-analysis-{doc_id}-retry{attempt}",
            system_message=system_message
        ).with_model("openai", "gpt-5.2")
    
    if not response:
        return {"error": "Analysis failed after retries", "analysis": None}
    
    # Parse JSON response
    try:
        # Try to extract JSON from the response
        json_match = re.search(r'\{[\s\S]*\}', response)
        if json_match:
            analysis_data = json.loads(json_match.group())
        else:
            analysis_data = {"raw_analysis": response}
    except json.JSONDecodeError:
        analysis_data = {"raw_analysis": response}
    
    # Auto-create violations in the database from ALL violation categories
    created_violations = []
    
    # Process constitutional violations
    if "constitutional_violations" in analysis_data and isinstance(analysis_data["constitutional_violations"], list):
        for v in analysis_data["constitutional_violations"][:10]:
            if isinstance(v, dict):
                violation_id = str(uuid.uuid4())
                violation_doc = {
                    "_id": violation_id,
                    "case_id": case_id,
                    "user_id": user_id,
                    "violation_type": f"{v.get('amendment', 'constitutional')}_amendment",
                    "violation_category": "constitutional",
                    "description": f"{v.get('violation_type', '')}: {v.get('description', '')}",
                    "severity": v.get("severity", "high"),
                    "statute_reference": v.get("legal_basis", ""),
                    "defense_strategy": v.get("defense_strategy", ""),
                    "source": f"AI Analysis of {filename}",
                    "auto_extracted": True,
                    "created_at": datetime.now(timezone.utc).isoformat()
                }
                await db.violations.insert_one(violation_doc)
                created_violations.append(violation_id)
    
    # Process fraud and perjury findings
    if "fraud_and_perjury" in analysis_data and isinstance(analysis_data["fraud_and_perjury"], list):
        for v in analysis_data["fraud_and_perjury"][:10]:
            if isinstance(v, dict):
                violation_id = str(uuid.uuid4())
                violation_doc = {
                    "_id": violation_id,
                    "case_id": case_id,
                    "user_id": user_id,
                    "violation_type": "fraud_perjury",
                    "violation_category": "fraud",
                    "description": f"FRAUD/PERJURY: {v.get('finding', '')} - {v.get('explanation', '')}",
                    "severity": v.get("severity", "critical"),
                    "evidence_contradiction": v.get("evidence_contradiction", ""),
                    "legal_consequence": v.get("legal_consequence", ""),
                    "source": f"AI Analysis of {filename}",
                    "auto_extracted": True,
                    "created_at": datetime.now(timezone.utc).isoformat()
                }
                await db.violations.insert_one(violation_doc)
                created_violations.append(violation_id)
    
    # Process procedural violations
    if "procedural_violations" in analysis_data and isinstance(analysis_data["procedural_violations"], list):
        for v in analysis_data["procedural_violations"][:10]:
            if isinstance(v, dict):
                violation_id = str(uuid.uuid4())
                violation_doc = {
                    "_id": violation_id,
                    "case_id": case_id,
                    "user_id": user_id,
                    "violation_type": "procedural_violation",
                    "violation_category": "procedural",
                    "description": f"{v.get('procedure_violated', '')}: {v.get('description', '')}",
                    "severity": v.get("severity", "high"),
                    "statute_reference": v.get("legal_requirement", ""),
                    "impact": v.get("impact_on_case", ""),
                    "remedy": v.get("remedy", ""),
                    "source": f"AI Analysis of {filename}",
                    "auto_extracted": True,
                    "created_at": datetime.now(timezone.utc).isoformat()
                }
                await db.violations.insert_one(violation_doc)
                created_violations.append(violation_id)
    
    # Process federal law violations
    if "federal_law_violations" in analysis_data and isinstance(analysis_data["federal_law_violations"], list):
        for v in analysis_data["federal_law_violations"][:10]:
            if isinstance(v, dict):
                violation_id = str(uuid.uuid4())
                violation_doc = {
                    "_id": violation_id,
                    "case_id": case_id,
                    "user_id": user_id,
                    "violation_type": f"{v.get('statute', 'federal').lower()}_violation",
                    "violation_category": "federal_law",
                    "description": f"{v.get('statute', 'Federal')}: {v.get('specific_violation', '')} - {v.get('description', '')}",
                    "severity": v.get("severity", "critical"),
                    "remedy": v.get("remedy", ""),
                    "source": f"AI Analysis of {filename}",
                    "auto_extracted": True,
                    "created_at": datetime.now(timezone.utc).isoformat()
                }
                await db.violations.insert_one(violation_doc)
                created_violations.append(violation_id)
    
    # Process caseworker misconduct
    if "caseworker_misconduct" in analysis_data and isinstance(analysis_data["caseworker_misconduct"], list):
        for v in analysis_data["caseworker_misconduct"][:10]:
            if isinstance(v, dict):
                violation_id = str(uuid.uuid4())
                violation_doc = {
                    "_id": violation_id,
                    "case_id": case_id,
                    "user_id": user_id,
                    "violation_type": "caseworker_misconduct",
                    "violation_category": "misconduct",
                    "description": f"Caseworker {v.get('caseworker_name', 'Unknown')}: {v.get('misconduct_type', '')} - {v.get('description', '')}",
                    "severity": v.get("severity", "high"),
                    "evidence": v.get("evidence", ""),
                    "complaint_basis": v.get("complaint_basis", ""),
                    "source": f"AI Analysis of {filename}",
                    "auto_extracted": True,
                    "created_at": datetime.now(timezone.utc).isoformat()
                }
                await db.violations.insert_one(violation_doc)
                created_violations.append(violation_id)
    
    # Process evidentiary issues
    if "evidentiary_issues" in analysis_data and isinstance(analysis_data["evidentiary_issues"], list):
        for v in analysis_data["evidentiary_issues"][:10]:
            if isinstance(v, dict):
                violation_id = str(uuid.uuid4())
                violation_doc = {
                    "_id": violation_id,
                    "case_id": case_id,
                    "user_id": user_id,
                    "violation_type": f"evidentiary_{v.get('issue_type', 'issue')}",
                    "violation_category": "evidentiary",
                    "description": f"{v.get('issue_type', 'Evidence Issue')}: {v.get('problematic_statement', '')} - {v.get('why_inadmissible', '')}",
                    "severity": v.get("severity", "medium"),
                    "challenge_strategy": v.get("challenge_strategy", ""),
                    "source": f"AI Analysis of {filename}",
                    "auto_extracted": True,
                    "created_at": datetime.now(timezone.utc).isoformat()
                }
                await db.violations.insert_one(violation_doc)
                created_violations.append(violation_id)
    
    # Fallback to old format if present
    if "violations" in analysis_data and isinstance(analysis_data["violations"], list):
        for v in analysis_data["violations"][:10]:
            if isinstance(v, dict) and v.get("type") and v.get("description"):
                violation_id = str(uuid.uuid4())
                violation_doc = {
                    "_id": violation_id,
                    "case_id": case_id,
                    "user_id": user_id,
                    "violation_type": v.get("type", "other"),
                    "description": v.get("description", ""),
                    "severity": v.get("severity", "medium"),
                    "statute_reference": v.get("legal_basis", ""),
                    "source": f"AI Analysis of {filename}",
                    "auto_extracted": True,
                    "created_at": datetime.now(timezone.utc).isoformat()
                }
                await db.violations.insert_one(violation_doc)
                created_violations.append(violation_id)
    
    # Auto-create timeline events
    created_timeline = []
    if "timeline_events" in analysis_data and isinstance(analysis_data["timeline_events"], list):
        for e in analysis_data["timeline_events"][:15]:  # Limit to 15
            if isinstance(e, dict) and e.get("event"):
                event_id = str(uuid.uuid4())
                event_doc = {
                    "_id": event_id,
                    "case_id": case_id,
                    "user_id": user_id,
                    "title": e.get("event", "")[:100],
                    "description": e.get("significance", ""),
                    "date": e.get("date", datetime.now(timezone.utc).strftime("%Y-%m-%d")),
                    "event_type": "extracted",
                    "importance": "medium",
                    "source": f"AI Analysis of {filename}",
                    "auto_extracted": True,
                    "created_at": datetime.now(timezone.utc).isoformat()
                }
                await db.timeline_events.insert_one(event_doc)
                created_timeline.append(event_id)
    
    # Auto-create case notes from analysis findings
    created_notes = []
    if "case_notes_to_add" in analysis_data and isinstance(analysis_data["case_notes_to_add"], list):
        for note in analysis_data["case_notes_to_add"][:10]:
            if isinstance(note, dict) and note.get("note_content"):
                note_id = str(uuid.uuid4())
                note_doc = {
                    "note_id": note_id,
                    "case_id": case_id,
                    "user_id": user_id,
                    "feature_name": f"Document Analysis: {filename}",
                    "prompt": note.get("note_title", "AI Finding"),
                    "response": note.get("note_content", ""),
                    "importance": note.get("importance", "high"),
                    "auto_generated": True,
                    "created_at": datetime.now(timezone.utc).isoformat()
                }
                await db.ai_case_notes.insert_one(note_doc)
                created_notes.append(note_id)
    
    # Also create a summary note with the overall findings
    summary_note_id = str(uuid.uuid4())
    summary_content = f"""## Document Analysis Summary: {filename}

**Overall Assessment:** {analysis_data.get('overall_assessment', 'N/A')}
**Credibility Score:** {analysis_data.get('credibility_score', 'N/A')}/10

### Key Findings:
- **Constitutional Violations Found:** {len(analysis_data.get('constitutional_violations', []))}
- **Fraud/Perjury Issues:** {len(analysis_data.get('fraud_and_perjury', []))}
- **Procedural Violations:** {len(analysis_data.get('procedural_violations', []))}
- **Federal Law Violations:** {len(analysis_data.get('federal_law_violations', []))}
- **Caseworker Misconduct:** {len(analysis_data.get('caseworker_misconduct', []))}
- **Evidentiary Issues:** {len(analysis_data.get('evidentiary_issues', []))}

### Summary:
{analysis_data.get('summary', 'Analysis complete.')}

### Recommended Immediate Actions:
{chr(10).join(['- ' + action for action in analysis_data.get('recommended_immediate_actions', ['Review findings with attorney'])[:5]])}

### Motions to Consider Filing:
{chr(10).join(['- ' + m.get('motion_type', '') + ': ' + m.get('basis', '') for m in analysis_data.get('motions_to_file', [])[:5]])}
"""
    
    await db.ai_case_notes.insert_one({
        "note_id": summary_note_id,
        "case_id": case_id,
        "user_id": user_id,
        "feature_name": "Document Analysis Summary",
        "prompt": f"Complete analysis of {filename}",
        "response": summary_content,
        "importance": "critical",
        "auto_generated": True,
        "created_at": datetime.now(timezone.utc).isoformat()
    })
    created_notes.append(summary_note_id)
    
    return {
        "analysis": analysis_data,
        "violations": created_violations,
        "timeline": created_timeline,
        "notes": created_notes,
        "violations_created": len(created_violations),
        "timeline_events_created": len(created_timeline),
        "notes_created": len(created_notes)
    }


@router.post("/api/documents/{doc_id}/reanalyze")
async def reanalyze_document(doc_id: str, background_tasks: BackgroundTasks, current_user: dict = Depends(get_current_user)):
    """Re-run AI analysis - runs in background and returns immediately"""
    print(f"[REANALYZE] Starting for doc {doc_id}")
    db = get_db()
    doc = await db.documents.find_one({"_id": doc_id, "user_id": current_user["user_id"]})
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    
    await get_case_with_ownership(doc["case_id"], current_user["user_id"])
    
    await db.documents.update_one({"_id": doc_id}, {"$set": {"analysis_status": "queued", "analysis_error": None, "analysis_retry_count": 0}})
    queue_position = await _enqueue_analysis_job(doc_id, doc["case_id"], doc.get("user_id"), "reanalyze")
    
    return {
        "status": "queued",
        "message": "Analysis queued. Results will appear shortly.",
        "doc_id": doc_id,
        "queue_position": queue_position
    }


@router.get("/api/documents/{doc_id}/analysis")
async def get_document_analysis(doc_id: str, current_user: dict = Depends(get_current_user)):
    """Get the AI analysis for a document"""
    db = get_db()
    doc = await db.documents.find_one({"_id": doc_id, "user_id": current_user["user_id"]})
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    
    return {
        "document_id": doc_id,
        "title": doc.get("title"),
        "filename": doc.get("filename"),
        "analysis": doc.get("analysis"),
        "extracted_violations": doc.get("extracted_violations", []),
        "extracted_timeline": doc.get("extracted_timeline", [])
    }




@router.get("/api/analysis-queue")
async def get_analysis_queue_status(case_id: Optional[str] = None, current_user: dict = Depends(get_current_user)):
    """Get analysis queue metrics for the current user (optionally filtered by case)"""
    db = get_db()
    await _ensure_analysis_worker()
    query = {"user_id": current_user["user_id"]}
    if case_id:
        query["case_id"] = case_id

    counts = {}
    for status in ["queued", "processing", "complete", "error"]:
        counts[status] = await db.analysis_queue.count_documents({**query, "status": status})

    total = counts["queued"] + counts["processing"] + counts["complete"] + counts["error"]
    last_updated = datetime.now(timezone.utc).isoformat()

    queued_docs = []
    position = 0
    async for item in db.analysis_queue.find({**query, "status": "queued"}).sort("created_at", 1).limit(200):
        position += 1
        queued_docs.append({
            "doc_id": item.get("doc_id"),
            "position": position,
            "created_at": item.get("created_at")
        })

    return {
        "queued": counts["queued"],
        "processing": counts["processing"],
        "complete": counts["complete"],
        "error": counts["error"],
        "total": total,
        "queued_docs": queued_docs,
        "last_updated": last_updated
    }


@router.get("/api/analysis-queue/{doc_id}")
async def get_analysis_queue_item(doc_id: str, current_user: dict = Depends(get_current_user)):
    """Get per-document queue details"""
    db = get_db()
    await _ensure_analysis_worker()
    item = await db.analysis_queue.find_one(
        {"doc_id": doc_id, "user_id": current_user["user_id"]},
        {"_id": 0}
    )
    if not item:
        raise HTTPException(status_code=404, detail="Queue item not found")

    queue_position = None
    if item.get("status") == "queued":
        queue_position = await db.analysis_queue.count_documents({
            "user_id": current_user["user_id"],
            "case_id": item.get("case_id"),
            "status": "queued",
            "created_at": {"$lte": item.get("created_at")}
        })

    return {
        **item,
        "queue_position": queue_position
    }


@router.get("/api/documents/{doc_id}/analysis-status")
async def get_analysis_status(doc_id: str, current_user: dict = Depends(get_current_user)):
    """Check the status of a background document analysis"""
    db = get_db()
    doc = await db.documents.find_one(
        {"_id": doc_id, "user_id": current_user["user_id"]},
        {"_id": 0, "analysis_status": 1, "analysis": 1, "analysis_error": 1, "extracted_violations": 1, "case_id": 1}
    )
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")

    status = doc.get("analysis_status", "none")
    queue_item = await db.analysis_queue.find_one({"doc_id": doc_id}, {"created_at": 1, "status": 1})
    queue_status = queue_item.get("status") if queue_item else None
    queue_position = None
    if queue_status == "queued" and queue_item:
        queue_position = await db.analysis_queue.count_documents({
            "user_id": current_user["user_id"],
            "case_id": doc.get("case_id"),
            "status": "queued",
            "created_at": {"$lte": queue_item.get("created_at")}
        })

    return {
        "doc_id": doc_id,
        "status": status,
        "analysis": doc.get("analysis") if status == "complete" else None,
        "error": doc.get("analysis_error") if status == "error" else None,
        "violations_found": len(doc.get("extracted_violations", [])),
        "queue_status": queue_status,
        "queue_position": queue_position
    }
