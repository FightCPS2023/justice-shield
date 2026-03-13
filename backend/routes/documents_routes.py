"""Document routes - upload, analysis, CRUD"""
import os
import re
import json
import uuid
import base64
from datetime import datetime, timezone
from typing import Optional
from fastapi import APIRouter, HTTPException, Depends, File, UploadFile, Form

from database import get_db
from auth import get_current_user
from config import EMERGENT_LLM_KEY, UPLOAD_DIR, WHISPER_MAX_SIZE
from utils.credits import get_user_tier, check_doc_upload_limit, get_case_with_ownership, increment_ai_credits
from models.schemas import DocumentCreate


os.makedirs(UPLOAD_DIR, exist_ok=True)

router = APIRouter()

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

# Maximum file size for Whisper transcription (25MB)
WHISPER_MAX_SIZE = 25 * 1024 * 1024

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

@router.post("/api/documents/upload")
async def upload_document(
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
    from emergentintegrations.llm.chat import LlmChat, UserMessage

    # Enforce document upload limit
    user_tier = await get_user_tier(current_user["user_id"])
    if not await check_doc_upload_limit(current_user["user_id"], user_tier):
        raise HTTPException(status_code=403, detail="Document upload limit reached for your plan. Please upgrade to upload more documents.")

    # Verify case ownership
    case = await get_case_with_ownership(case_id, current_user["user_id"])
    
    # Validate file type - expanded to include audio/video
    allowed_extensions = {
        # Documents
        '.pdf', '.txt', '.doc', '.docx', '.rtf',
        # Images
        '.png', '.jpg', '.jpeg', '.gif', '.bmp', '.webp', '.heic',
        # Audio
        '.mp3', '.wav', '.m4a', '.aac', '.ogg', '.flac', '.wma',
        # Video
        '.mp4', '.mov', '.avi', '.mkv', '.wmv', '.webm', '.m4v'
    }
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
    image_extensions = {'.png', '.jpg', '.jpeg', '.gif', '.bmp', '.webp', '.heic'}
    audio_extensions = {'.mp3', '.wav', '.m4a', '.aac', '.ogg', '.flac', '.wma'}
    video_extensions = {'.mp4', '.mov', '.avi', '.mkv', '.wmv', '.webm', '.m4v'}
    
    # Extract text based on file type
    extracted_text = ""
    file_category = "document"
    
    if file_ext == '.txt':
        extracted_text = content.decode('utf-8', errors='ignore')
        file_category = "document"
    elif file_ext == '.pdf':
        file_category = "document"
        # Extract text from PDF using pypdf, with OCR fallback for scanned documents
        try:
            from pypdf import PdfReader
            import io
            
            pdf_reader = PdfReader(io.BytesIO(content))
            pdf_text_parts = []
            pages_with_no_text = []
            
            # First pass: try standard text extraction
            for page_num, page in enumerate(pdf_reader.pages, 1):
                try:
                    page_text = page.extract_text()
                    if page_text and page_text.strip() and len(page_text.strip()) > 20:
                        pdf_text_parts.append(f"--- Page {page_num} ---\n{page_text}")
                    else:
                        pages_with_no_text.append(page_num)
                except Exception as page_err:
                    pages_with_no_text.append(page_num)
            
            # If many pages have no text, try OCR extraction
            if len(pages_with_no_text) > len(pdf_reader.pages) * 0.5 or (len(pdf_text_parts) == 0 and len(pdf_reader.pages) > 0):
                try:
                    from pdf2image import convert_from_bytes
                    import pytesseract
                    
                    print(f"Attempting OCR for scanned PDF: {file.filename}")
                    images = convert_from_bytes(content, dpi=200, fmt='png')
                    ocr_text_parts = []
                    
                    for page_num, image in enumerate(images, 1):
                        try:
                            ocr_text = pytesseract.image_to_string(image)
                            if ocr_text and ocr_text.strip():
                                ocr_text_parts.append(f"--- Page {page_num} (OCR) ---\n{ocr_text.strip()}")
                        except Exception as ocr_page_err:
                            print(f"OCR failed for page {page_num}: {str(ocr_page_err)}")
                    
                    if ocr_text_parts:
                        extracted_text = f"[PDF Document: {file.filename}] (Text extracted via OCR)\n\n" + "\n\n".join(ocr_text_parts)
                    elif pdf_text_parts:
                        # Some text was extracted, use what we have
                        extracted_text = f"[PDF Document: {file.filename}]\n\n" + "\n\n".join(pdf_text_parts)
                    else:
                        extracted_text = f"[PDF Document: {file.filename}]\n\nNote: This PDF appears to be image-based with no readable text. OCR extraction was attempted but found no content. The document has been saved for manual review."
                except ImportError as ie:
                    print(f"OCR libraries not available: {str(ie)}")
                    if pdf_text_parts:
                        extracted_text = f"[PDF Document: {file.filename}]\n\n" + "\n\n".join(pdf_text_parts)
                    else:
                        extracted_text = f"[PDF Document: {file.filename}]\n\nNote: This PDF appears to be scanned/image-based. OCR is not available. The document has been saved for reference."
                except Exception as ocr_err:
                    print(f"OCR extraction failed for {file.filename}: {str(ocr_err)}")
                    if pdf_text_parts:
                        extracted_text = f"[PDF Document: {file.filename}]\n\n" + "\n\n".join(pdf_text_parts)
                    else:
                        extracted_text = f"[PDF Document: {file.filename}]\n\nNote: PDF text extraction encountered issues. The document has been saved for reference."
            elif pdf_text_parts:
                extracted_text = f"[PDF Document: {file.filename}]\n\n" + "\n\n".join(pdf_text_parts)
            else:
                extracted_text = f"[PDF Document: {file.filename}]\n\nNote: This PDF has no extractable text content. The document has been saved for reference."
        except Exception as e:
            print(f"PDF extraction error for {file.filename}: {str(e)}")
            extracted_text = f"[PDF Document: {file.filename}]\n\nPDF uploaded successfully. Text extraction encountered an issue but the file is saved."
    elif file_ext in image_extensions:
        file_category = "image"
        # Use AI Vision to analyze the image and extract text/information
        try:
            import base64
            from emergentintegrations.llm.chat import LlmChat, UserMessage, ImageContent
            
            print(f"Analyzing image with AI Vision: {file.filename}")
            
            # Convert image to base64
            image_base64 = base64.b64encode(content).decode('utf-8')
            
            # Create vision chat for image analysis
            vision_chat = LlmChat(
                api_key=EMERGENT_LLM_KEY,
                session_id=f"image-analysis-{uuid.uuid4()}",
                system_message="""You are a legal document and evidence analyzer for CPS (Child Protective Services) cases.
                Analyze images thoroughly and extract ALL relevant information including:
                - Any visible text (OCR)
                - Names, dates, case numbers, addresses
                - Description of what's shown in the image
                - Any evidence of conditions, people, or situations
                - Signatures, stamps, or official markings
                - Any concerning or relevant details for a legal case
                Be extremely thorough - this information may be used in court."""
            ).with_model("openai", "gpt-5.2")
            
            # Create image content
            image_content = ImageContent(image_base64=image_base64)
            
            # Analyze the image
            user_message = UserMessage(
                text=f"Analyze this image from a CPS case file. Extract ALL text visible in the image (perform OCR). Describe everything you see in detail. This is file: {file.filename}",
                file_contents=[image_content]
            )
            
            analysis_response = await vision_chat.send_message(user_message)
            
            if analysis_response and analysis_response.strip():
                extracted_text = f"[Image: {file.filename}] (AI Vision Analysis)\n\n{analysis_response}"
                print(f"Image analysis successful for {file.filename}: {len(analysis_response)} chars")
            else:
                extracted_text = f"[Image: {file.filename}]\n\nImage uploaded for visual evidence. AI analysis could not extract details."
        except Exception as vision_err:
            print(f"Vision analysis error for {file.filename}: {str(vision_err)}")
            extracted_text = f"[Image: {file.filename}]\n\nImage uploaded for visual evidence. Size: {file_size // 1024}KB. Manual review recommended."
    elif file_ext in audio_extensions:
        file_category = "audio"
        # Attempt to transcribe audio using OpenAI Whisper
        transcription_text = await transcribe_audio_video(content, file.filename, file_ext, file_size)
        if transcription_text:
            extracted_text = f"[Audio Recording: {file.filename}] (Transcribed)\n\n{transcription_text}"
        else:
            extracted_text = f"[Audio Recording: {file.filename}]\n\nAudio file uploaded ({file_size // 1024}KB). Transcription was not available. This can be used as evidence of conversations, meetings, or incidents."
    elif file_ext in video_extensions:
        file_category = "video"
        # Attempt to transcribe video audio track using OpenAI Whisper
        transcription_text = await transcribe_audio_video(content, file.filename, file_ext, file_size)
        if transcription_text:
            extracted_text = f"[Video Recording: {file.filename}] (Audio Transcribed)\n\n{transcription_text}"
        else:
            extracted_text = f"[Video Recording: {file.filename}]\n\nVideo file uploaded ({file_size // (1024*1024)}MB). Audio transcription was not available. This can be used as visual evidence of incidents, visits, or conditions."
    elif file_ext in {'.doc', '.docx', '.rtf'}:
        file_category = "document"
        extracted_text = f"[Word Document: {file.filename}]\n\nDocument uploaded. For best text extraction, consider converting to PDF."
    else:
        extracted_text = f"[File: {file.filename}]\n\nFile uploaded successfully."
    
    # Save file
    file_id = str(uuid.uuid4())
    file_path = os.path.join(UPLOAD_DIR, f"{file_id}{file_ext}")
    with open(file_path, 'wb') as f:
        f.write(content)
    
    # Create document record
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
        "source": "upload",
        "analysis": None,
        "extracted_violations": [],
        "extracted_timeline": [],
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.documents.insert_one(doc)
    
    # Run AI analysis if requested (skip for large video/audio files)
    analysis_result = None
    skip_analysis = file_category in ['video', 'audio'] and file_size > 5 * 1024 * 1024
    if auto_analyze and EMERGENT_LLM_KEY and not skip_analysis:
        try:
            analysis_result = await analyze_uploaded_document(
                doc_id, case_id, case, extracted_text, file.filename, current_user["user_id"]
            )
            # Update document with analysis
            await db.documents.update_one(
                {"_id": doc_id},
                {"$set": {
                    "analysis": analysis_result.get("analysis"),
                    "extracted_violations": analysis_result.get("violations", []),
                    "extracted_timeline": analysis_result.get("timeline", [])
                }}
            )
        except Exception as e:
            analysis_result = {"error": str(e)}
    
    doc["id"] = doc.pop("_id")
    doc["analysis_result"] = analysis_result
    
    return doc


async def analyze_uploaded_document(doc_id: str, case_id: str, case: dict, content: str, filename: str, user_id: str):
    """
    THE CPS PUNISHER - ULTIMATE Document Analysis Engine
    The most comprehensive AI legal analyst for Child Protective Services cases.
    Detects fraud, perjury, constitutional violations, procedural errors, and more.
    """
    db = get_db()
    from emergentintegrations.llm.chat import LlmChat, UserMessage
    
    state = case.get("state", "Unknown")
    
    system_message = f"""You are THE CPS PUNISHER LEGAL AI - the most advanced and aggressive AI legal analyst 
ever created for Child Protective Services defense. You are a virtual team of:
- A constitutional law expert
- A family law attorney 
- A forensic document analyst
- A fraud investigator
- A civil rights advocate

You are analyzing a document for a family fighting CPS in {state}.

YOUR MISSION: TEAR THIS DOCUMENT APART. Find EVERY issue, EVERY violation, EVERY lie, EVERY procedural error.
Families are being destroyed by corrupt and incompetent CPS systems. Your analysis could save children from 
wrongful removal or reunite a family.

## WHAT YOU MUST DETECT AND FLAG:

### FRAUD & PERJURY
- False statements of fact
- Misrepresentation of evidence
- Fabricated allegations
- Doctored or altered documents
- Statements contradicted by evidence
- Exaggerations presented as fact
- Omission of exculpatory evidence
- Cherry-picked facts that mislead

### CONSTITUTIONAL VIOLATIONS
- **4th Amendment**: Warrantless entry, illegal search, seizure without probable cause, coerced consent
- **5th Amendment**: Self-incrimination, statements obtained through deception, Miranda-like issues
- **6th Amendment**: Denied right to counsel, no notification of hearing rights
- **14th Amendment**: Due process violations, equal protection issues, liberty interest violations
- **1st Amendment**: Religious discrimination, freedom of expression issues

### PROCEDURAL VIOLATIONS
- Failed to provide written notice
- Missed mandatory timelines (24hr, 48hr, 72hr rules)
- No reasonable efforts finding before removal
- Emergency removal without true emergency
- Failed to consider kinship placement first
- No safety plan offered before removal
- Inadequate investigation (one-sided, no father contact, etc.)
- Failed to interview children properly
- Coerced statements from children

### EVIDENTIARY ISSUES
- Hearsay relied upon as fact
- Anonymous allegations treated as credible
- No corroborating evidence
- Expert opinions without qualification
- Medical diagnoses without examination
- Conclusions without factual basis
- Speculation presented as assessment

### FEDERAL LAW VIOLATIONS
- **ASFA** (Adoption and Safe Families Act) timeline violations
- **CAPTA** (Child Abuse Prevention and Treatment Act) requirements not met
- **ICWA** (Indian Child Welfare Act) violations for Native families
- **ADA** (Americans with Disabilities Act) discrimination
- **Title VI** civil rights violations

### AGENCY MISCONDUCT
- Caseworker bias or prejudice
- Conflict of interest
- Retaliation for exercising rights
- Intimidation or threats
- Failure to follow agency policy
- Inadequate supervision
- Pattern of similar misconduct

### DOCUMENT-SPECIFIC ISSUES
- Inconsistencies within the document
- Contradictions with other documents
- Missing required signatures or dates
- Incorrect legal citations
- Improper service of documents
- Backdated entries
- Unsigned declarations

## HOW TO EXPLAIN ISSUES:

For EACH issue found, provide:
1. **What was found**: The specific problematic statement/action
2. **Why it's wrong**: The legal/factual basis for the violation
3. **How it applies to this case**: Specific impact on this family
4. **How to challenge it**: Defense strategy or motion to file
5. **Severity**: How damaging this is to CPS's case

## OUTPUT FORMAT (JSON):

{{
    "summary": "2-3 sentence overview of this document and its most critical issues",
    "document_type": "petition/safety_plan/court_order/report/letter/assessment/other",
    "overall_assessment": "HIGHLY PROBLEMATIC / PROBLEMATIC / CONCERNING / STANDARD",
    "credibility_score": 1-10 (10 = appears legitimate, 1 = full of problems),
    
    "fraud_and_perjury": [
        {{
            "finding": "Exact quote or description of fraudulent/perjurious statement",
            "explanation": "Why this is fraud/perjury",
            "evidence_contradiction": "How this contradicts facts/evidence",
            "legal_consequence": "Perjury charges, case dismissal, sanctions, etc.",
            "severity": "critical/high/medium"
        }}
    ],
    
    "constitutional_violations": [
        {{
            "amendment": "4th/5th/6th/14th/1st",
            "violation_type": "specific type (warrantless entry, etc.)",
            "description": "Detailed description of what happened",
            "legal_basis": "Case law or statute supporting this violation",
            "defense_strategy": "Motion to suppress, dismiss, etc.",
            "severity": "critical/high/medium"
        }}
    ],
    
    "procedural_violations": [
        {{
            "procedure_violated": "Name of procedure/policy",
            "description": "What they failed to do",
            "legal_requirement": "What law requires this procedure",
            "impact_on_case": "How this affects the family's rights",
            "remedy": "What relief to seek",
            "severity": "critical/high/medium"
        }}
    ],
    
    "evidentiary_issues": [
        {{
            "issue_type": "hearsay/speculation/no_foundation/etc.",
            "problematic_statement": "The specific statement",
            "why_inadmissible": "Evidentiary rule violated",
            "challenge_strategy": "Motion in limine, objection basis",
            "severity": "high/medium/low"
        }}
    ],
    
    "federal_law_violations": [
        {{
            "statute": "ASFA/CAPTA/ICWA/ADA/Title VI",
            "specific_violation": "What requirement was violated",
            "description": "Details of the violation",
            "remedy": "Federal complaint, dismissal motion, etc.",
            "severity": "critical/high/medium"
        }}
    ],
    
    "caseworker_misconduct": [
        {{
            "caseworker_name": "Name if mentioned",
            "misconduct_type": "bias/coercion/retaliation/etc.",
            "description": "What they did wrong",
            "evidence": "How we know this from the document",
            "complaint_basis": "Grounds for formal complaint",
            "severity": "critical/high/medium"
        }}
    ],
    
    "key_allegations": [
        {{
            "allegation": "The specific allegation",
            "basis": "What evidence (if any) supports it",
            "weaknesses": "Problems with this allegation",
            "defense": "How to refute this"
        }}
    ],
    
    "timeline_events": [
        {{
            "date": "YYYY-MM-DD or description",
            "event": "What happened",
            "legal_significance": "Why this matters legally",
            "deadline_triggered": "Any statutory deadline this triggers",
            "actors": ["People involved"]
        }}
    ],
    
    "named_individuals": [
        {{
            "name": "Full name",
            "role": "caseworker/supervisor/judge/attorney/witness/etc.",
            "actions_described": "What they did per this document",
            "potential_issues": "Any misconduct or problems with their actions"
        }}
    ],
    
    "defense_opportunities": [
        {{
            "opportunity": "Specific defense argument or strategy",
            "legal_basis": "Law or precedent supporting this",
            "likelihood_of_success": "strong/moderate/worth_trying",
            "how_to_execute": "Steps to pursue this defense"
        }}
    ],
    
    "motions_to_file": [
        {{
            "motion_type": "dismiss/suppress/continuance/etc.",
            "basis": "Grounds for the motion",
            "urgency": "immediate/soon/when_appropriate",
            "likelihood_of_success": "strong/moderate/possible"
        }}
    ],
    
    "questions_to_investigate": [
        "Things that need more information or investigation"
    ],
    
    "recommended_immediate_actions": [
        "Urgent steps the family should take NOW"
    ],
    
    "case_notes_to_add": [
        {{
            "note_title": "Brief title",
            "note_content": "Detailed note to add to case file",
            "importance": "critical/high/medium"
        }}
    ]
}}

REMEMBER: Be AGGRESSIVE. If there's ANY possibility of a violation, FLAG IT. 
This family's children may be at stake. Leave no stone unturned.
Find the FRAUD. Expose the LIES. Reveal the VIOLATIONS."""

    chat = LlmChat(
        api_key=EMERGENT_LLM_KEY,
        session_id=f"doc-analysis-{doc_id}",
        system_message=system_message
    ).with_model("openai", "gpt-5.2")
    
    prompt = f"""Analyze this CPS document uploaded by a parent in {state}:

FILENAME: {filename}

DOCUMENT CONTENT:
{content[:25000]}

Provide your complete analysis in JSON format. Be thorough - this parent's family is at stake."""

    response = await chat.send_message(UserMessage(text=prompt))
    
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
async def reanalyze_document(doc_id: str, current_user: dict = Depends(get_current_user)):
    """Re-run AI analysis on an existing document"""
    db = get_db()
    doc = await db.documents.find_one({"_id": doc_id, "user_id": current_user["user_id"]})
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    
    case = await get_case_with_ownership(doc["case_id"], current_user["user_id"])
    
    analysis_result = await analyze_uploaded_document(
        doc_id, doc["case_id"], case, doc.get("content", ""), 
        doc.get("filename", "document"), current_user["user_id"]
    )
    
    await db.documents.update_one(
        {"_id": doc_id},
        {"$set": {
            "analysis": analysis_result.get("analysis"),
            "extracted_violations": analysis_result.get("violations", []),
            "extracted_timeline": analysis_result.get("timeline", []),
            "reanalyzed_at": datetime.now(timezone.utc).isoformat()
        }}
    )
    
    return analysis_result


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


