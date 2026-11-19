from __future__ import annotations

import hashlib
import html
import re
from pathlib import Path
from unicodedata import east_asian_width

from pypdf import PdfReader, PdfWriter
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import (
    CondPageBreak,
    HRFlowable,
    Image,
    KeepTogether,
    PageBreak,
    Paragraph,
    SimpleDocTemplate,
    Spacer,
    Table,
    TableStyle,
)
from reportlab.platypus.tableofcontents import TableOfContents

ROOT = Path(__file__).resolve().parents[2]
BASE = Path(__file__).resolve().parent
EVIDENCE = BASE.parent
ASSETS = EVIDENCE / 'multimodal-assets'
DATA = BASE / 'data'
OUT = ROOT / 'pdf/marketing-growth-112h-study-package-2026-11-18.pdf'
TMP = ROOT / 'tmp/pdfs/marketing-growth-112h/base.pdf'
FONT_DIR = ROOT / 'tooling/fonts'

pdfmetrics.registerFont(TTFont('Free', str(FONT_DIR / 'Freesentation-4Regular.ttf')))
pdfmetrics.registerFont(TTFont('FreeBold', str(FONT_DIR / 'Freesentation-7Bold.ttf')))
pdfmetrics.registerFontFamily('Free', normal='Free', bold='FreeBold')

NAVY = colors.HexColor('#15304B')
BLUE = colors.HexColor('#126F91')
GRAY = colors.HexColor('#4F6170')
PALE = colors.HexColor('#F2F6F8')
CREAM = colors.HexColor('#FFF5E8')
RULE = colors.HexColor('#CBD9E1')
PAGE_WIDTH = A4[0] - 100

S = {
    'cover': ParagraphStyle('cover', fontName='FreeBold', fontSize=27, leading=37, textColor=NAVY, spaceAfter=13),
    'cover_sub': ParagraphStyle('cover_sub', fontName='Free', fontSize=12, leading=19, textColor=GRAY, spaceAfter=13),
    'part': ParagraphStyle('part', fontName='FreeBold', fontSize=21, leading=30, textColor=NAVY, spaceAfter=15),
    'chapter': ParagraphStyle('chapter', fontName='FreeBold', fontSize=17, leading=25, textColor=NAVY, spaceBefore=4, spaceAfter=12, keepWithNext=True),
    'unit': ParagraphStyle('unit', fontName='FreeBold', fontSize=12.5, leading=20, textColor=BLUE, spaceBefore=15, spaceAfter=8, keepWithNext=True),
    'section': ParagraphStyle('section', fontName='FreeBold', fontSize=11.6, leading=18, textColor=BLUE, spaceBefore=12, spaceAfter=6, keepWithNext=True),
    'body': ParagraphStyle('body', fontName='Free', fontSize=10.0, leading=17.2, textColor=NAVY, spaceAfter=8),
    'small': ParagraphStyle('small', fontName='Free', fontSize=8.3, leading=13, textColor=GRAY, spaceAfter=6),
    'cell': ParagraphStyle('cell', fontName='Free', fontSize=8.0, leading=12, textColor=NAVY),
    'cellh': ParagraphStyle('cellh', fontName='FreeBold', fontSize=8.0, leading=12, textColor=colors.white),
    'toc0': ParagraphStyle('toc0', fontName='FreeBold', fontSize=9.7, leading=16, textColor=NAVY, leftIndent=8, firstLineIndent=-8, spaceAfter=3),
    'toc1': ParagraphStyle('toc1', fontName='Free', fontSize=8.8, leading=14, textColor=GRAY, leftIndent=22, firstLineIndent=-8, spaceAfter=2),
    'callout': ParagraphStyle('callout', fontName='FreeBold', fontSize=9.5, leading=16, textColor=NAVY),
    'caption': ParagraphStyle('caption', fontName='Free', fontSize=8.2, leading=12, textColor=GRAY),
}

def inline(text: str, source_dir: Path) -> str:
    held: list[tuple[str, str]] = []
    def take(m):
        held.append((m.group(1), m.group(2)))
        return f'URLTOKEN{len(held)-1}END'
    text = re.sub(r'\[([^\]]+)\]\(([^)]+)\)', take, text)
    text = html.escape(text, quote=False)
    text = re.sub(r'\*\*(.+?)\*\*', r'<b>\1</b>', text)
    text = re.sub(r'`([^`]+)`', r'<font color="#126F91"><b>\1</b></font>', text)
    for i, (label, url) in enumerate(held):
        target = url if url.startswith(('http://','https://')) else (source_dir / url.split('#')[0]).resolve().as_uri()
        text = text.replace(f'URLTOKEN{i}END', f'<link href="{html.escape(target, quote=True)}" color="#126F91">{html.escape(label)}</link>')
    return text

def P(text: str, style: str, source_dir: Path):
    return Paragraph(inline(text, source_dir), S[style])

def display_len(text: str) -> int:
    return sum(2 if east_asian_width(c) in ('W', 'F') else 1 for c in re.sub(r'\*\*|`', '', text))

def make_table(rows: list[list[str]], source_dir: Path):
    n = len(rows[0])
    maxes = [max(display_len(r[i]) for r in rows) for i in range(n)]
    weights = [max(8, min(32, x)) for x in maxes]
    widths = [PAGE_WIDTH * x / sum(weights) for x in weights]
    if n == 5 and rows[0][:2] == ['파일', '행 수']:
        widths = [174, 48, 104, 70, PAGE_WIDTH - 396]
    font_size = 7.2 if n >= 7 else 7.8 if n >= 5 else 8.2
    cell = ParagraphStyle('c', parent=S['cell'], fontSize=font_size, leading=font_size+4)
    head = ParagraphStyle('h', parent=S['cellh'], fontSize=font_size, leading=font_size+4)
    data = [[Paragraph(inline(v, source_dir), head if i == 0 else cell) for v in row] for i, row in enumerate(rows)]
    t = Table(data, colWidths=widths, repeatRows=1, hAlign='LEFT')
    t.setStyle(TableStyle([
        ('BACKGROUND',(0,0),(-1,0),NAVY),
        ('ROWBACKGROUNDS',(0,1),(-1,-1),[colors.white, PALE]),
        ('VALIGN',(0,0),(-1,-1),'TOP'),
        ('LEFTPADDING',(0,0),(-1,-1),6),
        ('RIGHTPADDING',(0,0),(-1,-1),6),
        ('TOPPADDING',(0,0),(-1,-1),5),
        ('BOTTOMPADDING',(0,0),(-1,-1),5),
        ('LINEBELOW',(0,-1),(-1,-1),.4,RULE),
    ]))
    return t

RECORD_LABELS = {
    'M1-1':['목표·대상·기간','KPI 분자·분모','부족한 데이터'],
    'M1-2':['원천 합계','재계산한 지표','차이·검산 기록'],
    'M1-3':['관찰값','경쟁 설명','추가 확인 자료'],
    'M1-4':['변경 가설','성공·보호 지표','중단·확대 기준'],
    'M2-1':['이벤트 정의','사용자·세션·이벤트 수','누락·중복 후보'],
    'M2-2':['퍼널 단계·단위','채널 범위·귀속','설정 차이'],
    'M2-3':['차트 원천 수치','총계 재계산','불일치 원인'],
    'M2-4':['AI 제안 수식','수동 검산','수정·폐기 이유'],
    'M3-1':['각 표의 행 단위','연결 키와 누락','조인 후 검산'],
    'M3-2':['원본 건수','정제 규칙·제외 건수','정제 전후 차이'],
    'M3-3':['고객군 분모·건수','관찰 차이','경쟁 가설'],
    'M3-4':['차트 정의','가능한 해석','금지할 인과 주장'],
    'M4-1':['소재별 양식 차이','교란 요인','통제할 변수'],
    'M4-2':['배정 단위·대상','주요 지표·기간','오염·누락 점검'],
    'M4-3':['구매율·절대 차이','신뢰구간','사업 가치·한계'],
    'M4-4':['AI 주장','원천 대조','수정된 결론'],
    'M5-1':['예측 시점·라벨','누출 위험','평가 지표'],
    'M5-2':['기준 모델','기간 분리 성능','오류·세그먼트'],
    'M5-3':['효과 가정','순기여 시나리오','손익분기 조건'],
    'M6-1':['사실·실험·예측','자료의 연결 한계','추가 필요 근거'],
    'M6-2':['측정 가능한 목표','자원·우선순위','보호 지표'],
    'M6-3':['예산 대안','불확실성 범위','선택·중단 기준'],
    'M6-4':['핵심 주장·원천','예상 반론','수정한 결정'],
}

def worksheet(unit_id: str, source_dir: Path):
    labels = RECORD_LABELS[unit_id]
    rows = [[Paragraph('기록 구분',S['cellh']),Paragraph('원천 수치·식·판단을 직접 기록',S['cellh'])]]
    for label in labels:
        rows.append([Paragraph(inline(label,source_dir),S['cell']),Paragraph(' ',S['cell'])])
    t=Table(rows,colWidths=[135,PAGE_WIDTH-135],rowHeights=[25,78,78,78])
    t.setStyle(TableStyle([
        ('BACKGROUND',(0,0),(-1,0),NAVY),('VALIGN',(0,0),(-1,-1),'TOP'),
        ('ROWBACKGROUNDS',(0,1),(-1,-1),[colors.white,PALE]),
        ('INNERGRID',(0,1),(-1,-1),.35,RULE),('BOX',(0,0),(-1,-1),.35,RULE),
        ('LEFTPADDING',(0,0),(-1,-1),7),('TOPPADDING',(0,0),(-1,-1),7),
    ]))
    return KeepTogether([Spacer(1,8),P(f'{unit_id} · 나의 분석 기록','section',source_dir),t,Spacer(1,8)])

class Book(SimpleDocTemplate):
    def afterFlowable(self, f):
        if isinstance(f, Paragraph) and hasattr(f, 'toc_label'):
            label, level = f.toc_label
            key = 'id_' + hashlib.sha1((label+str(level)).encode()).hexdigest()[:14]
            self.canv.bookmarkPage(key)
            self.notify('TOCEntry',(level,label,self.page,key))

def page(canvas, doc):
    canvas.saveState()
    w,h = A4
    canvas.setStrokeColor(RULE)
    canvas.line(50,h-47,w-50,h-47)
    canvas.setFont('FreeBold',8)
    canvas.setFillColor(BLUE)
    canvas.drawString(50,h-36,'멀티모달 AI 데이터 기반그로스 마케팅  /  112시간 대응 학습 패키지')
    canvas.setFont('Free',8)
    canvas.setFillColor(GRAY)
    canvas.drawString(50,29,'가상 데이터 · 공식 문서 · 연구 근거를 구분한 강사 검토용 초안')
    canvas.drawRightString(w-50,29,str(doc.page))
    canvas.restoreState()

def parse_file(source: Path, story: list, mode: str):
    lines = source.read_text(encoding='utf-8').splitlines()
    assert lines[0] == '---'
    lines = lines[lines.index('---',1)+1:]
    i = 0
    current_unit = None
    while i < len(lines):
        line = lines[i].strip()
        if not line or line.startswith('# '):
            i += 1
            continue
        if line.startswith('## '):
            if current_unit:
                story.append(worksheet(current_unit,source.parent))
                current_unit = None
            label = line[3:]
            if mode == 'theory':
                if re.match(r'^[1-7]\. ',label) or label.startswith('부록 '):
                    story.append(CondPageBreak(515))
                h = P(label,'chapter',source.parent)
                h.toc_label = (label,0)
            else:
                if label.startswith('M') and re.match(r'^M[1-6]\. ',label):
                    story.append(CondPageBreak(500))
                    h = P(label,'chapter',source.parent)
                    h.toc_label = (label,0)
                elif label.startswith('부록'):
                    story.append(CondPageBreak(500))
                    h = P(label,'chapter',source.parent)
                    h.toc_label = (label,0)
                else:
                    h = P(label,'chapter',source.parent)
            story.append(h)
            i += 1
            continue
        if line.startswith('### '):
            label = line[4:]
            if mode == 'workbook' and re.match(r'^M[1-6]-[1-4]\. ',label):
                if current_unit:
                    story.append(worksheet(current_unit,source.parent))
                current_unit = label.split('.')[0]
                story.append(CondPageBreak(250 if re.match(r'^M[1-6]-1\.',label) else 620))
                h = P(label,'unit',source.parent)
                h.toc_label = (label,1)
            else:
                h = P(label,'section',source.parent)
            story.append(h)
            i += 1
            continue
        if line.startswith('|') and i+1<len(lines) and re.match(r'^\|[\s:|\-]+\|$',lines[i+1]):
            rows = [[x.strip() for x in lines[i].split('|')[1:-1]]]
            i += 2
            while i < len(lines) and lines[i].strip().startswith('|'):
                rows.append([x.strip() for x in lines[i].split('|')[1:-1]])
                i += 1
            story.extend([Spacer(1,4),make_table(rows,source.parent),Spacer(1,9)])
            continue
        if line.startswith('!['):
            imgs=[]
            while i<len(lines) and lines[i].strip().startswith('!['):
                m=re.match(r'!\[([^]]+)\]\(([^)]+)\)',lines[i].strip())
                assert m,lines[i]
                imgs.append((m.group(1),(source.parent/m.group(2)).resolve()))
                i+=1
            if len(imgs)==2:
                t=Table([[Image(str(imgs[0][1]),226,226),Image(str(imgs[1][1]),226,226)],
                         [P(imgs[0][0],'caption',source.parent),P(imgs[1][0],'caption',source.parent)]],colWidths=[235,235])
                t.setStyle(TableStyle([('LEFTPADDING',(0,0),(-1,-1),0),('RIGHTPADDING',(0,0),(-1,-1),6)]))
                story.extend([Spacer(1,5),t,Spacer(1,9)])
            else:
                for alt,img in imgs:
                    story.extend([Image(str(img),260,260),P(alt,'caption',source.parent)])
            continue
        if line.startswith('- '):
            story.append(P('• '+line[2:],'body',source.parent))
            i+=1
            continue
        para=[line]
        i+=1
        while i<len(lines) and lines[i].strip() and not re.match(r'^(## |### |\| |!\[|- )',lines[i].strip()):
            para.append(lines[i].strip())
            i+=1
        content=' '.join(para)
        if content.startswith('**확인 질문**'):
            t=Table([[P(content,'callout',source.parent)]],colWidths=[PAGE_WIDTH])
            t.setStyle(TableStyle([('BACKGROUND',(0,0),(-1,-1),CREAM),('BOX',(0,0),(-1,-1),.5,colors.HexColor('#E8C99D')),
                                   ('LEFTPADDING',(0,0),(-1,-1),12),('RIGHTPADDING',(0,0),(-1,-1),12),
                                   ('TOPPADDING',(0,0),(-1,-1),10),('BOTTOMPADDING',(0,0),(-1,-1),10)]))
            story.extend([Spacer(1,6),t,Spacer(1,6)])
        else:
            story.append(P(content,'body',source.parent))
    if current_unit:
        story.append(worksheet(current_unit,source.parent))

story=[]
story.extend([Spacer(1,28),P('멀티모달 AI 데이터 기반','cover',BASE),P('그로스 마케팅','cover',BASE),
              P('112시간 대응 학습 패키지','cover_sub',BASE),HRFlowable(width='100%',thickness=2,color=BLUE),Spacer(1,20),
              P('7개 주제의 근거 중심 개념서와 23개 학습 항목 워크북을 한 권으로 엮었습니다. 19건의 논문·공식 문서와 가상 캠페인·고객 이벤트·실험·예측 데이터를 연결합니다. 112시간은 편성 초안의 38시간 이론 + 74시간 자료 작업을 뜻하며, PDF를 읽는 데 112시간이 걸린다는 뜻은 아닙니다.','cover_sub',BASE)])
images=Table([[Image(str(ASSETS/'creative-A-lifestyle.png'),225,225),Image(str(ASSETS/'creative-B-product.png'),225,225)]],colWidths=[235,235])
images.setStyle(TableStyle([('LEFTPADDING',(0,0),(-1,-1),0),('RIGHTPADDING',(0,0),(-1,-1),8)]))
story.extend([images,Spacer(1,16),P('가상 광고 소재 A와 B · 단일 변수 실험 소재로 쓰지 않음','caption',BASE),
              Spacer(1,18),P('2026-11-18  |  강사 검토용 초안  |  실제 광고·고객 자료가 아님','small',BASE),PageBreak()])
story.append(P('차례','chapter',BASE))
toc=TableOfContents()
toc.levelStyles=[S['toc0'],S['toc1']]
story.extend([toc,PageBreak(),P('Part I. 개념과 근거를 읽는 학습서','part',BASE)])
parse_file(EVIDENCE/'근거_중심_학습서.md',story,'theory')
story.extend([PageBreak(),P('Part II. 112시간 편성에 대응하는 자료 워크북','part',BASE)])
parse_file(BASE/'112시간_실습_워크북.md',story,'workbook')
story.extend([PageBreak(),P('Part III. 가상 데이터 사전과 재현 조건','part',BASE)])
parse_file(BASE/'가상_데이터_설명.md',story,'workbook')

TMP.parent.mkdir(parents=True,exist_ok=True)
doc=Book(str(TMP),pagesize=A4,leftMargin=50,rightMargin=50,topMargin=62,bottomMargin=49,
         title='멀티모달 AI 데이터 기반그로스 마케팅 - 112시간 대응 학습 패키지',author='Instructor Studio draft')
doc.multiBuild(story,onFirstPage=page,onLaterPages=page)

writer=PdfWriter()
writer.clone_document_from_reader(PdfReader(str(TMP)))
for path in [
    *(ASSETS/name for name in ['creative-A-lifestyle.png','creative-B-product.png','creative-A-voice.mp3','creative-B-voice.mp3',
                                  'creative-A-lifestyle.mp4','creative-B-product.mp4','creative_metadata.csv','daily_campaign_metrics.csv','ab_user_assignments.csv']),
    *(DATA/name for name in ['campaign_84d.csv','customer_events.csv','controlled_copy_experiment.csv','purchase_prediction.csv','scenario_markers.csv']),
]:
    writer.add_attachment(filename=path.name,data=path.read_bytes())
with OUT.open('wb') as f:
    writer.write(f)
r=PdfReader(str(OUT))
print({'output':str(OUT),'pages':len(r.pages),'attachments':len(r.attachments),'bytes':OUT.stat().st_size})
