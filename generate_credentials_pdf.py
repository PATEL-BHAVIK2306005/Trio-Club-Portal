import os
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import matplotlib.patches as patches
from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable, Image, KeepTogether, PageBreak
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle

def generate_usecase_diagram(image_path):
    """Generate a high-resolution, beautiful Actor Use-Case diagram."""
    fig, ax = plt.subplots(figsize=(11, 7.2), dpi=300)
    fig.patch.set_facecolor('#0b0f19')
    ax.set_facecolor('#0b0f19')
    
    # System boundary box
    rect = patches.FancyBboxPatch(
        (2.8, 0.4), 5.4, 6.4,
        boxstyle="round,pad=0.2,rounding_size=0.15",
        edgecolor='#38bdf8', facecolor='#111827', linewidth=2, linestyle='--', alpha=0.9
    )
    ax.add_patch(rect)
    
    ax.text(5.5, 6.55, "TRIO-CLUB PORTAL SYSTEM BOUNDARY", 
            color='#38bdf8', fontsize=13, fontweight='bold', ha='center', va='center',
            bbox=dict(boxstyle='round,pad=0.3', facecolor='#0f172a', edgecolor='#38bdf8', lw=1.5))

    # Actors definition (Left & Right)
    actors = [
        # (x, y, title, subtitle, color, tag)
        (1.2, 5.8, "Super Admin", "(Universal Master Control)", "#ff9900", "MASTER ADMIN"),
        (1.2, 4.3, "Club Lead Organizers", "(AWS / Techno / GDGoC)", "#00d2ff", "CHAPTER LEADS"),
        (1.2, 2.8, "Associate Co-Leads", "& Department Heads", "#4285F4", "COORDINATORS"),
        (9.8, 4.8, "Faculty Advisor", "& Institutional Auditor", "#10b981", "ACADEMIC & AUDIT"),
        (9.8, 2.2, "Core Members", "& General Students", "#a855f7", "MEMBERS & APPLICANTS"),
    ]

    for x, y, title, sub, col, tag in actors:
        # Actor stick icon container
        actor_box = patches.FancyBboxPatch(
            (x - 1.0, y - 0.5), 2.0, 1.0,
            boxstyle="round,pad=0.1,rounding_size=0.1",
            edgecolor=col, facecolor='#1e293b', linewidth=2
        )
        ax.add_patch(actor_box)
        ax.text(x, y + 0.22, f"[{tag}]", color=col, fontsize=7, fontweight='bold', ha='center', va='center')
        ax.text(x, y - 0.02, title, color='#ffffff', fontsize=9, fontweight='bold', ha='center', va='center')
        ax.text(x, y - 0.26, sub, color='#94a3b8', fontsize=7, fontweight='bold', ha='center', va='center')

    # Use Cases (Ovals in center)
    usecases = [
        # (x, y, id, title, color)
        (5.5, 5.8, "UC-1", "Multi-Club Session Auth & Role Switching", "#ff9900"),
        (5.5, 4.95, "UC-2", "Dynamic Joining Letter Studio & PDF Engine", "#38bdf8"),
        (5.5, 4.1, "UC-3", "58-Member Team Roster Management (CRUD)", "#4285F4"),
        (5.5, 3.25, "UC-4", "Department Taxonomy & Role Matrix Config", "#a855f7"),
        (5.5, 2.4, "UC-5", "Dual Realtime Cloud DB Sync (Supabase)", "#10b981"),
        (5.5, 1.55, "UC-6", "Institutional Branding, Crests & Signatures", "#f59e0b"),
        (5.5, 0.75, "UC-7", "Cryptographic Verification Hash Validation", "#ec4899"),
    ]

    for x, y, ucid, title, col in usecases:
        ellipse = patches.Ellipse((x, y), 4.2, 0.62, edgecolor=col, facecolor='#162032', linewidth=1.8)
        ax.add_patch(ellipse)
        ax.text(x, y + 0.08, f"«{ucid}»", color=col, fontsize=7.5, fontweight='bold', ha='center', va='center')
        ax.text(x, y - 0.12, title, color='#f8fafc', fontsize=8.5, fontweight='bold', ha='center', va='center')

    # Connection lines (Actor to Use Cases)
    connections = [
        # Super Admin to All
        ((1.9, 5.8), (3.4, 5.8), "#ff9900"),
        ((1.9, 5.8), (3.4, 4.1), "#ff9900"),
        ((1.9, 5.8), (3.4, 3.25), "#ff9900"),
        ((1.9, 5.8), (3.4, 2.4), "#ff9900"),
        ((1.9, 5.8), (3.4, 1.55), "#ff9900"),
        
        # Lead Organizers
        ((1.9, 4.3), (3.4, 5.8), "#00d2ff"),
        ((1.9, 4.3), (3.4, 4.95), "#00d2ff"),
        ((1.9, 4.3), (3.4, 4.1), "#00d2ff"),
        ((1.9, 4.3), (3.4, 1.55), "#00d2ff"),
        
        # Co-Leads & Dept Heads
        ((1.9, 2.8), (3.4, 4.95), "#4285F4"),
        ((1.9, 2.8), (3.4, 4.1), "#4285F4"),
        
        # Faculty & Auditor
        ((8.8, 4.8), (7.6, 5.8), "#10b981"),
        ((8.8, 4.8), (7.6, 1.55), "#10b981"),
        ((8.8, 4.8), (7.6, 0.75), "#10b981"),
        
        # Core Members & Students
        ((8.8, 2.2), (7.6, 4.95), "#a855f7"),
        ((8.8, 2.2), (7.6, 0.75), "#a855f7"),
    ]

    for (x1, y1), (x2, y2), col in connections:
        ax.plot([x1, x2], [y1, y2], color=col, linestyle='-', linewidth=1.2, alpha=0.6)
        # Add small dot at connector end
        ax.plot(x2, y2, marker='o', markersize=3, color=col, alpha=0.9)

    ax.set_xlim(0, 11)
    ax.set_ylim(0, 7.2)
    ax.axis('off')
    plt.tight_layout()
    plt.savefig(image_path, bbox_inches='tight', pad_inches=0.1, facecolor='#0b0f19')
    plt.close()
    print(f"[SUCCESS] Use case diagram created at {image_path}")

def draw_watermark_and_footer(canvas, doc):
    """Draw professional headers, colorful subtle watermark, and footer on every page."""
    canvas.saveState()
    page_w, page_h = letter
    
    # Background Watermark
    canvas.saveState()
    canvas.translate(page_w / 2.0, page_h / 2.0)
    canvas.rotate(35)
    
    # Outer double circular watermark crest
    canvas.setStrokeColor(colors.HexColor('#ff9900'), alpha=0.06)
    canvas.setLineWidth(3)
    canvas.circle(0, 0, 230)
    
    canvas.setStrokeColor(colors.HexColor('#00d2ff'), alpha=0.06)
    canvas.setLineWidth(2)
    canvas.circle(0, 0, 215)
    
    canvas.setStrokeColor(colors.HexColor('#4285F4'), alpha=0.05)
    canvas.setLineWidth(1)
    canvas.circle(0, 0, 200)
    
    canvas.setFillColor(colors.HexColor('#ff9900'), alpha=0.07)
    canvas.setFont('Helvetica-Bold', 34)
    canvas.drawCentredString(0, 45, "AWS SBG • TECHNO LAB • GDGoC")
    
    canvas.setFillColor(colors.HexColor('#0284c7'), alpha=0.06)
    canvas.setFont('Helvetica-Bold', 20)
    canvas.drawCentredString(0, 12, "ITM (SLS) BARODA UNIVERSITY")
    
    canvas.setFont('Helvetica-Bold', 13)
    canvas.setFillColor(colors.HexColor('#4285F4'), alpha=0.06)
    canvas.drawCentredString(0, -18, "OFFICIAL SYSTEM CREDENTIALS & RBAC MATRIX")
    
    canvas.setFont('Helvetica-Bold', 9.5)
    canvas.setFillColor(colors.HexColor('#0f172a'), alpha=0.05)
    canvas.drawCentredString(0, -38, "DESIGNED BY BHAVIKKUMAR PATEL")
    canvas.restoreState()

    # Top Header Rule (on later pages)
    if doc.page > 1:
        canvas.setStrokeColor(colors.HexColor('#cbd5e1'))
        canvas.setLineWidth(0.5)
        canvas.line(28, page_h - 22, page_w - 28, page_h - 22)
        
        canvas.setFont('Helvetica-Bold', 7.5)
        canvas.setFillColor(colors.HexColor('#64748b'))
        canvas.drawString(28, page_h - 18, "ITM (SLS) BARODA UNIVERSITY • TRIO-CLUB PORTAL & OFFER LETTER SYSTEM")
        canvas.drawRightString(page_w - 28, page_h - 18, f"SECURITY DIRECTORY • PAGE {doc.page}")

    # Bottom Footer Rule
    canvas.setStrokeColor(colors.HexColor('#cbd5e1'))
    canvas.setLineWidth(0.5)
    canvas.line(28, 26, page_w - 28, 26)
    
    canvas.setFont('Helvetica-Bold', 7.5)
    canvas.setFillColor(colors.HexColor('#ff9900'))
    canvas.drawString(28, 14, "★ DESIGNED & ARCHITECTED BY BHAVIKKUMAR PATEL (SUPER ADMIN & ARCHITECT)")
    
    canvas.setFont('Helvetica', 7.5)
    canvas.setFillColor(colors.HexColor('#64748b'))
    canvas.drawRightString(page_w - 28, 14, f"Confidential Internal Document | Page {doc.page}")
    
    canvas.restoreState()

def create_credentials_pdf(pdf_path):
    diagram_path = os.path.abspath(r"d:\AWD-PROJECTS\AWD-1-AWS-OFFER-LETTER-GENRATOR\usecase_diagram.png")
    generate_usecase_diagram(diagram_path)

    doc = SimpleDocTemplate(
        pdf_path,
        pagesize=letter,
        rightMargin=26,
        leftMargin=26,
        topMargin=26,
        bottomMargin=32
    )

    styles = getSampleStyleSheet()

    header_title_style = ParagraphStyle(
        'MainTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=15,
        leading=18,
        textColor=colors.HexColor('#0f172a'),
        alignment=1
    )

    sub_title_style = ParagraphStyle(
        'MainSubTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=10,
        leading=13,
        textColor=colors.HexColor('#ea580c'),
        alignment=1
    )

    meta_style = ParagraphStyle(
        'MetaStyle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8,
        leading=10.5,
        textColor=colors.HexColor('#64748b'),
        alignment=1
    )

    sec_heading_style = ParagraphStyle(
        'SecHeading',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=10,
        leading=13,
        textColor=colors.HexColor('#0f172a'),
        spaceBefore=5,
        spaceAfter=3
    )

    th_style = ParagraphStyle(
        'TableHeader',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=7.5,
        leading=9.5,
        textColor=colors.white
    )

    cell_bold = ParagraphStyle(
        'CellBold',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=7.5,
        leading=9.5,
        textColor=colors.HexColor('#0f172a')
    )

    cell_text = ParagraphStyle(
        'CellText',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=7.5,
        leading=9.5,
        textColor=colors.HexColor('#334155')
    )

    code_style = ParagraphStyle(
        'CodeStyle',
        parent=styles['Normal'],
        fontName='Courier-Bold',
        fontSize=7.5,
        leading=9.5,
        textColor=colors.HexColor('#0369a1')
    )

    pwd_style = ParagraphStyle(
        'PwdStyle',
        parent=styles['Normal'],
        fontName='Courier-Bold',
        fontSize=7.5,
        leading=9.5,
        textColor=colors.HexColor('#dc2626')
    )

    badge_aws = ParagraphStyle(
        'BadgeAws', parent=styles['Normal'], fontName='Helvetica-Bold', fontSize=6.5, leading=8, textColor=colors.HexColor('#d97706')
    )
    badge_techno = ParagraphStyle(
        'BadgeTechno', parent=styles['Normal'], fontName='Helvetica-Bold', fontSize=6.5, leading=8, textColor=colors.HexColor('#0284c7')
    )
    badge_gdgoc = ParagraphStyle(
        'BadgeGdgoc', parent=styles['Normal'], fontName='Helvetica-Bold', fontSize=6.5, leading=8, textColor=colors.HexColor('#2563eb')
    )
    badge_super = ParagraphStyle(
        'BadgeSuper', parent=styles['Normal'], fontName='Helvetica-Bold', fontSize=6.5, leading=8, textColor=colors.HexColor('#7c3aed')
    )

    story = []

    # TOP BANNER
    story.append(Paragraph("ITM (SLS) BARODA UNIVERSITY", ParagraphStyle('UniHeader', parent=styles['Normal'], fontName='Helvetica-Bold', fontSize=12, leading=14, textColor=colors.HexColor('#475569'), alignment=1)))
    story.append(Spacer(1, 2))
    story.append(Paragraph("TRIO-CLUB PORTAL &amp; OFFER LETTER STUDIO", header_title_style))
    story.append(Spacer(1, 2))
    story.append(Paragraph("OFFICIAL SECURITY DIRECTORY • USER CREDENTIALS • 15-TIER RBAC MATRIX", sub_title_style))
    story.append(Spacer(1, 2))
    story.append(Paragraph("AWS Student Builder Group &bull; Techno Lab Club &bull; Google Developer Groups on Campus (GDGoC ITMBU)", meta_style))
    story.append(Spacer(1, 4))
    story.append(HRFlowable(width="100%", thickness=1.5, color=colors.HexColor('#ea580c'), spaceAfter=5))

    # SECTION 1: System Access Credentials Directory
    story.append(Paragraph("1. System Roles &amp; Complete Official Login Credentials Directory", sec_heading_style))
    story.append(HRFlowable(width="100%", thickness=0.6, color=colors.HexColor('#cbd5e1'), spaceAfter=4))

    cred_table_data = [
        [
            Paragraph("Role &amp; Chapter Tier", th_style),
            Paragraph("Designated Name", th_style),
            Paragraph("Login Username", th_style),
            Paragraph("Official Email ID", th_style),
            Paragraph("Default Password", th_style),
            Paragraph("Permissions &amp; Scope", th_style)
        ],
        # Super Admin
        [
            Paragraph("<b>Universal Super Admin</b><br/><font color='#7c3aed'>Level 0 - Master</font>", cell_text),
            Paragraph("Bhavikkumar Patel", cell_bold),
            Paragraph("superadmin", code_style),
            Paragraph("bhavik.itmbu@gmail.com", cell_text),
            Paragraph("SuperAdmin@2026", pwd_style),
            Paragraph("Full Master Control, Cloud DB Sync, RBAC, Chapter Toggle", cell_text)
        ],
        # AWS SBG Lead
        [
            Paragraph("<b>AWS SBG Lead Organizer</b><br/><font color='#ea580c'>Level 1 - AWS Lead</font>", cell_text),
            Paragraph("Tannvi Acharya", cell_bold),
            Paragraph("aws.organizer", code_style),
            Paragraph("aws.itmbu@gmail.com", cell_text),
            Paragraph("AwsLead@2026", pwd_style),
            Paragraph("AWS SBG Roster Management, Offer Letters, Signatures", cell_text)
        ],
        # AWS SBG Co-Lead
        [
            Paragraph("<b>AWS SBG Associate Co-Lead</b><br/><font color='#ea580c'>Level 1B - AWS Co-Lead</font>", cell_text),
            Paragraph("Bhavik Patel", cell_bold),
            Paragraph("aws.colead", code_style),
            Paragraph("bhavik.patel@itmbu.ac.in", cell_text),
            Paragraph("AwsCoLead@2026", pwd_style),
            Paragraph("AWS Operations, Department Coordination &amp; Approvals", cell_text)
        ],
        # Techno Lab Lead
        [
            Paragraph("<b>Techno Lab Lead Organizer</b><br/><font color='#0284c7'>Level 1 - Techno Lead</font>", cell_text),
            Paragraph("Vansham Kamboj", cell_bold),
            Paragraph("technolab.lead", code_style),
            Paragraph("technolabclub25@gmail.com", cell_text),
            Paragraph("TechnoLab@2026", pwd_style),
            Paragraph("Techno Lab Robotics/AI Roster &amp; Letter Issuance", cell_text)
        ],
        # Techno Lab Co-Lead
        [
            Paragraph("<b>Techno Lab Associate Co-Lead</b><br/><font color='#0284c7'>Level 1B - Techno Co-Lead</font>", cell_text),
            Paragraph("Mohit Parmar", cell_bold),
            Paragraph("technolab.colead", code_style),
            Paragraph("mohit.technolab@itmbu.ac.in", cell_text),
            Paragraph("TechnoCoLead@2026", pwd_style),
            Paragraph("Technical Lab Workflows &amp; Event Logistics Lettering", cell_text)
        ],
        # GDGoC Lead
        [
            Paragraph("<b>GDGoC Campus Lead Organizer</b><br/><font color='#2563eb'>Level 1 - GDGoC Lead</font>", cell_text),
            Paragraph("GDGoC Lead", cell_bold),
            Paragraph("gdgoc.lead", code_style),
            Paragraph("gdgoc.itmbu@gmail.com", cell_text),
            Paragraph("GdgocLead@2026", pwd_style),
            Paragraph("Google Developer Groups on Campus Roster &amp; Lettering", cell_text)
        ],
        # GDGoC Co-Lead
        [
            Paragraph("<b>GDGoC Associate Co-Lead</b><br/><font color='#2563eb'>Level 1B - GDGoC Co-Lead</font>", cell_text),
            Paragraph("GDGoC Co-Organizer", cell_bold),
            Paragraph("gdgoc.colead", code_style),
            Paragraph("gdgoc.colead@itmbu.ac.in", cell_text),
            Paragraph("GdgocCoLead@2026", pwd_style),
            Paragraph("GDGoC Department &amp; Community Coordination", cell_text)
        ],
        # Faculty Advisor
        [
            Paragraph("<b>Faculty Advisor &amp; Mentor</b><br/><font color='#16a34a'>Level 2 - Oversight</font>", cell_text),
            Paragraph("Dr. Pradeep Laxkar", cell_bold),
            Paragraph("pradeep.laxkar", code_style),
            Paragraph("pradeep.laxkar@itmbu.ac.in", cell_text),
            Paragraph("Faculty@2026", pwd_style),
            Paragraph("Academic Verification, Digital Signatures, Audit Review", cell_text)
        ],
        # Compliance Auditor
        [
            Paragraph("<b>Institutional Auditor</b><br/><font color='#475569'>Level 3 - Audit</font>", cell_text),
            Paragraph("Compliance Officer", cell_bold),
            Paragraph("auditor.itmbu", code_style),
            Paragraph("compliance.audit@itmbu.ac.in", cell_text),
            Paragraph("Auditor@2026", pwd_style),
            Paragraph("Read-Only Audit Logs &amp; Letter Verification Hashes", cell_text)
        ],
        # Technical Dept Lead
        [
            Paragraph("<b>Technical Dept Lead</b><br/><font color='#0284c7'>Level 2B - Dept Head</font>", cell_text),
            Paragraph("Devansh Jani", cell_bold),
            Paragraph("tech.lead", code_style),
            Paragraph("devansh.tech@itmbu.ac.in", cell_text),
            Paragraph("TechLead@2026", pwd_style),
            Paragraph("Technical Team Task Management &amp; Letter Requests", cell_text)
        ],
        # Design & Media Lead
        [
            Paragraph("<b>Design &amp; Media Lead</b><br/><font color='#ec4899'>Level 2B - Dept Head</font>", cell_text),
            Paragraph("Riya Patel", cell_bold),
            Paragraph("media.lead", code_style),
            Paragraph("riya.design@itmbu.ac.in", cell_text),
            Paragraph("DesignLead@2026", pwd_style),
            Paragraph("Branding Asset Inspection &amp; Letter Design Formatting", cell_text)
        ],
        # General Member
        [
            Paragraph("<b>General Member / Student</b><br/><font color='#64748b'>Level 4 - Member</font>", cell_text),
            Paragraph("Self-Registered Student", cell_bold),
            Paragraph("student.member", code_style),
            Paragraph("student@itmbu.ac.in", cell_text),
            Paragraph("Student@2026", pwd_style),
            Paragraph("Personal Offer Letter View &amp; Profile Verification", cell_text)
        ]
    ]

    t_cred = Table(cred_table_data, colWidths=[108, 86, 78, 114, 80, 94])
    t_cred.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#0f172a')),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('TOPPADDING', (0, 0), (-1, 0), 3.5),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 3.5),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#cbd5e1')),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.HexColor('#f8fafc'), colors.white]),
        ('TOPPADDING', (0, 1), (-1, -1), 2.8),
        ('BOTTOMPADDING', (0, 1), (-1, -1), 2.8),
    ]))
    story.append(t_cred)
    story.append(Spacer(1, 8))

    # SECTION 2: 15-Tier RBAC Permission Hierarchy
    story.append(Paragraph("2. 15-Tier Role-Based Access Control (RBAC) Architecture Matrix", sec_heading_style))
    story.append(HRFlowable(width="100%", thickness=0.6, color=colors.HexColor('#cbd5e1'), spaceAfter=4))

    rbac_data = [
        [
            Paragraph("RBAC Role", th_style),
            Paragraph("Security Level", th_style),
            Paragraph("Scope of Access", th_style),
            Paragraph("Letter Studio", th_style),
            Paragraph("Team Roster", th_style),
            Paragraph("Branding Vault", th_style),
            Paragraph("Super Admin Console", th_style),
            Paragraph("Cloud DB Sync", th_style)
        ],
        [
            Paragraph("<b>SUPER_ADMIN</b>", cell_bold),
            Paragraph("<font color='#7c3aed'><b>Level 0</b></font>", cell_text),
            Paragraph("Universal Cross-Club", cell_text),
            Paragraph("Full Edit/Generate", cell_text),
            Paragraph("Full (All 58+)", cell_text),
            Paragraph("Full Access", cell_text),
            Paragraph("Full Access", cell_text),
            Paragraph("Realtime Master", cell_text)
        ],
        [
            Paragraph("<b>ORGANIZER (Lead)</b>", cell_bold),
            Paragraph("<font color='#ea580c'><b>Level 1</b></font>", cell_text),
            Paragraph("Assigned Chapter", cell_text),
            Paragraph("Edit &amp; Generate", cell_text),
            Paragraph("Chapter Roster", cell_text),
            Paragraph("Chapter Logo", cell_text),
            Paragraph("No Access", cell_text),
            Paragraph("Chapter Sync", cell_text)
        ],
        [
            Paragraph("<b>CO_LEAD</b>", cell_bold),
            Paragraph("<font color='#0284c7'><b>Level 1B</b></font>", cell_text),
            Paragraph("Assigned Chapter", cell_text),
            Paragraph("Generate &amp; Review", cell_text),
            Paragraph("Edit Chapter", cell_text),
            Paragraph("View Only", cell_text),
            Paragraph("No Access", cell_text),
            Paragraph("Auto Sync", cell_text)
        ],
        [
            Paragraph("<b>FACULTY_ADVISOR</b>", cell_bold),
            Paragraph("<font color='#16a34a'><b>Level 2</b></font>", cell_text),
            Paragraph("University Level", cell_text),
            Paragraph("Approve &amp; Sign", cell_text),
            Paragraph("View Roster", cell_text),
            Paragraph("Signature Vault", cell_text),
            Paragraph("Audit Mode", cell_text),
            Paragraph("Audit Sync", cell_text)
        ],
        [
            Paragraph("<b>DEPARTMENT_LEAD</b>", cell_bold),
            Paragraph("<font color='#2563eb'><b>Level 2B</b></font>", cell_text),
            Paragraph("Departmental", cell_text),
            Paragraph("Generate Dept", cell_text),
            Paragraph("Dept Members", cell_text),
            Paragraph("No Access", cell_text),
            Paragraph("No Access", cell_text),
            Paragraph("Auto Sync", cell_text)
        ],
        [
            Paragraph("<b>AUDITOR</b>", cell_bold),
            Paragraph("<font color='#475569'><b>Level 3</b></font>", cell_text),
            Paragraph("Cross-Club Read", cell_text),
            Paragraph("Verify Hash Only", cell_text),
            Paragraph("View Audit Log", cell_text),
            Paragraph("No Access", cell_text),
            Paragraph("No Access", cell_text),
            Paragraph("Read-Only", cell_text)
        ],
        [
            Paragraph("<b>MEMBER / STUDENT</b>", cell_bold),
            Paragraph("<font color='#64748b'><b>Level 4</b></font>", cell_text),
            Paragraph("Self / Personal", cell_text),
            Paragraph("View Own Letter", cell_text),
            Paragraph("No Access", cell_text),
            Paragraph("No Access", cell_text),
            Paragraph("No Access", cell_text),
            Paragraph("Personal Sync", cell_text)
        ]
    ]

    t_rbac = Table(rbac_data, colWidths=[95, 62, 85, 75, 65, 60, 65, 53])
    t_rbac.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#1e293b')),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('TOPPADDING', (0, 0), (-1, 0), 3.5),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 3.5),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#cbd5e1')),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.HexColor('#f8fafc'), colors.white]),
        ('TOPPADDING', (0, 1), (-1, -1), 2.8),
        ('BOTTOMPADDING', (0, 1), (-1, -1), 2.8),
    ]))
    story.append(t_rbac)
    
    # PAGE BREAK FOR USECASE DIAGRAM & SYSTEM ARCHITECTURE
    story.append(PageBreak())

    # SECTION 3: System Actor & Use-Case Diagram
    story.append(Paragraph("3. System Actor &amp; Use-Case Diagram Architecture", sec_heading_style))
    story.append(HRFlowable(width="100%", thickness=0.6, color=colors.HexColor('#cbd5e1'), spaceAfter=4))
    story.append(Paragraph(
        "Visual representation of core system actors (Super Admin, Club Leads, Dept Heads, Faculty, and Students) "
        "and their interaction across the 7 primary functional use-case modules within the Trio-Club Unified Platform.",
        meta_style
    ))
    story.append(Spacer(1, 4))

    # Insert High-Resolution Generated Diagram
    story.append(Image(diagram_path, width=560, height=366))
    story.append(Spacer(1, 8))

    # SECTION 4: Cloud Infrastructure & Database Endpoints
    story.append(Paragraph("4. Unified Cloud Infrastructure &amp; Technical Specifications", sec_heading_style))
    story.append(HRFlowable(width="100%", thickness=0.6, color=colors.HexColor('#cbd5e1'), spaceAfter=4))

    infra_data = [
        [
            Paragraph("Component / Layer", th_style),
            Paragraph("Target Endpoint / Host", th_style),
            Paragraph("Environment / Details", th_style),
            Paragraph("Security &amp; Protocol", th_style)
        ],
        [
            Paragraph("<b>React 19 Frontend App</b>", cell_bold),
            Paragraph("https://trio-club-portal.vercel.app<br/>http://localhost:3000", code_style),
            Paragraph("Vercel Production Edge / Local Dev", cell_text),
            Paragraph("HTTPS / SSL, Role-Based Session Guards", cell_text)
        ],
        [
            Paragraph("<b>Supabase PostgreSQL Cloud</b>", cell_bold),
            Paragraph("https://hbuhkenlctqefgpqxiah.supabase.co", code_style),
            Paragraph("Production DB Cluster (ap-south-1)", cell_text),
            Paragraph("PostgreSQL RLS, Anon Key, SSL 256-bit", cell_text)
        ],
        [
            Paragraph("<b>Node.js Express Backend</b>", cell_bold),
            Paragraph("http://localhost:5000 / Offer-Letter-DB", code_style),
            Paragraph("Local Microservice / Cloudflare Tunnel", cell_text),
            Paragraph("JWT Token Authentication, CORS Strict", cell_text)
        ],
        [
            Paragraph("<b>PDF Vector Render Engine</b>", cell_bold),
            Paragraph("Client HTML2Canvas / Server ReportLab", code_style),
            Paragraph("Joining Letter Studio &amp; Exports", cell_text),
            Paragraph("SHA-256 Letter Reference Hash Security", cell_text)
        ]
    ]

    t_infra = Table(infra_data, colWidths=[120, 180, 120, 140])
    t_infra.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#0f172a')),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('TOPPADDING', (0, 0), (-1, 0), 3.5),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 3.5),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#cbd5e1')),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.HexColor('#f8fafc'), colors.white]),
        ('TOPPADDING', (0, 1), (-1, -1), 2.8),
        ('BOTTOMPADDING', (0, 1), (-1, -1), 2.8),
    ]))
    story.append(t_infra)
    story.append(Spacer(1, 8))

    # SECTION 5: Architectural Sign-off & Attribution Box
    story.append(Paragraph("5. System Design &amp; Architectural Attribution", sec_heading_style))
    story.append(HRFlowable(width="100%", thickness=0.6, color=colors.HexColor('#cbd5e1'), spaceAfter=4))

    author_card = [
        [
            Paragraph("<b>SYSTEM ARCHITECT &amp; LEAD DEVELOPER</b>", ParagraphStyle('AuthH', parent=styles['Normal'], fontName='Helvetica-Bold', fontSize=8, leading=10, textColor=colors.HexColor('#ea580c'))),
            Paragraph("<b>INSTITUTIONAL AFFILIATION &amp; GOVERNANCE</b>", ParagraphStyle('AuthH2', parent=styles['Normal'], fontName='Helvetica-Bold', fontSize=8, leading=10, textColor=colors.HexColor('#0369a1')))
        ],
        [
            Paragraph(
                "<font size='10'><b>BHAVIKKUMAR PATEL</b></font><br/>"
                "<font color='#475569'><b>Universal Super Administrator &amp; Lead System Architect</b><br/>"
                "B.Tech Computer Science &amp; Engineering &bull; 3rd Year<br/>"
                "Associate Coordinator &bull; AWS Student Builder Group<br/>"
                "Email: <b>bhavik.itmbu@gmail.com</b> | GitHub: <b>PATEL-BHAVIK2306005</b></font>",
                cell_text
            ),
            Paragraph(
                "<font size='10'><b>ITM (SLS) BARODA UNIVERSITY</b></font><br/>"
                "<font color='#475569'>Department of Computer Science &amp; Engineering<br/>"
                "Faculty of Engineering &amp; Technology (FET)<br/>"
                "Paldi, Near Jarod, Vadodara-Halol Highway, Gujarat 391510<br/>"
                "Official Portal: <b>https://trio-club-portal.vercel.app</b></font>",
                cell_text
            )
        ]
    ]

    t_author = Table(author_card, colWidths=[280, 280])
    t_author.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#f8fafc')),
        ('BOX', (0, 0), (-1, -1), 1.2, colors.HexColor('#cbd5e1')),
        ('LINEBELOW', (0, 0), (-1, 0), 1, colors.HexColor('#e2e8f0')),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ('LEFTPADDING', (0, 0), (-1, -1), 8),
        ('RIGHTPADDING', (0, 0), (-1, -1), 8),
    ]))
    story.append(t_author)

    # Build document
    doc.build(story, onFirstPage=draw_watermark_and_footer, onLaterPages=draw_watermark_and_footer)
    print(f"[SUCCESS] Complete updated credentials & Use Case PDF created at: {pdf_path}")

if __name__ == '__main__':
    target_path = os.path.abspath(r"d:\AWD-PROJECTS\AWD-1-AWS-OFFER-LETTER-GENRATOR\SYSTEM_USER_CREDENTIALS.pdf")
    create_credentials_pdf(target_path)
