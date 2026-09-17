import os
from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle

def draw_colorful_watermark(canvas, doc):
    """Draw a vibrant, colorful background watermark for the club credentials directory."""
    canvas.saveState()
    canvas.translate(306, 396)
    canvas.rotate(32)
    
    # Outer double circular watermark crest with AWS Orange & Techno Cyan
    canvas.setStrokeColor(colors.HexColor('#ff9900'), alpha=0.10)
    canvas.setLineWidth(4)
    canvas.circle(0, 0, 215)
    
    canvas.setStrokeColor(colors.HexColor('#00d2ff'), alpha=0.10)
    canvas.setLineWidth(2)
    canvas.circle(0, 0, 202)
    
    canvas.setStrokeColor(colors.HexColor('#ff9900'), alpha=0.06)
    canvas.setLineWidth(1)
    canvas.circle(0, 0, 192)
    
    # Watermark text in colorful brand styling
    canvas.setFillColor(colors.HexColor('#ff9900'), alpha=0.09)
    canvas.setFont('Helvetica-Bold', 42)
    canvas.drawCentredString(0, 40, "AWS SBG")
    
    canvas.setFillColor(colors.HexColor('#0284c7'), alpha=0.09)
    canvas.setFont('Helvetica-Bold', 26)
    canvas.drawCentredString(0, 6, "& TECHNO LAB")
    
    canvas.setFont('Helvetica-Bold', 14)
    canvas.setFillColor(colors.HexColor('#ff9900'), alpha=0.08)
    canvas.drawCentredString(0, -22, "OFFICIAL SECURITY DIRECTORY")
    
    canvas.setFont('Helvetica-Bold', 11)
    canvas.setFillColor(colors.HexColor('#0f172a'), alpha=0.07)
    canvas.drawCentredString(0, -42, "ITM (SLS) BARODA UNIVERSITY CHAPTER")
    canvas.restoreState()

def create_credentials_pdf(filename):
    doc = SimpleDocTemplate(
        filename,
        pagesize=letter,
        rightMargin=24,
        leftMargin=24,
        topMargin=24,
        bottomMargin=24
    )

    styles = getSampleStyleSheet()
    
    header_style = ParagraphStyle(
        'DocHeader',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=16,
        leading=19,
        textColor=colors.HexColor('#0f172a'),
        alignment=1
    )

    sub_header_style = ParagraphStyle(
        'DocSubHeader',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8.5,
        leading=11,
        textColor=colors.HexColor('#64748b'),
        alignment=1
    )

    section_title_style = ParagraphStyle(
        'SectionTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=10.5,
        leading=13,
        textColor=colors.HexColor('#d97706'),
        spaceBefore=4,
        spaceAfter=2
    )

    body_style = ParagraphStyle(
        'Body',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8,
        leading=10.5,
        textColor=colors.HexColor('#334155')
    )

    body_bold = ParagraphStyle(
        'BodyBold',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=8,
        leading=10.5,
        textColor=colors.HexColor('#0f172a')
    )

    th_style = ParagraphStyle(
        'TableHeader',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=8,
        leading=10.5,
        textColor=colors.white
    )

    code_style = ParagraphStyle(
        'CodeText',
        parent=styles['Normal'],
        fontName='Courier-Bold',
        fontSize=7.5,
        leading=9.5,
        textColor=colors.HexColor('#0369a1')
    )

    pwd_style = ParagraphStyle(
        'PwdText',
        parent=styles['Normal'],
        fontName='Courier-Bold',
        fontSize=7.5,
        leading=9.5,
        textColor=colors.HexColor('#dc2626')
    )

    story = []

    # Title Banner
    story.append(Paragraph("AWS SBG &amp; TECHNO LAB OFFER LETTER SYSTEM", header_style))
    story.append(Spacer(1, 2))
    story.append(Paragraph("OFFICIAL USER ACCESS CREDENTIALS &amp; SECURITY DIRECTORY", ParagraphStyle(
        'Sub', parent=styles['Normal'], fontName='Helvetica-Bold', fontSize=9.5, leading=12, textColor=colors.HexColor('#ea580c'), alignment=1
    )))
    story.append(Spacer(1, 2))
    story.append(Paragraph("Confidential Document &bull; ITM (SLS) Baroda University &bull; Academic Year 2026", sub_header_style))
    story.append(Spacer(1, 6))
    story.append(HRFlowable(width="100%", thickness=1.2, color=colors.HexColor('#ea580c'), spaceAfter=6))

    # SECTION 1: System Roles Table
    story.append(Paragraph("1. System Roles &amp; Default Login Credentials", section_title_style))
    story.append(HRFlowable(width="100%", thickness=0.6, color=colors.HexColor('#cbd5e1'), spaceAfter=4))

    table_data = [
        [
            Paragraph("Role &amp; Tier", th_style),
            Paragraph("Assigned Name", th_style),
            Paragraph("Username / Login", th_style),
            Paragraph("Official Email ID", th_style),
            Paragraph("Default Password", th_style),
            Paragraph("Access Scope &amp; Permissions", th_style)
        ],
        [
            Paragraph("<b>Universal Super Admin</b><br/><font color='#ea580c' size='6.5'>Level 0 - Master</font>", body_style),
            Paragraph("Bhavikkumar Patel", body_bold),
            Paragraph("superadmin", code_style),
            Paragraph("bhavik.itmbu@gmail.com", body_style),
            Paragraph("SuperAdmin@2026", pwd_style),
            Paragraph("Full Master Control, Cloud DB Sync, RBAC, Branding Vault", body_style)
        ],
        [
            Paragraph("<b>AWS SBG Lead Organizer</b><br/><font color='#ea580c' size='6.5'>Level 1 - AWS Lead</font>", body_style),
            Paragraph("Tannvi Acharya", body_bold),
            Paragraph("aws.organizer", code_style),
            Paragraph("aws.itmbu@gmail.com", body_style),
            Paragraph("AwsLead@2026", pwd_style),
            Paragraph("AWS SBG Roster Management, Offer Letters, Promotions", body_style)
        ],
        [
            Paragraph("<b>Techno Lab Lead Organizer</b><br/><font color='#0284c7' size='6.5'>Level 1 - Techno Lead</font>", body_style),
            Paragraph("Vansham Kamboj", body_bold),
            Paragraph("technolab.lead", code_style),
            Paragraph("technolabclub25@gmail.com", body_style),
            Paragraph("TechnoLab@2026", pwd_style),
            Paragraph("Techno Lab Robotics/AI Roster &amp; Letter Issuance", body_style)
        ],
        [
            Paragraph("<b>Faculty Advisor &amp; Mentor</b><br/><font color='#16a34a' size='6.5'>Level 2 - Oversight</font>", body_style),
            Paragraph("Dr. Pradeep Laxkar", body_bold),
            Paragraph("pradeep.laxkar", code_style),
            Paragraph("pradeep.laxkar@itmbu.ac.in", body_style),
            Paragraph("Faculty@2026", pwd_style),
            Paragraph("Academic Verification, Digital Signatures, Audit Review", body_style)
        ],
        [
            Paragraph("<b>Institutional Auditor</b><br/><font color='#7c3aed' size='6.5'>Level 3 - Audit</font>", body_style),
            Paragraph("Compliance Officer", body_bold),
            Paragraph("auditor.itmbu", code_style),
            Paragraph("compliance.audit@itmbu.ac.in", body_style),
            Paragraph("Auditor@2026", pwd_style),
            Paragraph("Read-Only Audit Logs &amp; Letter Verification Hashes", body_style)
        ],
        [
            Paragraph("<b>General Member / Student</b><br/><font color='#64748b' size='6.5'>Level 4 - Member</font>", body_style),
            Paragraph("Self-Registered Student", body_bold),
            Paragraph("rahul.sharma", code_style),
            Paragraph("rahul.sharma@itmbu.ac.in", body_style),
            Paragraph("Student@2026", pwd_style),
            Paragraph("Personal Offer Letter View &amp; Profile Verification", body_style)
        ]
    ]

    t = Table(table_data, colWidths=[105, 85, 80, 115, 80, 99])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#0f172a')),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('TOPPADDING', (0, 0), (-1, 0), 4),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 4),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#cbd5e1')),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.HexColor('#f8fafc'), colors.white]),
        ('TOPPADDING', (0, 1), (-1, -1), 3.5),
        ('BOTTOMPADDING', (0, 1), (-1, -1), 3.5),
    ]))
    story.append(t)
    story.append(Spacer(1, 8))

    # SECTION 2: Cloud Infrastructure & Endpoints
    story.append(Paragraph("2. Cloud Infrastructure &amp; Service Endpoints", section_title_style))
    story.append(HRFlowable(width="100%", thickness=0.6, color=colors.HexColor('#cbd5e1'), spaceAfter=4))

    infra_data = [
        [
            Paragraph("Component / Service", th_style),
            Paragraph("Target Host / URL", th_style),
            Paragraph("Environment / Details", th_style),
            Paragraph("Authentication Method", th_style)
        ],
        [
            Paragraph("<b>React Web Application</b>", body_style),
            Paragraph("http://localhost:3000", code_style),
            Paragraph("Development / Cloudflare Tunnel", body_style),
            Paragraph("RBAC Role Selector / Session State", body_style)
        ],
        [
            Paragraph("<b>Backend API Server</b>", body_style),
            Paragraph("http://localhost:5000 / Offer-Letter-DB", code_style),
            Paragraph("Node.js Express / Port 5000", body_style),
            Paragraph("JWT / API Key &amp; CORS Whitelist", body_style)
        ],
        [
            Paragraph("<b>Supabase PostgreSQL Cloud</b>", body_style),
            Paragraph("https://hbuhkenlctqefgpqxiah.supabase.co", code_style),
            Paragraph("Production DB (ap-south-1)", body_style),
            Paragraph("Supabase Anon Key &amp; Row Level Security", body_style)
        ],
        [
            Paragraph("<b>Email Verification Service</b>", body_style),
            Paragraph("Supabase Auth &amp; SMTP Dispatcher", code_style),
            Paragraph("Cloud Verification &amp; Password Resets", body_style),
            Paragraph("Email Token Verification", body_style)
        ]
    ]

    t2 = Table(infra_data, colWidths=[130, 180, 124, 130])
    t2.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#1e293b')),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('TOPPADDING', (0, 0), (-1, 0), 4),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 4),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#cbd5e1')),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.HexColor('#f8fafc'), colors.white]),
        ('TOPPADDING', (0, 1), (-1, -1), 3),
        ('BOTTOMPADDING', (0, 1), (-1, -1), 3),
    ]))
    story.append(t2)
    story.append(Spacer(1, 8))

    # SECTION 3: Security & Operational Protocols
    story.append(Paragraph("3. Security Guidelines &amp; Operational Instructions", section_title_style))
    story.append(HRFlowable(width="100%", thickness=0.6, color=colors.HexColor('#cbd5e1'), spaceAfter=4))

    guidelines = [
        "<b>Initial Login &amp; Password Policy:</b> Administrators are advised to update default credentials upon initial login via the <i>Super Admin Console &gt; Security &amp; Key Vault</i>.",
        "<b>Multi-Device Cloud Synchronization:</b> The system syncs with Supabase Cloud DB in real time. Changes saved on any device immediately propagate across all active terminals.",
        "<b>Student Self-Registration:</b> New signups automatically receive <b>General Member</b> role. Lead Organizers can elevate members to Core Team or Executive roles via the Promotion Modal.",
        "<b>Verification Hashes:</b> Every generated letter includes a unique cryptographic verification hash on the university letterhead."
    ]

    for g in guidelines:
        story.append(Paragraph(f"&bull; {g}", body_style))
        story.append(Spacer(1, 2))

    story.append(Spacer(1, 6))
    story.append(HRFlowable(width="100%", thickness=0.8, color=colors.HexColor('#e2e8f0'), spaceAfter=4))
    
    # Footer
    footer_text = Paragraph(
        "<font color='#94a3b8' size='7'>ITM (SLS) Baroda University &bull; Department of Computer Science &amp; Engineering &bull; "
        "AWS Student Builder Group &amp; Techno Lab Chapter</font>",
        ParagraphStyle('Footer', parent=styles['Normal'], fontName='Helvetica', alignment=1)
    )
    story.append(footer_text)

    # Build the document with colorful watermark
    doc.build(story, onFirstPage=draw_colorful_watermark, onLaterPages=draw_colorful_watermark)
    print(f"[SUCCESS] Credentials PDF with colorful background watermark generated at: {filename}")

if __name__ == '__main__':
    target_path = os.path.abspath(r"d:\AWD-PROJECTS\AWD-1-AWS-OFFER-LETTER-GENRATOR\SYSTEM_USER_CREDENTIALS.pdf")
    create_credentials_pdf(target_path)
