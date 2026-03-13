"""Export routes - PDF generation"""
import uuid
import io
from datetime import datetime, timezone
from typing import Optional
from fastapi import APIRouter, HTTPException, Depends
from fastapi.responses import StreamingResponse

from database import get_db
from auth import get_current_user
from utils.credits import get_case_with_ownership, require_tier

router = APIRouter()

@router.get("/api/export/notepad/all/pdf")
async def export_all_notes_to_pdf(
    case_id: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
    """Export all notepad entries as single PDF"""
    db = get_db()
    from io import BytesIO
    from reportlab.lib.pagesizes import letter
    from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
    from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, PageBreak
    from reportlab.lib.units import inch
    from fastapi.responses import StreamingResponse
    
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
        content = content.replace("═", "-").replace("📋", "*").replace("📚", "*")
        content = content.replace("🏛️", "*").replace("📅", "*").replace("📝", "*")
        content = content.replace("🔗", "*").replace("⏱️", "*").replace("📜", "*")
        content = content.replace("⚖️", "*").replace("📖", "*").replace("📌", "*")
        
        story.append(Paragraph(content, styles['Normal']))
    
    doc.build(story)
    buffer.seek(0)
    
    filename = f"cps_punisher_all_notes.pdf"
    return StreamingResponse(
        buffer,
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )


@router.get("/api/export/notepad/{entry_id}/pdf")
async def export_notepad_to_pdf(entry_id: str, current_user: dict = Depends(get_current_user)):
    """Export a notepad entry as PDF"""
    db = get_db()
    from io import BytesIO
    from reportlab.lib.pagesizes import letter
    from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
    from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer
    from reportlab.lib.units import inch
    from fastapi.responses import StreamingResponse
    
    entry = await db.notepad_entries.find_one({
        "_id": entry_id,
        "user_id": current_user["user_id"]
    })
    
    if not entry:
        raise HTTPException(status_code=404, detail="Note not found")
    
    buffer = BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=letter, topMargin=0.5*inch, bottomMargin=0.5*inch)
    styles = getSampleStyleSheet()
    
    # Custom styles
    title_style = ParagraphStyle('CustomTitle', parent=styles['Heading1'], fontSize=18, spaceAfter=20)
    body_style = ParagraphStyle('CustomBody', parent=styles['Normal'], fontSize=10, leading=14)
    
    story = []
    story.append(Paragraph(f"THE CPS PUNISHER - Legal Notepad", title_style))
    story.append(Paragraph(entry.get("title", "Untitled"), styles['Heading2']))
    story.append(Spacer(1, 12))
    
    # Convert content - handle special characters
    content = entry.get("content", "").replace("\n", "<br/>")
    content = content.replace("═", "-").replace("📋", "*").replace("📚", "*")
    content = content.replace("🏛️", "*").replace("📅", "*").replace("📝", "*")
    content = content.replace("🔗", "*").replace("⏱️", "*").replace("📜", "*")
    content = content.replace("⚖️", "*").replace("📖", "*").replace("📌", "*")
    
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

@router.get("/api/export/case/{case_id}/pdf")
async def export_case_to_pdf(case_id: str, current_user: dict = Depends(get_current_user)):
    """Export full case summary as PDF"""
    db = get_db()
    from io import BytesIO
    from reportlab.lib.pagesizes import letter
    from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
    from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
    from reportlab.lib.units import inch
    from reportlab.lib import colors
    from fastapi.responses import StreamingResponse
    
    # Get case
    case = await db.cases.find_one({"_id": case_id, "user_id": current_user["user_id"]})
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")
    
    # Get related data
    violations = []
    async for v in db.violations.find({"case_id": case_id}):
        violations.append(v)
    
    timeline = []
    async for t in db.timeline_events.find({"case_id": case_id}).sort("event_date", 1):
        timeline.append(t)
    
    documents = []
    async for d in db.documents.find({"case_id": case_id}):
        documents.append(d)
    
    notes = []
    async for n in db.notepad_entries.find({"case_id": case_id, "user_id": current_user["user_id"]}):
        notes.append(n)
    
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
        for t in timeline[:10]:  # Limit to 10
            story.append(Paragraph(f"• {t.get('event_date', 'N/A')}: {t.get('title', 'Untitled')}", styles['Normal']))
        story.append(Spacer(1, 10))
    
    # Notes
    if notes:
        story.append(Paragraph(f"LEGAL NOTES ({len(notes)})", section_style))
        for n in notes[:5]:  # Limit to 5
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


# ============== CASE PREPARATION KIT ==============

@router.get("/api/export/case/{case_id}/preparation-kit")
async def export_case_preparation_kit(case_id: str, current_user: dict = Depends(require_tier("attorney", feature_key="case_prep_kit"))):
    """
    Generate comprehensive Court Preparation Kit PDF
    Includes: Case info, violations, timeline, evidence, documents, notes, strategies
    """
    db = get_db()
    from io import BytesIO
    from reportlab.lib.pagesizes import letter
    from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
    from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, PageBreak, Table, TableStyle, Image
    from reportlab.lib.units import inch
    from reportlab.lib import colors
    from reportlab.lib.enums import TA_CENTER, TA_LEFT
    from fastapi.responses import StreamingResponse
    
    # Get case with ownership check
    case = await db.cases.find_one({"_id": case_id, "user_id": current_user["user_id"]})
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")
    
    # Gather ALL case data
    violations = []
    async for v in db.violations.find({"case_id": case_id}).sort("date_occurred", -1):
        violations.append(v)
    
    timeline = []
    async for t in db.timeline_events.find({"case_id": case_id}).sort("event_date", 1):
        timeline.append(t)
    
    evidence = []
    async for e in db.evidence_items.find({"case_id": case_id}):
        evidence.append(e)
    
    documents = []
    async for d in db.documents.find({"case_id": case_id}):
        documents.append(d)
    
    notes = []
    async for n in db.notepad_entries.find({"case_id": case_id, "user_id": current_user["user_id"]}):
        notes.append(n)
    
    strategies = []
    async for s in db.strategies.find({"case_id": case_id}):
        strategies.append(s)
    
    communications = []
    async for c in db.communications.find({"case_id": case_id}).sort("date", -1):
        communications.append(c)
    
    court_filings = []
    async for f in db.court_filings.find({"case_id": case_id}).sort("filed_date", -1):
        court_filings.append(f)
    
    # Create PDF
    buffer = BytesIO()
    doc = SimpleDocTemplate(
        buffer, 
        pagesize=letter, 
        topMargin=0.75*inch, 
        bottomMargin=0.75*inch,
        leftMargin=0.75*inch,
        rightMargin=0.75*inch
    )
    styles = getSampleStyleSheet()
    
    # Custom styles
    title_style = ParagraphStyle(
        'KitTitle', 
        parent=styles['Heading1'], 
        fontSize=24, 
        spaceAfter=10,
        alignment=TA_CENTER,
        textColor=colors.darkred
    )
    subtitle_style = ParagraphStyle(
        'KitSubtitle',
        parent=styles['Normal'],
        fontSize=12,
        alignment=TA_CENTER,
        textColor=colors.gray,
        spaceAfter=30
    )
    section_style = ParagraphStyle(
        'Section', 
        parent=styles['Heading2'], 
        fontSize=16, 
        spaceBefore=20, 
        spaceAfter=12,
        textColor=colors.darkblue,
        borderWidth=1,
        borderColor=colors.darkblue,
        borderPadding=5
    )
    subsection_style = ParagraphStyle(
        'Subsection',
        parent=styles['Heading3'],
        fontSize=12,
        spaceBefore=10,
        spaceAfter=6,
        textColor=colors.black
    )
    body_style = ParagraphStyle(
        'KitBody',
        parent=styles['Normal'],
        fontSize=10,
        leading=14,
        spaceAfter=6
    )
    bullet_style = ParagraphStyle(
        'KitBullet',
        parent=styles['Normal'],
        fontSize=10,
        leading=12,
        leftIndent=20,
        spaceAfter=4
    )
    
    story = []
    
    # ===== COVER PAGE =====
    story.append(Spacer(1, 1*inch))
    story.append(Paragraph("THE CPS PUNISHER", title_style))
    story.append(Paragraph("COURT PREPARATION KIT", ParagraphStyle('SubTitle', parent=title_style, fontSize=18, textColor=colors.black)))
    story.append(Spacer(1, 0.5*inch))
    story.append(Paragraph(f"Case: {case.get('title', 'Untitled Case')}", subtitle_style))
    story.append(Paragraph(f"State: {case.get('state', 'N/A')} | County: {case.get('county', 'N/A')}", subtitle_style))
    story.append(Paragraph(f"Case Number: {case.get('case_number', 'N/A')}", subtitle_style))
    story.append(Spacer(1, 0.5*inch))
    
    # Stats summary
    stats_data = [
        ["DOCUMENT SUMMARY", ""],
        ["Total Violations Identified:", str(len(violations))],
        ["Timeline Events:", str(len(timeline))],
        ["Evidence Items:", str(len(evidence))],
        ["Documents Analyzed:", str(len(documents))],
        ["Legal Notes:", str(len(notes))],
        ["Defense Strategies:", str(len(strategies))],
        ["Communications Logged:", str(len(communications))],
        ["Court Filings:", str(len(court_filings))],
    ]
    stats_table = Table(stats_data, colWidths=[3*inch, 2*inch])
    stats_table.setStyle(TableStyle([
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 12),
        ('BACKGROUND', (0, 0), (-1, 0), colors.lightgrey),
        ('FONTNAME', (0, 1), (0, -1), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 1), (-1, -1), 10),
        ('ALIGN', (1, 0), (1, -1), 'CENTER'),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
        ('TOPPADDING', (0, 0), (-1, -1), 8),
    ]))
    story.append(stats_table)
    story.append(Spacer(1, 0.5*inch))
    
    generation_date = datetime.now(timezone.utc).strftime("%B %d, %Y at %H:%M UTC")
    story.append(Paragraph(f"Generated: {generation_date}", ParagraphStyle('Date', parent=styles['Italic'], alignment=TA_CENTER)))
    story.append(PageBreak())
    
    # ===== TABLE OF CONTENTS =====
    story.append(Paragraph("TABLE OF CONTENTS", section_style))
    toc_items = [
        "1. Case Information",
        "2. Identified Violations",
        "3. Case Timeline",
        "4. Evidence Inventory",
        "5. Document Analysis",
        "6. Legal Research Notes",
        "7. Defense Strategies",
        "8. Communication Log",
        "9. Court Filings",
        "10. Legal Disclaimers"
    ]
    for item in toc_items:
        story.append(Paragraph(item, body_style))
    story.append(PageBreak())
    
    # ===== 1. CASE INFORMATION =====
    story.append(Paragraph("1. CASE INFORMATION", section_style))
    
    case_info_data = [
        ["Field", "Value"],
        ["Case Title", case.get("title", "N/A")],
        ["Case Number", case.get("case_number", "N/A")],
        ["State", case.get("state", "N/A")],
        ["County", case.get("county", "N/A")],
        ["Status", case.get("status", "active").upper()],
        ["Date Opened", case.get("date_opened", "N/A")],
        ["Caseworker", case.get("caseworker_name", "N/A")],
        ["Judge", case.get("judge_name", "N/A")],
        ["Court", case.get("court_name", "N/A")],
        ["Attorney", case.get("attorney_name", "N/A")],
    ]
    
    if case.get("children_names"):
        case_info_data.append(["Children", ", ".join(case.get("children_names", []))])
    
    case_table = Table(case_info_data, colWidths=[2*inch, 4.5*inch])
    case_table.setStyle(TableStyle([
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('BACKGROUND', (0, 0), (-1, 0), colors.darkblue),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('FONTNAME', (0, 1), (0, -1), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 10),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
        ('TOPPADDING', (0, 0), (-1, -1), 8),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
    ]))
    story.append(case_table)
    
    if case.get("description"):
        story.append(Spacer(1, 15))
        story.append(Paragraph("Case Description:", subsection_style))
        story.append(Paragraph(case.get("description", ""), body_style))
    
    story.append(PageBreak())
    
    # ===== 2. VIOLATIONS =====
    story.append(Paragraph("2. IDENTIFIED VIOLATIONS", section_style))
    
    if violations:
        story.append(Paragraph(f"Total violations identified: {len(violations)}", body_style))
        story.append(Spacer(1, 10))
        
        for i, v in enumerate(violations, 1):
            story.append(Paragraph(f"Violation #{i}: {v.get('violation_type', 'Unknown')}", subsection_style))
            
            v_data = [
                ["Severity:", v.get("severity", "medium").upper()],
                ["Date Occurred:", v.get("date_occurred", "N/A")],
                ["Description:", v.get("description", "No description")[:500]],
            ]
            if v.get("evidence_notes"):
                v_data.append(["Evidence Notes:", v.get("evidence_notes", "")[:300]])
            
            for row in v_data:
                story.append(Paragraph(f"<b>{row[0]}</b> {row[1]}", bullet_style))
            story.append(Spacer(1, 10))
    else:
        story.append(Paragraph("No violations have been documented yet.", body_style))
    
    story.append(PageBreak())
    
    # ===== 3. TIMELINE =====
    story.append(Paragraph("3. CASE TIMELINE", section_style))
    
    if timeline:
        story.append(Paragraph(f"Total events: {len(timeline)}", body_style))
        story.append(Spacer(1, 10))
        
        timeline_data = [["Date", "Event", "Type"]]
        for t in timeline:
            timeline_data.append([
                t.get("event_date", "N/A")[:10] if t.get("event_date") else "N/A",
                t.get("title", "Untitled")[:50],
                t.get("event_type", "general")
            ])
        
        timeline_table = Table(timeline_data, colWidths=[1.2*inch, 3.8*inch, 1.5*inch])
        timeline_table.setStyle(TableStyle([
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('BACKGROUND', (0, 0), (-1, 0), colors.darkblue),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
            ('FONTSIZE', (0, 0), (-1, -1), 9),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
            ('TOPPADDING', (0, 0), (-1, -1), 6),
            ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ]))
        story.append(timeline_table)
    else:
        story.append(Paragraph("No timeline events have been documented yet.", body_style))
    
    story.append(PageBreak())
    
    # ===== 4. EVIDENCE =====
    story.append(Paragraph("4. EVIDENCE INVENTORY", section_style))
    
    if evidence:
        story.append(Paragraph(f"Total evidence items: {len(evidence)}", body_style))
        story.append(Spacer(1, 10))
        
        for i, e in enumerate(evidence, 1):
            story.append(Paragraph(f"Evidence #{i}: {e.get('title', 'Untitled')}", subsection_style))
            story.append(Paragraph(f"<b>Type:</b> {e.get('evidence_type', 'document')}", bullet_style))
            story.append(Paragraph(f"<b>Source:</b> {e.get('source', 'N/A')}", bullet_style))
            story.append(Paragraph(f"<b>Date Collected:</b> {e.get('date_collected', 'N/A')}", bullet_style))
            story.append(Paragraph(f"<b>Description:</b> {e.get('description', '')[:300]}", bullet_style))
            story.append(Spacer(1, 8))
    else:
        story.append(Paragraph("No evidence items have been catalogued yet.", body_style))
    
    story.append(PageBreak())
    
    # ===== 5. DOCUMENTS =====
    story.append(Paragraph("5. DOCUMENT ANALYSIS", section_style))
    
    if documents:
        story.append(Paragraph(f"Total documents analyzed: {len(documents)}", body_style))
        story.append(Spacer(1, 10))
        
        for i, d in enumerate(documents, 1):
            story.append(Paragraph(f"Document #{i}: {d.get('filename', d.get('title', 'Untitled'))}", subsection_style))
            story.append(Paragraph(f"<b>Type:</b> {d.get('document_type', 'general')}", bullet_style))
            story.append(Paragraph(f"<b>Uploaded:</b> {d.get('created_at', 'N/A')[:10] if d.get('created_at') else 'N/A'}", bullet_style))
            
            if d.get("ai_analysis"):
                analysis = d.get("ai_analysis", "")[:500]
                story.append(Paragraph(f"<b>AI Analysis:</b> {analysis}...", bullet_style))
            story.append(Spacer(1, 8))
    else:
        story.append(Paragraph("No documents have been uploaded for analysis yet.", body_style))
    
    story.append(PageBreak())
    
    # ===== 6. LEGAL NOTES =====
    story.append(Paragraph("6. LEGAL RESEARCH NOTES", section_style))
    
    if notes:
        # Group by category
        categories = {}
        for n in notes:
            cat = n.get("category", "general")
            if cat not in categories:
                categories[cat] = []
            categories[cat].append(n)
        
        for cat, cat_notes in categories.items():
            story.append(Paragraph(f"{cat.upper()} ({len(cat_notes)} notes)", subsection_style))
            for n in cat_notes[:5]:  # Limit to 5 per category
                story.append(Paragraph(f"• <b>{n.get('title', 'Untitled')}</b>", bullet_style))
                if n.get("source_type"):
                    story.append(Paragraph(f"  Source: {n.get('source_type')}", ParagraphStyle('Source', parent=bullet_style, fontSize=9, textColor=colors.gray)))
            story.append(Spacer(1, 8))
    else:
        story.append(Paragraph("No legal research notes have been saved yet.", body_style))
    
    story.append(PageBreak())
    
    # ===== 7. STRATEGIES =====
    story.append(Paragraph("7. DEFENSE STRATEGIES", section_style))
    
    if strategies:
        for i, s in enumerate(strategies, 1):
            story.append(Paragraph(f"Strategy #{i}: {s.get('title', 'Untitled')}", subsection_style))
            story.append(Paragraph(f"<b>Type:</b> {s.get('strategy_type', 'general')}", bullet_style))
            content = s.get("content", "")[:800]
            # Clean content for PDF
            content = content.replace("\n", " ").replace("•", "-")
            story.append(Paragraph(content, body_style))
            story.append(Spacer(1, 10))
    else:
        story.append(Paragraph("No defense strategies have been generated yet.", body_style))
    
    story.append(PageBreak())
    
    # ===== 8. COMMUNICATIONS =====
    story.append(Paragraph("8. COMMUNICATION LOG", section_style))
    
    if communications:
        story.append(Paragraph(f"Total communications logged: {len(communications)}", body_style))
        story.append(Spacer(1, 10))
        
        comm_data = [["Date", "Type", "Contact", "Summary"]]
        for c in communications[:20]:  # Limit to 20
            comm_data.append([
                c.get("date", "N/A")[:10] if c.get("date") else "N/A",
                c.get("communication_type", "N/A")[:15],
                c.get("contact_name", "N/A")[:20],
                c.get("summary", "")[:40] + "..."
            ])
        
        comm_table = Table(comm_data, colWidths=[1*inch, 1.2*inch, 1.5*inch, 2.8*inch])
        comm_table.setStyle(TableStyle([
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('BACKGROUND', (0, 0), (-1, 0), colors.darkblue),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
            ('FONTSIZE', (0, 0), (-1, -1), 8),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
            ('TOPPADDING', (0, 0), (-1, -1), 5),
        ]))
        story.append(comm_table)
    else:
        story.append(Paragraph("No communications have been logged yet.", body_style))
    
    story.append(PageBreak())
    
    # ===== 9. COURT FILINGS =====
    story.append(Paragraph("9. COURT FILINGS", section_style))
    
    if court_filings:
        for i, f in enumerate(court_filings, 1):
            story.append(Paragraph(f"Filing #{i}: {f.get('title', 'Untitled')}", subsection_style))
            story.append(Paragraph(f"<b>Type:</b> {f.get('filing_type', 'N/A')}", bullet_style))
            story.append(Paragraph(f"<b>Filed Date:</b> {f.get('filed_date', 'N/A')}", bullet_style))
            story.append(Paragraph(f"<b>Status:</b> {f.get('status', 'filed')}", bullet_style))
            story.append(Spacer(1, 8))
    else:
        story.append(Paragraph("No court filings have been recorded yet.", body_style))
    
    story.append(PageBreak())
    
    # ===== 10. DISCLAIMERS =====
    story.append(Paragraph("10. LEGAL DISCLAIMERS", section_style))
    
    disclaimers = [
        "This document is generated by THE CPS PUNISHER, an AI-powered legal research and case management tool.",
        "This document is for INFORMATIONAL PURPOSES ONLY and does not constitute legal advice.",
        "Always consult with a licensed attorney before taking any legal action.",
        "The accuracy of information in this document depends on the data entered by the user.",
        "AI-generated analyses and strategies should be reviewed by qualified legal counsel.",
        "This document may contain sensitive personal information and should be handled confidentially.",
        "THE CPS PUNISHER and its creators are not responsible for any actions taken based on this document."
    ]
    
    for d in disclaimers:
        story.append(Paragraph(f"• {d}", bullet_style))
    
    story.append(Spacer(1, 30))
    story.append(Paragraph("— END OF COURT PREPARATION KIT —", ParagraphStyle('End', parent=styles['Italic'], alignment=TA_CENTER)))
    
    # Build PDF
    doc.build(story)
    buffer.seek(0)
    
    # Generate filename
    case_title_clean = "".join(c for c in case.get("title", "case")[:20] if c.isalnum() or c in " -_").strip().replace(" ", "_")
    filename = f"CPS_Punisher_Court_Kit_{case_title_clean}_{case_id[:8]}.pdf"
    
    return StreamingResponse(
        buffer,
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )