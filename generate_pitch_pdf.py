import os
import re
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, PageBreak
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER

def format_text(text):
    # Replace **text** with <b>text</b>
    text = re.sub(r'\*\*(.*?)\*\*', r'<b>\1</b>', text)
    # Escape & for reportlab/XML
    text = text.replace('&', '&amp;')
    return text

def generate_pdf():
    md_file = "pitch_deck.md"
    pdf_file = "Randevu_Dunyasi_Pitch_Deck.pdf"

    if not os.path.exists(md_file):
        print(f"Error: {md_file} not found.")
        return

    with open(md_file, "r", encoding="utf-8") as f:
        content = f.read()

    doc = SimpleDocTemplate(pdf_file, pagesize=letter, rightMargin=72, leftMargin=72, topMargin=72, bottomMargin=72)
    styles = getSampleStyleSheet()
    
    title_style = ParagraphStyle(
        'MainTitle',
        parent=styles['Title'],
        fontSize=24,
        spaceAfter=30,
        alignment=TA_CENTER,
        textColor=colors.HexColor("#0f172a")
    )
    
    heading_style = ParagraphStyle(
        'Heading',
        parent=styles['Heading1'],
        fontSize=18,
        spaceBefore=20,
        spaceAfter=15,
        textColor=colors.HexColor("#2563eb")
    )
    
    body_style = ParagraphStyle(
        'BodyTextCustom',
        parent=styles['Normal'],
        fontSize=11,
        leading=16,
        spaceAfter=8
    )

    quote_style = ParagraphStyle(
        'Quote',
        parent=styles['Normal'],
        fontSize=13,
        italic=True,
        alignment=TA_CENTER,
        textColor=colors.grey,
        spaceAfter=25
    )

    story = []
    lines = content.split('\n')
    
    for line in lines:
        line = line.strip()
        if not line:
            continue
            
        if line.startswith("# "):
            story.append(Paragraph(format_text(line[2:].replace("🚀 ", "")), title_style))
        elif line.startswith("> "):
            story.append(Paragraph(format_text(line[2:]), quote_style))
        elif line.startswith("## "):
            story.append(Paragraph(format_text(line[3:]), heading_style))
        elif line.startswith("- "):
            story.append(Paragraph(f"• {format_text(line[2:])}", body_style))
        else:
            # Clean up other markdown artifacts
            clean_line = line.replace("### ", "").replace("---", "")
            if clean_line.strip() and "|" not in clean_line:
                story.append(Paragraph(format_text(clean_line), body_style))

    doc.build(story)
    print(f"Successfully generated {pdf_file}")

if __name__ == "__main__":
    generate_pdf()
