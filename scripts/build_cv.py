"""Build the downloadable CV from the same profile used by the portfolio."""
import json
from pathlib import Path
from xml.sax.saxutils import escape

from reportlab.lib import colors
from reportlab.lib.enums import TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import (
    HRFlowable, KeepTogether, PageBreak, Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle,
)

ROOT = Path(__file__).resolve().parents[1]
PROFILE = json.loads((ROOT / 'profile.json').read_text(encoding='utf-8'))
OUTPUT = ROOT / 'public' / 'assets' / 'Huaike_Yu_CV.pdf'
OUTPUT.parent.mkdir(parents=True, exist_ok=True)

font_dir = Path('C:/Windows/Fonts')
if (font_dir / 'arial.ttf').exists():
    pdfmetrics.registerFont(TTFont('CV', str(font_dir / 'arial.ttf')))
    pdfmetrics.registerFont(TTFont('CV-Bold', str(font_dir / 'arialbd.ttf')))
    pdfmetrics.registerFontFamily('CV', normal='CV', bold='CV-Bold')
    FONT, BOLD = 'CV', 'CV-Bold'
else:
    FONT, BOLD = 'Helvetica', 'Helvetica-Bold'

INK = colors.HexColor('#253447')
MUTED = colors.HexColor('#58677A')
ACCENT = colors.HexColor('#6550A0')
styles = {
    'name': ParagraphStyle('name', fontName=BOLD, fontSize=27, leading=32, textColor=INK, spaceAfter=5),
    'role': ParagraphStyle('role', fontName=BOLD, fontSize=10.5, leading=14, textColor=INK, spaceAfter=3),
    'body': ParagraphStyle('body', fontName=FONT, fontSize=9, leading=12.5, textColor=INK, spaceAfter=3),
    'muted': ParagraphStyle('muted', fontName=FONT, fontSize=8.5, leading=11.5, textColor=MUTED, spaceAfter=3),
    'heading': ParagraphStyle('heading', fontName=BOLD, fontSize=11, leading=14, textColor=ACCENT, spaceBefore=13, spaceAfter=7, keepWithNext=True),
    'entry': ParagraphStyle('entry', fontName=BOLD, fontSize=9.5, leading=12.5, textColor=INK, spaceAfter=3),
    'bullet': ParagraphStyle('bullet', fontName=FONT, fontSize=8.8, leading=12, textColor=INK, leftIndent=9, firstLineIndent=-9, spaceAfter=2),
}

def clean(text):
    return text.replace('–', '-').replace('—', '-').replace('’', "'").replace('‘', "'").replace('→', 'to')

def p(text, style='body'):
    return Paragraph(escape(clean(text)), styles[style])

def heading(text):
    return p(text.upper(), 'heading')

def footer(canvas, doc):
    canvas.saveState()
    width, _ = A4
    canvas.setStrokeColor(colors.HexColor('#DBDFE6'))
    canvas.line(45, 35, width - 45, 35)
    canvas.setFont(FONT, 8)
    canvas.setFillColor(MUTED)
    canvas.drawString(45, 23, 'Huaike Yu | Curriculum Vitae')
    canvas.drawRightString(width - 45, 23, str(doc.page))
    canvas.restoreState()

story = [
    p(PROFILE['name'], 'name'),
    p(PROFILE['role'], 'role'),
    p(PROFILE['institution']),
    Paragraph(f'<link href="mailto:{PROFILE["email"]}" color="#6550A0">{PROFILE["email"]}</link>', styles['body']),
    Spacer(1, 6),
    HRFlowable(width='100%', thickness=1, color=colors.HexColor('#D8D0EA')),
    heading('Research'),
    p('Interests: ' + ', '.join(PROFILE['researchInterests']) + '.'),
    p(f'Research guidance: {PROFILE["guidance"]} ({PROFILE["guidanceInstitution"]}).', 'muted'),
    heading('Education'),
]
for education in PROFILE['education']:
    story.append(KeepTogether([
        p(education['institution'], 'entry'),
        p(education['degree']),
        p(education['period'], 'muted'),
        Spacer(1, 5),
    ]))

story.append(heading('Internships & Campus Practice'))
for experience in PROFILE['experience']:
    block = [
        p(experience['institution'], 'entry'),
        p(f'{experience["role"]} | {experience["period"]} | {experience["kind"]}', 'muted'),
        *[p('- ' + detail, 'bullet') for detail in experience['details']],
    ]
    if 'institutionNote' in experience:
        block.append(p(experience['institutionNote'], 'muted'))
    block.append(Spacer(1, 6))
    story.append(KeepTogether(block))

story.extend([PageBreak(), heading('Publications & Preprints')])
for number, paper in enumerate(PROFILE['publications'], 1):
    authors = escape(clean(', '.join(paper['authors']))).replace('Huaike Yu', '<b>Huaike Yu</b>')
    venue = escape(clean(f'{paper["venue"]} | {paper["year"]} | {paper["status"]}'))
    story.append(KeepTogether([
        p(f'{number}. {paper["title"]}', 'entry'),
        Paragraph(authors, styles['muted']),
        Paragraph(f'<link href="{escape(paper["url"])}" color="#6550A0">{venue}</link>', styles['muted']),
        Spacer(1, 7),
    ]))

story.append(heading('Research Project Participation'))
for project in PROFILE['projects']:
    story.append(KeepTogether([
        p(project['program'], 'entry'),
        p(project['role'] + ' | ' + ', '.join(project['identifiers']), 'muted'),
        Spacer(1, 4),
    ]))

story.append(heading('Skills & Competencies'))
skill_rows = [[p(skill['category'], 'entry'), p(', '.join(skill['items']))] for skill in PROFILE['skills']]
table = Table(skill_rows, colWidths=[132, A4[0] - 90 - 132], hAlign='LEFT')
table.setStyle(TableStyle([
    ('VALIGN', (0, 0), (-1, -1), 'TOP'),
    ('LEFTPADDING', (0, 0), (-1, -1), 0),
    ('RIGHTPADDING', (0, 0), (-1, -1), 8),
    ('TOPPADDING', (0, 0), (-1, -1), 1),
    ('BOTTOMPADDING', (0, 0), (-1, -1), 1),
]))
story.append(table)

doc = SimpleDocTemplate(
    str(OUTPUT), pagesize=A4, topMargin=38, bottomMargin=47,
    leftMargin=45, rightMargin=45, title='Huaike Yu - Curriculum Vitae',
    author=PROFILE['name'], subject='Academic profile, education, research, publications, experience, and skills',
)
doc.build(story, onFirstPage=footer, onLaterPages=footer)
print(OUTPUT)
