"""
CPS Punisher - PDF Export Routes
Export notes and cases as PDF documents
"""
from io import BytesIO
from typing import Optional
from fastapi import APIRouter, HTTPException, Depends
from fastapi.responses import StreamingResponse

from database import get_db
from auth import get_current_user

router = APIRouter(prefix="/api/export", tags=["Export"])


@router.get("/notepad/all/pdf")
async def export_all_notes_to_pdf(
    case_id: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
    """Export all notepad entries as single PDF"""
    from reportlab.lib.pagesizes import letter
    from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
    from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, PageBreak
    from reportlab.lib.units import inch
    
    db = get_db()
    query = {"user_id": current_user["user_id"]}
    if case_id:
        query["case_id"] = case_id
    
    entries = []
    async for entry in db.notepad_entries.find(query).sort("created_at", -1):
        entries.append(entry)
    
    if not entries:
        raise HTTPException(status_code=404, detail="No notes found")
    
    buffer = BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=letter, topMargin=0.5*inch, bottomMargin=0.5*inch)
    styles = getSampleStyleSheet()
    
    title_style = ParagraphStyle('CustomTitle', parent=styles['Heading1'], fontSize=20, spaceAfter=20)
    
    story = []
    story.append(Paragraph("THE CPS PUNISHER - Legal Research Notebook", title_style))
    story.append(Paragraph(f"Total Notes: {len(entries)}", styles['Normal']))
    story.append(Spacer(1, 20))
    
    for i, entry in enumerate(entries):
        if i > 0:
            story.append(PageBreak())
        
        story.append(Paragraph(entry.get("title", "Untitled"), styles['Heading2']))
        story.append(Paragraph(f"Category: {entry.get('category', 'general')} | Created: {entry.get('created_at', 'N/A')[:10]}", styles['Italic']))
        story.append(Spacer(1, 10))
        
        content = entry.get("content", "").replace("\n", "<br/>")
        # Replace emoji characters with text equivalents
        for char, replacement in [("═", "-"), ("📋", "*"), ("📚", "*"), ("🏛️", "*"), ("📅", "*"), ("📝", "*"), ("🔗", "*"), ("⏱️", "*"), ("📜", "*"), ("⚖️", "*"), ("📖", "*"), ("📌", "*")]:
            content = content.replace(char, replacement)
        
        story.append(Paragraph(content, styles['Normal']))
    
    doc.build(story)
    buffer.seek(0)
    
    return StreamingResponse(
        buffer,
        media_type="application/pdf",
        headers={"Content-Disposition": "attachment; filename=cps_punisher_all_notes.pdf"}
    )


@router.get("/notepad/{entry_id}/pdf")
async def export_notepad_to_pdf(entry_id: str, current_user: dict = Depends(get_current_user)):
    """Export a notepad entry as PDF"""
    from reportlab.lib.pagesizes import letter
    from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
    from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer
    from reportlab.lib.units import inch
    
    db = get_db()
    entry = await db.notepad_entries.find_one({
        "_id": entry_id,
        "user_id": current_user["user_id"]
    })
    
    if not entry:
        raise HTTPException(status_code=404, detail="Note not found")
    
    buffer = BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=letter, topMargin=0.5*inch, bottomMargin=0.5*inch)
    styles = getSampleStyleSheet()
    
    title_style = ParagraphStyle('CustomTitle', parent=styles['Heading1'], fontSize=18, spaceAfter=20)
    body_style = ParagraphStyle('CustomBody', parent=styles['Normal'], fontSize=10, leading=14)
    
    story = []
    story.append(Paragraph("THE CPS PUNISHER - Legal Notepad", title_style))
    story.append(Paragraph(entry.get("title", "Untitled"), styles['Heading2']))
    story.append(Spacer(1, 12))
    
    content = entry.get("content", "").replace("\n", "<br/>")
    for char, replacement in [("═", "-"), ("📋", "*"), ("📚", "*"), ("🏛️", "*"), ("📅", "*"), ("📝", "*"), ("🔗", "*"), ("⏱️", "*"), ("📜", "*"), ("⚖️", "*"), ("📖", "*"), ("📌", "*")]:
        content = content.replace(char, replacement)
    
    story.append(Paragraph(content, body_style))
    story.append(Spacer(1, 20))
    story.append(Paragraph(f"Category: {entry.get('category', 'N/A')}", styles['Normal']))
    story.append(Paragraph(f"Created: {entry.get('created_at', 'N/A')}", styles['Normal']))
    
    doc.build(story)
    buffer.seek(0)
    
    filename = f"cps_punisher_note_{entry_id[:8]}.pdf"
    return StreamingResponse(
        buffer,
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )


@router.get("/case/{case_id}/pdf")
async def export_case_to_pdf(case_id: str, current_user: dict = Depends(get_current_user)):
    """Export full case summary as PDF"""
    from reportlab.lib.pagesizes import letter
    from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
    from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
    from reportlab.lib.units import inch
    from reportlab.lib import colors
    
    db = get_db()
    case = await db.cases.find_one({"_id": case_id, "user_id": current_user["user_id"]})
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")
    
    # Get related data
    violations = [v async for v in db.violations.find({"case_id": case_id})]
    timeline = [t async for t in db.timeline_events.find({"case_id": case_id}).sort("event_date", 1)]
    documents = [d async for d in db.documents.find({"case_id": case_id})]
    notes = [n async for n in db.notepad_entries.find({"case_id": case_id, "user_id": current_user["user_id"]})]
    
    buffer = BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=letter, topMargin=0.5*inch, bottomMargin=0.5*inch)
    styles = getSampleStyleSheet()
    
    title_style = ParagraphStyle('CustomTitle', parent=styles['Heading1'], fontSize=20, spaceAfter=20)
    section_style = ParagraphStyle('Section', parent=styles['Heading2'], fontSize=14, spaceBefore=15, spaceAfter=10)
    
    story = []
    
    # Header
    story.append(Paragraph("THE CPS PUNISHER", title_style))
    story.append(Paragraph("CASE SUMMARY REPORT", styles['Heading2']))
    story.append(Spacer(1, 20))
    
    # Case Info
    story.append(Paragraph("CASE INFORMATION", section_style))
    case_info = [
        ["Case Title:", case.get("title", "N/A")],
        ["State:", case.get("state", "N/A")],
        ["County:", case.get("county", "N/A")],
        ["Case Number:", case.get("case_number", "N/A")],
        ["Status:", case.get("status", "active")],
        ["Created:", case.get("created_at", "N/A")[:10] if case.get("created_at") else "N/A"]
    ]
    t = Table(case_info, colWidths=[2*inch, 4*inch])
    t.setStyle(TableStyle([
        ('FONTNAME', (0, 0), (-1, -1), 'Helvetica'),
        ('FONTSIZE', (0, 0), (-1, -1), 10),
        ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
    ]))
    story.append(t)
    story.append(Spacer(1, 15))
    
    # Violations
    if violations:
        story.append(Paragraph(f"VIOLATIONS IDENTIFIED ({len(violations)})", section_style))
        for v in violations:
            story.append(Paragraph(f"• {v.get('violation_type', 'Unknown')}: {v.get('description', '')[:100]}...", styles['Normal']))
        story.append(Spacer(1, 10))
    
    # Timeline
    if timeline:
        story.append(Paragraph(f"CASE TIMELINE ({len(timeline)} events)", section_style))
        for t in timeline[:10]:
            story.append(Paragraph(f"• {t.get('event_date', 'N/A')}: {t.get('title', 'Untitled')}", styles['Normal']))
        story.append(Spacer(1, 10))
    
    # Notes
    if notes:
        story.append(Paragraph(f"LEGAL NOTES ({len(notes)})", section_style))
        for n in notes[:5]:
            story.append(Paragraph(f"• {n.get('title', 'Untitled')} ({n.get('category', 'general')})", styles['Normal']))
    
    # Footer
    story.append(Spacer(1, 30))
    story.append(Paragraph("Generated by THE CPS PUNISHER - AI-Powered Legal Defense Platform", styles['Italic']))
    story.append(Paragraph("This document is for informational purposes only. Consult a licensed attorney.", styles['Italic']))
    
    doc.build(story)
    buffer.seek(0)
    
    filename = f"cps_case_{case_id[:8]}_summary.pdf"
    return StreamingResponse(
        buffer,
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )
