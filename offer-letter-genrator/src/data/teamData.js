export const CLUB_CONFIGS = {
  AWS_SBG: {
    id: 'AWS_SBG',
    name: 'AWS Student Builder Group',
    shortName: 'AWS SBG',
    fullName: 'AWS Student Builder Group (SBG) • ITMBU',
    institution: 'ITM (sls) BARODA UNIVERSITY',
    location: 'Paldi, Near Jarod, Vadodara, Gujarat 391510',
    email: 'aws.itmbu@gmail.com',
    primaryColor: '#ff9900',
    accentColor: '#232f3e',
    badgeText: 'AWS',
    themeGradient: 'linear-gradient(135deg, #ff9900 0%, #ff6b00 100%)',
    refPrefix: 'AWS-SBG/ITMBU/2026-27/JL',
    subtitle: 'Official Student Community Chapter • Department of Computer Science & Engineering',
    stampText: '★ AWS SBG ★',
    organizer: {
      name: 'Bhavikkumar Patel',
      title: 'AWS SBG Leader / Organizer',
      org: 'ITM (sls) Baroda University'
    },
    advisor: {
      name: 'Vansham Kamboj',
      title: 'Advisor',
      org: 'AWS SBG ITMBU'
    },
    mentor: {
      name: 'Dr. Pradeep Laxkar',
      title: 'Faculty Mentor / Head',
      org: 'ITM (sls) Baroda University'
    },
    departments: [
      'All',
      'Core Leadership',
      'Event Management',
      'Technical Team',
      'Designing Team',
      'Social Media + HOST',
      'Outreach and PR',
      'Community Partner',
      'Faculty Mentors'
    ]
  },
  TECHNO_LAB: {
    id: 'TECHNO_LAB',
    name: 'Techno Lab (Techno+Techies Community)',
    shortName: 'Techno Lab',
    fullName: 'Techno Lab (Techno+Techies Community) • ITM (sls) Baroda University',
    institution: 'ITM (sls) BARODA UNIVERSITY',
    location: 'Paldi, Near Jarod, Vadodara, Gujarat 391510',
    email: 'technolabclub25@gmail.com',
    primaryColor: '#00d2ff',
    accentColor: '#3a7bd5',
    badgeText: 'TECHNO',
    themeGradient: 'linear-gradient(135deg, #00d2ff 0%, #3a7bd5 100%)',
    refPrefix: 'TECHNO-LAB/ITMBU/2026-27/JL',
    subtitle: 'Innovation, Robotics & Technical Research Chapter • CSE & IT Department',
    stampText: '★ TECHNO LAB ★',
    organizer: {
      name: 'Vansham Kamboj',
      title: 'President & Lead Organizer',
      org: 'Techno Lab ITMBU'
    },
    advisor: {
      name: 'Mannan Chauhan / Indraneel M.',
      title: 'Senior Technical Advisor',
      org: 'Techno Lab ITMBU'
    },
    mentor: {
      name: 'Dr. Pradeep Laxkar',
      title: 'Faculty Patron / Head CSE',
      org: 'ITM (sls) Baroda University'
    },
    departments: [
      'All',
      'Executive Leadership',
      'Robotics & IoT Wing',
      'AI & Machine Learning Wing',
      'Web & App Development',
      'Cyber Security & CP Wing',
      'Creative & Media Wing',
      'Outreach & Event Operations',
      'Advisory & Mentors'
    ]
  },
  GDGOC: {
    id: 'GDGOC',
    name: 'Google Developer Groups on Campus (GDGoC)',
    shortName: 'GDGoC ITMBU',
    fullName: 'Google Developer Groups on Campus • ITM (sls) Baroda University',
    institution: 'ITM (sls) BARODA UNIVERSITY',
    location: 'Paldi, Near Jarod, Vadodara, Gujarat 391510',
    email: 'gdgoc.itmbu@gmail.com',
    primaryColor: '#4285F4',
    accentColor: '#0F9D58',
    badgeText: 'GDGoC',
    themeGradient: 'linear-gradient(135deg, #4285F4 0%, #0F9D58 45%, #EA4335 100%)',
    refPrefix: 'GDGOC/ITMBU/2026-27/JL',
    subtitle: 'Official Google Developer Community Chapter • Department of Computer Science & Engineering',
    stampText: '★ GDGoC ITMBU ★',
    organizer: {
      name: 'Bhavikkumar Patel',
      title: 'GDGoC Community Lead / Organizer',
      org: 'ITM (sls) Baroda University'
    },
    advisor: {
      name: 'Vansham Kamboj',
      title: 'Senior Community Advisor',
      org: 'GDGoC ITMBU'
    },
    mentor: {
      name: 'Dr. Pradeep Laxkar',
      title: 'Faculty Advisor & Head CSE',
      org: 'ITM (sls) Baroda University'
    },
    departments: [
      'All',
      'Core Leadership',
      'Web Development Wing',
      'Android & Flutter Wing',
      'Cloud & DevOps Wing',
      'AI & Machine Learning Wing',
      'UI/UX & Creative Wing',
      'Outreach & Event Operations',
      'Faculty Mentors & Advisory'
    ]
  }
};

export const INITIAL_TEAM_DATA = [
  // ==========================================
  // AWS SBG (AWS STUDENT BUILDER GROUP) MEMBERS
  // ==========================================
  {
    _id: "aws-lead-01",
    organization: "AWS_SBG",
    name: "Bhavikkumar Patel",
    email: "bhavik.itmbu@gmail.com",
    department: "Core Leadership",
    roleType: "Organizer",
    designation: "AWS SBG Leader / Organizer at ITMBU",
    isCoLead: false,
    semester: "5",
    branch: "B.Tech CSE",
    letterRefId: "AWS-SBG/ITMBU/2026-27/JL-LEAD-01",
    responsibilities: [
      "Direct overall strategic planning, campus outreach, and community execution for AWS SBG at ITM (sls) Baroda University.",
      "Liaise with AWS Academic and Community representatives and university administration.",
      "Lead and mentor core team directors and coordinators across all departments."
    ]
  },
  {
    _id: "aws-colead-01",
    organization: "AWS_SBG",
    name: "Tannvi Acharya",
    department: "Core Leadership",
    roleType: "Co-Organizer",
    designation: "Co-Organizer & Director of Event Management | Head Of Treasury | Head Of Women In Tech",
    isCoLead: false,
    semester: "5",
    branch: "B.Tech",
    letterRefId: "AWS-SBG/ITMBU/2026-27/JL-COLEAD-01",
    responsibilities: [
      "Co-lead the AWS Student Builder Group operations and coordinate cross-functional teams.",
      "Manage event workflows, logistics, and resource allocations."
    ]
  },
  {
    _id: "aws-colead-02",
    organization: "AWS_SBG",
    name: "Pratham Mahajan",
    department: "Core Leadership",
    roleType: "Co-Organizer",
    designation: "Co-Organizer & Director of Technical",
    isCoLead: false,
    semester: "5",
    branch: "B.Tech",
    letterRefId: "AWS-SBG/ITMBU/2026-27/JL-COLEAD-02",
    responsibilities: [
      "Drive cloud technical tracks, hands-on workshop execution, and architectural reviews.",
      "Lead technical team members in preparing demo environments and student projects."
    ]
  },

  // 1. Event Management Team (AWS SBG)
  {
    _id: "aws-em-01",
    organization: "AWS_SBG",
    name: "Tanvi Acharya",
    department: "Event Management",
    roleType: "Director",
    designation: "Director of Event Management / Treasurer",
    isCoLead: false,
    semester: "5",
    branch: "B.Tech",
    letterRefId: "AWS-SBG/ITMBU/2026-27/JL-EM-DIR",
    responsibilities: [
      "Direct end-to-end event planning, stage management, venue logistics, and treasury allocations.",
      "Oversee venue booking, scheduling, and protocol management for all AWS events."
    ]
  },
  {
    _id: "aws-em-02",
    organization: "AWS_SBG",
    name: "Yatri Patel",
    department: "Event Management",
    roleType: "Associate Coordinator",
    designation: "Associate Coordinator - Event Management",
    isCoLead: true,
    semester: "3",
    branch: "B.Tech",
    letterRefId: "AWS-SBG/ITMBU/2026-27/JL-EM-AC",
    responsibilities: [
      "Supervise on-ground event workflows, stage arrangements, and delegate check-ins.",
      "Coordinate event volunteers and manage attendee registrations."
    ]
  },
  {
    _id: "aws-em-03",
    organization: "AWS_SBG",
    name: "Jaggosheni Banerjee",
    department: "Event Management",
    roleType: "Core Member",
    designation: "Core Member - Event Management",
    isCoLead: false,
    semester: "3",
    branch: "B.Tech",
    letterRefId: "AWS-SBG/ITMBU/2026-27/JL-EM-01",
    responsibilities: [
      "Support logistics coordination, participant onboarding, and session transitions.",
      "Facilitate smooth execution during offline and online cloud meetups."
    ]
  },
  {
    _id: "aws-em-04",
    organization: "AWS_SBG",
    name: "Lakshya Gautam",
    department: "Event Management",
    roleType: "Core Member",
    designation: "Core Member - Event Management",
    isCoLead: false,
    semester: "3",
    branch: "B.Tech",
    letterRefId: "AWS-SBG/ITMBU/2026-27/JL-EM-02",
    responsibilities: [
      "Assist with venue setup, technical booth arrangements, and attendee assistance.",
      "Coordinate hospitality and feedback collection during cloud workshops."
    ]
  },

  // 2. Technical Team (AWS SBG)
  {
    _id: "aws-tech-01",
    organization: "AWS_SBG",
    name: "Pratham Mahajan",
    department: "Technical Team",
    roleType: "Director",
    designation: "Director of Technical Team",
    isCoLead: false,
    semester: "5",
    branch: "B.Tech",
    letterRefId: "AWS-SBG/ITMBU/2026-27/JL-TECH-DIR",
    responsibilities: [
      "Architect and lead technical hands-on sessions on AWS Services (EC2, S3, Lambda, Bedrock).",
      "Mentor students in cloud certifications and hackathon challenge preparation."
    ]
  },
  {
    _id: "aws-tech-02",
    organization: "AWS_SBG",
    name: "Nirav Gandhi",
    department: "Technical Team",
    roleType: "Associate Coordinator",
    designation: "Associate Coordinator - Technical Team",
    isCoLead: true,
    semester: "5",
    branch: "B.Tech",
    letterRefId: "AWS-SBG/ITMBU/2026-27/JL-TECH-AC",
    responsibilities: [
      "Co-manage technical workshop curricula, demo environments, and GitHub code repositories.",
      "Assist team members in debugging cloud deployments and serverless architectures."
    ]
  },
  {
    _id: "aws-tech-03",
    organization: "AWS_SBG",
    name: "Deep Lad",
    department: "Technical Team",
    roleType: "Core Member",
    designation: "Core Member - Technical Team",
    isCoLead: false,
    semester: "5",
    branch: "B.Tech",
    letterRefId: "AWS-SBG/ITMBU/2026-27/JL-TECH-01",
    responsibilities: [
      "Prepare AWS architecture labs, live code sandboxes, and technical documentation.",
      "Guide participants in resolving configuration challenges during bootcamps."
    ]
  },
  {
    _id: "aws-tech-04",
    organization: "AWS_SBG",
    name: "Priyanshu Patel",
    department: "Technical Team",
    roleType: "Core Member",
    designation: "Core Member - Technical Team",
    isCoLead: false,
    semester: "5",
    branch: "B.Tech",
    letterRefId: "AWS-SBG/ITMBU/2026-27/JL-TECH-02",
    responsibilities: [
      "Build sample cloud projects and facilitate hands-on labs during AWS SBG meetups.",
      "Assist in technical evaluation and challenge creations for club hackathons."
    ]
  },
  {
    _id: "aws-tech-05",
    organization: "AWS_SBG",
    name: "Krish Solanki",
    department: "Technical Team",
    roleType: "Core Member",
    designation: "Core Member - Technical Team",
    isCoLead: false,
    semester: "5",
    branch: "B.Tech",
    letterRefId: "AWS-SBG/ITMBU/2026-27/JL-TECH-03",
    responsibilities: [
      "Support cloud computing tutorials, infrastructure setups, and security best practice labs.",
      "Manage club digital assets and developer tools."
    ]
  },
  {
    _id: "aws-tech-06",
    organization: "AWS_SBG",
    name: "Priyanjali Chowksi",
    department: "Technical Team",
    roleType: "Core Member",
    designation: "Core Member - Technical Team",
    isCoLead: false,
    semester: "5",
    branch: "B.Tech",
    letterRefId: "AWS-SBG/ITMBU/2026-27/JL-TECH-04",
    responsibilities: [
      "Collaborate on cloud computing resource kits and beginner-friendly AWS roadmaps.",
      "Provide active technical support during live coding demonstrations."
    ]
  },

  // 3. Designing Team (AWS SBG)
  {
    _id: "aws-des-01",
    organization: "AWS_SBG",
    name: "Yashvi Patel",
    department: "Designing Team",
    roleType: "Director",
    designation: "Director of Design",
    isCoLead: false,
    semester: "5",
    branch: "B.Tech",
    letterRefId: "AWS-SBG/ITMBU/2026-27/JL-DES-DIR",
    responsibilities: [
      "Maintain brand identity and visual aesthetic compliance across all digital and print mediums.",
      "Lead the design team in creating high-impact posters, social kits, and event collateral."
    ]
  },
  {
    _id: "aws-des-02",
    organization: "AWS_SBG",
    name: "Keya Parikh",
    department: "Designing Team",
    roleType: "Associate Coordinator",
    designation: "Associate Coordinator - Designing Team",
    isCoLead: true,
    semester: "5",
    branch: "B.Tech",
    letterRefId: "AWS-SBG/ITMBU/2026-27/JL-DES-AC",
    responsibilities: [
      "Co-lead design production schedules, UI/UX conceptualization, and creative reviews.",
      "Deliver event banners, ID badges, and certification designs."
    ]
  },
  {
    _id: "aws-des-03",
    organization: "AWS_SBG",
    name: "Heli Patel",
    department: "Designing Team",
    roleType: "Core Member",
    designation: "Core Member - Designing Team",
    isCoLead: false,
    semester: "5",
    branch: "B.Tech",
    letterRefId: "AWS-SBG/ITMBU/2026-27/JL-DES-01",
    responsibilities: [
      "Design creative social media carousels, stories, and countdown teasers.",
      "Ensure strict adherence to AWS Community brand guidelines."
    ]
  },
  {
    _id: "aws-des-04",
    organization: "AWS_SBG",
    name: "Honey Limachiya",
    department: "Designing Team",
    roleType: "Core Member",
    designation: "Core Member - Designing Team",
    isCoLead: false,
    semester: "5",
    branch: "B.Tech",
    letterRefId: "AWS-SBG/ITMBU/2026-27/JL-DES-02",
    responsibilities: [
      "Create high-resolution graphics, stage backdrops, and promotional brochures.",
      "Collaborate with the Social Media team for visual campaigns."
    ]
  },
  {
    _id: "aws-des-05",
    organization: "AWS_SBG",
    name: "Devanshi Rana",
    department: "Designing Team",
    roleType: "Core Member",
    designation: "Core Member - Designing Team",
    isCoLead: false,
    semester: "3",
    branch: "B.Tech",
    letterRefId: "AWS-SBG/ITMBU/2026-27/JL-DES-03",
    responsibilities: [
      "Produce engaging illustrations, speaker profile cards, and event posters.",
      "Assist in motion graphics and video editing assets."
    ]
  },

  // 4. Social Media + HOST (AWS SBG)
  {
    _id: "aws-sm-01",
    organization: "AWS_SBG",
    name: "Shrey Patel",
    department: "Social Media + HOST",
    roleType: "Director",
    designation: "Director of Social Media",
    isCoLead: false,
    semester: "5",
    branch: "B.Tech",
    letterRefId: "AWS-SBG/ITMBU/2026-27/JL-SM-DIR",
    responsibilities: [
      "Strategize digital campaigns, community engagement, and social media growth.",
      "Manage official LinkedIn, Instagram, and Discord channels of AWS SBG ITMBU."
    ]
  },
  {
    _id: "aws-host-01",
    organization: "AWS_SBG",
    name: "Yatri Patel",
    department: "Social Media + HOST",
    roleType: "Head",
    designation: "Head of Hosting",
    isCoLead: false,
    semester: "3",
    branch: "B.Tech",
    letterRefId: "AWS-SBG/ITMBU/2026-27/JL-HOST-01",
    responsibilities: [
      "Anchor university-wide events, introduce keynote speakers, and moderate panel discussions.",
      "Maintain energetic audience interaction throughout technical conferences."
    ]
  },
  {
    _id: "aws-host-02",
    organization: "AWS_SBG",
    name: "Aatmaja Joshi",
    department: "Social Media + HOST",
    roleType: "Head",
    designation: "Head of Hosting",
    isCoLead: false,
    semester: "3",
    branch: "B.Tech",
    letterRefId: "AWS-SBG/ITMBU/2026-27/JL-HOST-02",
    responsibilities: [
      "Host live sessions, stage presentations, and community fireside chats.",
      "Coordinate speaking scripts and stage timing cues."
    ]
  },
  {
    _id: "aws-sm-02",
    organization: "AWS_SBG",
    name: "Nisarg Raval",
    department: "Social Media + HOST",
    roleType: "Associate Coordinator",
    designation: "Associate Coordinator - Social Media & Content",
    isCoLead: true,
    semester: "3",
    branch: "B.Tech",
    letterRefId: "AWS-SBG/ITMBU/2026-27/JL-SM-AC",
    responsibilities: [
      "Drive social media content calendar, post publishing, and live event coverage.",
      "Analyze audience reach and engagement metrics across platforms."
    ]
  },
  {
    _id: "aws-sm-03",
    organization: "AWS_SBG",
    name: "Shashanki Rawat",
    department: "Social Media + HOST",
    roleType: "Core Member",
    designation: "Core Member - Social Media + Hosting",
    isCoLead: false,
    semester: "3",
    branch: "B.Tech",
    letterRefId: "AWS-SBG/ITMBU/2026-27/JL-SM-01",
    responsibilities: [
      "Draft engaging copywriting, captions, and community newsletters.",
      "Assist in hosting duties and stage coordination during summits."
    ]
  },
  {
    _id: "aws-sm-04",
    organization: "AWS_SBG",
    name: "Nachiket Acharya",
    department: "Social Media + HOST",
    roleType: "Core Member",
    designation: "Core Member - Social Media & Media Relations",
    isCoLead: false,
    semester: "3",
    branch: "B.Tech",
    letterRefId: "AWS-SBG/ITMBU/2026-27/JL-SM-02",
    responsibilities: [
      "Capture photography, reels, and video highlights during live workshops.",
      "Interact with followers and manage community discussions."
    ]
  },
  {
    _id: "aws-sm-05",
    organization: "AWS_SBG",
    name: "Aliya Padriya",
    department: "Social Media + HOST",
    roleType: "Core Member",
    designation: "Core Member - Social Media & Media Relations",
    isCoLead: false,
    semester: "5",
    branch: "B.Tech",
    letterRefId: "AWS-SBG/ITMBU/2026-27/JL-SM-03",
    responsibilities: [
      "Coordinate cross-promotions with university departments and student clubs.",
      "Produce creative video reels and post-event highlight compilations."
    ]
  },
  {
    _id: "aws-sm-06",
    organization: "AWS_SBG",
    name: "Jaydev singh gohil",
    department: "Social Media + HOST",
    roleType: "Core Member",
    designation: "Core Member - Social Media + HOST",
    isCoLead: false,
    semester: "3",
    branch: "B.Tech",
    letterRefId: "AWS-SBG/ITMBU/2026-27/JL-SM-04",
    responsibilities: [
      "Support live broadcast management and streaming setups.",
      "Facilitate crowd engagement and live Q&A moderation."
    ]
  },

  // 5. Outreach and PR Team (AWS SBG)
  {
    _id: "aws-pr-01",
    organization: "AWS_SBG",
    name: "Smit Mekwan",
    department: "Outreach and PR",
    roleType: "Director",
    designation: "Director of Outreach and PR",
    isCoLead: false,
    semester: "5",
    branch: "B.Tech",
    letterRefId: "AWS-SBG/ITMBU/2026-27/JL-PR-DIR",
    responsibilities: [
      "Lead student outreach campaigns, external tie-ups, and PR communications.",
      "Expand the AWS SBG community footprint across colleges and developer circles."
    ]
  },
  {
    _id: "aws-pr-02",
    organization: "AWS_SBG",
    name: "Moksha Sethiya",
    department: "Outreach and PR",
    roleType: "Associate Coordinator",
    designation: "Associate Coordinator - Outreach & PR",
    isCoLead: true,
    semester: "3",
    branch: "B.Tech",
    letterRefId: "AWS-SBG/ITMBU/2026-27/JL-PR-AC",
    responsibilities: [
      "Drive campus-wide awareness campaigns and departmental collaborations.",
      "Liaise with external tech communities and coordinate ambassador networks."
    ]
  },
  {
    _id: "aws-pr-03",
    organization: "AWS_SBG",
    name: "Emmanuel Mecwan",
    department: "Outreach and PR",
    roleType: "Core Member",
    designation: "Core Member - Outreach and PR",
    isCoLead: false,
    semester: "3",
    branch: "B.Tech",
    letterRefId: "AWS-SBG/ITMBU/2026-27/JL-PR-01",
    responsibilities: [
      "Conduct classroom announcements, registration drives, and direct student outreach.",
      "Represent the club at campus events and onboarding desks."
    ]
  },
  {
    _id: "aws-pr-04",
    organization: "AWS_SBG",
    name: "Gomit Ghosh",
    department: "Outreach and PR",
    roleType: "Core Member",
    designation: "Core Member - Outreach and PR",
    isCoLead: false,
    semester: "3",
    branch: "B.Tech",
    letterRefId: "AWS-SBG/ITMBU/2026-27/JL-PR-02",
    responsibilities: [
      "Assist in partnership communications and guest speaker hospitality arrangements.",
      "Facilitate active communication channels between participants and organizers."
    ]
  },
  {
    _id: "aws-pr-05",
    organization: "AWS_SBG",
    name: "Khatri Geet",
    department: "Outreach and PR",
    roleType: "Core Member",
    designation: "Core Member - Outreach and PR",
    isCoLead: false,
    semester: "3",
    branch: "B.Tech",
    letterRefId: "AWS-SBG/ITMBU/2026-27/JL-PR-03",
    responsibilities: [
      "Engage engineering cohorts for cloud awareness drives and workshop registrations.",
      "Coordinate feedback collection and post-event survey drives."
    ]
  },
  {
    _id: "aws-pr-06",
    organization: "AWS_SBG",
    name: "Dhruhi Dodiya",
    department: "Outreach and PR",
    roleType: "Core Member",
    designation: "Core Member - Outreach and PR",
    isCoLead: false,
    semester: "3",
    branch: "B.Tech",
    letterRefId: "AWS-SBG/ITMBU/2026-27/JL-PR-04",
    responsibilities: [
      "Coordinate public relations campaigns and outreach circulars.",
      "Support on-campus information booths and member onboarding."
    ]
  },

  // 6. Community Partner & Advisors (AWS SBG)
  {
    _id: "aws-partner-01",
    organization: "AWS_SBG",
    name: "Vansham Kamboj",
    department: "Community Partner",
    roleType: "Head",
    designation: "Head - Techno+Techiz (Community Partner)",
    isCoLead: false,
    semester: "5",
    branch: "B.Tech",
    letterRefId: "AWS-SBG/ITMBU/2026-27/JL-PARTNER",
    responsibilities: [
      "Facilitate strategic partnerships, joint hackathons, and resource sharing with Techno+Techiz.",
      "Empower mutual tech community initiatives and developer network synergies."
    ]
  },
  {
    _id: "aws-adv-01",
    organization: "AWS_SBG",
    name: "Mannan Chauhan",
    department: "Community Partner",
    roleType: "Student Advisor",
    designation: "Student Advisor - AWS SBG",
    isCoLead: false,
    semester: "7",
    branch: "B.Tech CSE",
    letterRefId: "AWS-SBG/ITMBU/2026-27/JL-ADV-01",
    responsibilities: [
      "Provide high-level advisory guidance, executive mentorship, and strategic planning support to AWS SBG."
    ]
  },
  {
    _id: "aws-adv-02",
    organization: "AWS_SBG",
    name: "Indraneel Mandal",
    department: "Community Partner",
    roleType: "Student Advisor",
    designation: "Student Advisor - AWS SBG",
    isCoLead: false,
    semester: "7",
    branch: "B.Tech CSE",
    letterRefId: "AWS-SBG/ITMBU/2026-27/JL-ADV-02",
    responsibilities: [
      "Advise core team leadership on event management standards, university coordination, and technical direction."
    ]
  },

  // 7. Faculty Mentors (AWS SBG)
  {
    _id: "aws-fac-01",
    organization: "AWS_SBG",
    name: "Dr. Pradeep Laxkar",
    department: "Faculty Mentors",
    roleType: "Faculty Mentor",
    designation: "Faculty Mentor - AWS SBG ITMBU",
    isCoLead: false,
    semester: "Faculty",
    branch: "CSE / IT Department",
    letterRefId: "AWS-SBG/ITMBU/2026-27/JL-FAC-01",
    responsibilities: [
      "Provide institutional patronage, academic oversight, and strategic mentorship for all AWS SBG initiatives."
    ]
  },
  {
    _id: "aws-fac-02",
    organization: "AWS_SBG",
    name: "Shivangi Mateda",
    department: "Faculty Mentors",
    roleType: "Faculty Mentor",
    designation: "Faculty Mentor - AWS SBG ITMBU",
    isCoLead: false,
    semester: "Faculty",
    branch: "CSE / IT Department",
    letterRefId: "AWS-SBG/ITMBU/2026-27/JL-FAC-02",
    responsibilities: [
      "Mentor students in cloud technical education and facilitate university academic approvals."
    ]
  },
  {
    _id: "aws-fac-03",
    organization: "AWS_SBG",
    name: "Madoanna Lamin",
    department: "Faculty Mentors",
    roleType: "Faculty Mentor",
    designation: "Faculty Mentor - AWS SBG ITMBU",
    isCoLead: false,
    semester: "Faculty",
    branch: "CSE / IT Department",
    letterRefId: "AWS-SBG/ITMBU/2026-27/JL-FAC-03",
    responsibilities: [
      "Guide club operations and coordinate institutional logistics for national level cloud conferences."
    ]
  },

  // ==========================================
  // TECHNO LAB (TECHNO+TECHIZ) MEMBERS
  // ==========================================
  {
    _id: "techno-lead-01",
    organization: "TECHNO_LAB",
    name: "Vansham Kamboj",
    department: "Executive Leadership",
    roleType: "Organizer",
    designation: "President & Lead Organizer - Techno Lab",
    isCoLead: false,
    semester: "5",
    branch: "B.Tech CSE",
    letterRefId: "TECHNO-LAB/ITMBU/2026-27/JL-PRESIDENT-01",
    responsibilities: [
      "Spearhead technological innovations, robotics bootcamps, and developer initiatives across ITMBU.",
      "Manage club governance, cross-wing project allocations, and industrial tech partnerships.",
      "Lead and oversee executive leads and research wing directors."
    ]
  },
  {
    _id: "techno-lead-02",
    organization: "TECHNO_LAB",
    name: "Yatri Patel",
    department: "Executive Leadership",
    roleType: "Co-Organizer",
    designation: "Vice President & Operations Director",
    isCoLead: false,
    semester: "5",
    branch: "B.Tech",
    letterRefId: "TECHNO-LAB/ITMBU/2026-27/JL-VP-01",
    responsibilities: [
      "Oversee administrative workflows, internal lab operations, and event management synergy.",
      "Coordinate university approvals and cross-departmental student participation."
    ]
  },

  // Robotics & IoT Wing
  {
    _id: "techno-robot-01",
    organization: "TECHNO_LAB",
    name: "Dev Patel",
    department: "Robotics & IoT Wing",
    roleType: "Director",
    designation: "Director - Robotics & Embedded Systems",
    isCoLead: false,
    semester: "5",
    branch: "B.Tech Robotics/CSE",
    letterRefId: "TECHNO-LAB/ITMBU/2026-27/JL-ROBOT-01",
    responsibilities: [
      "Architect hardware prototyping workshops, Arduino/ESP32/Raspberry Pi research sessions.",
      "Guide students in national robotics competitions and drone building projects."
    ]
  },
  {
    _id: "techno-robot-02",
    organization: "TECHNO_LAB",
    name: "Meet Shah",
    department: "Robotics & IoT Wing",
    roleType: "Associate Coordinator",
    designation: "Associate Coordinator - IoT Innovations",
    isCoLead: true,
    semester: "3",
    branch: "B.Tech CSE",
    letterRefId: "TECHNO-LAB/ITMBU/2026-27/JL-ROBOT-02",
    responsibilities: [
      "Coordinate smart campus IoT deployments, sensor networks, and lab inventory maintenance.",
      "Conduct hands-on circuit assembly and PCB design masterclasses."
    ]
  },

  // AI & Machine Learning Wing
  {
    _id: "techno-ai-01",
    organization: "TECHNO_LAB",
    name: "Aman Sharma",
    department: "AI & Machine Learning Wing",
    roleType: "Director",
    designation: "Director - AI & Data Science",
    isCoLead: false,
    semester: "5",
    branch: "B.Tech CSE (AI/ML)",
    letterRefId: "TECHNO-LAB/ITMBU/2026-27/JL-AI-01",
    responsibilities: [
      "Direct neural network model training workshops, computer vision projects, and LLM implementations.",
      "Facilitate Kaggle hackathons and research paper reading cohorts."
    ]
  },
  {
    _id: "techno-ai-02",
    organization: "TECHNO_LAB",
    name: "Riya Desai",
    department: "AI & Machine Learning Wing",
    roleType: "Core Member",
    designation: "Core Member - Machine Learning",
    isCoLead: false,
    semester: "3",
    branch: "B.Tech CSE",
    letterRefId: "TECHNO-LAB/ITMBU/2026-27/JL-AI-02",
    responsibilities: [
      "Build deep learning demonstration pipelines and benchmark datasets for student experiments.",
      "Assist peer learners in model deployment and PyTorch/TensorFlow fundamentals."
    ]
  },

  // Web & App Development
  {
    _id: "techno-dev-01",
    organization: "TECHNO_LAB",
    name: "Bhavikkumar Patel",
    email: "bhavik.itmbu@gmail.com",
    department: "Web & App Development",
    roleType: "Director",
    designation: "Director - Full Stack & Cloud Architectures",
    isCoLead: false,
    semester: "5",
    branch: "B.Tech CSE",
    letterRefId: "TECHNO-LAB/ITMBU/2026-27/JL-DEV-01",
    responsibilities: [
      "Lead modern full stack web applications, cloud hosting, and enterprise software engineering projects.",
      "Architect core club portals, real-time databases, and internal developer tools."
    ]
  },
  {
    _id: "techno-dev-02",
    organization: "TECHNO_LAB",
    name: "Karan Joshi",
    department: "Web & App Development",
    roleType: "Associate Coordinator",
    designation: "Associate Coordinator - App Development",
    isCoLead: true,
    semester: "3",
    branch: "B.Tech CSE",
    letterRefId: "TECHNO-LAB/ITMBU/2026-27/JL-DEV-02",
    responsibilities: [
      "Guide cross-platform mobile app development with React Native and Flutter.",
      "Organize 24-hour web hackathons and peer code review clinics."
    ]
  },

  // Cyber Security & CP Wing
  {
    _id: "techno-cyber-01",
    organization: "TECHNO_LAB",
    name: "Harshil Dave",
    department: "Cyber Security & CP Wing",
    roleType: "Head",
    designation: "Head - Cyber Defense & Competitive Coding",
    isCoLead: false,
    semester: "5",
    branch: "B.Tech CSE",
    letterRefId: "TECHNO-LAB/ITMBU/2026-27/JL-CYBER-01",
    responsibilities: [
      "Lead Capture The Flag (CTF) challenges, network security audits, and penetration testing workshops.",
      "Organize algorithmic problem solving and Codeforces/LeetCode contests."
    ]
  },

  // Creative & Media Wing
  {
    _id: "techno-media-01",
    organization: "TECHNO_LAB",
    name: "Prachi Verma",
    department: "Creative & Media Wing",
    roleType: "Director",
    designation: "Director of Creative Design & Visual Media",
    isCoLead: false,
    semester: "5",
    branch: "B.Tech",
    letterRefId: "TECHNO-LAB/ITMBU/2026-27/JL-MEDIA-01",
    responsibilities: [
      "Direct UI/UX aesthetic styling, 3D motion graphics, and technological showcase visual kits.",
      "Manage social media branding and project spotlight reels."
    ]
  },

  // Outreach & Event Operations
  {
    _id: "techno-ops-01",
    organization: "TECHNO_LAB",
    name: "Sahil Rathod",
    department: "Outreach & Event Operations",
    roleType: "Head",
    designation: "Head - Outreach & Tech Expos",
    isCoLead: false,
    semester: "5",
    branch: "B.Tech",
    letterRefId: "TECHNO-LAB/ITMBU/2026-27/JL-OPS-01",
    responsibilities: [
      "Manage technological exhibition setups, keynote guest logistics, and university sponsorships.",
      "Coordinate university outreach for the annual flagship tech fest."
    ]
  },

  // Advisory & Mentors (Techno Lab)
  {
    _id: "techno-adv-01",
    organization: "TECHNO_LAB",
    name: "Mannan Chauhan",
    department: "Advisory & Mentors",
    roleType: "Student Advisor",
    designation: "Senior Student Advisor - Techno Lab",
    isCoLead: false,
    semester: "7",
    branch: "B.Tech CSE",
    letterRefId: "TECHNO-LAB/ITMBU/2026-27/JL-ADV-01",
    responsibilities: [
      "Provide executive advisory counsel on tech lab operations, research roadmaps, and student leadership."
    ]
  },
  {
    _id: "techno-adv-02",
    organization: "TECHNO_LAB",
    name: "Indraneel Mandal",
    department: "Advisory & Mentors",
    roleType: "Student Advisor",
    designation: "Senior Student Advisor - Techno Lab",
    isCoLead: false,
    semester: "7",
    branch: "B.Tech CSE",
    letterRefId: "TECHNO-LAB/ITMBU/2026-27/JL-ADV-02",
    responsibilities: [
      "Advise core members on advanced system architectures, project incubation, and industry standards."
    ]
  },
  {
    _id: "techno-fac-01",
    organization: "TECHNO_LAB",
    name: "Dr. Pradeep Laxkar",
    department: "Advisory & Mentors",
    roleType: "Faculty Mentor",
    designation: "Faculty Patron / Head CSE",
    isCoLead: false,
    semester: "Faculty",
    branch: "Department of CSE / IT",
    letterRefId: "TECHNO-LAB/ITMBU/2026-27/JL-FAC-01",
    responsibilities: [
      "Provide departmental patronage, research laboratory grants, and institutional academic guidance."
    ]
  },

  // ==========================================
  // GDGOC ITMBU (GOOGLE DEVELOPER GROUPS ON CAMPUS) MEMBERS
  // ==========================================
  {
    _id: "gdgoc-lead-01",
    organization: "GDGOC",
    name: "Bhavikkumar Patel",
    email: "bhavik.itmbu@gmail.com",
    department: "Core Leadership",
    roleType: "Organizer",
    designation: "GDGoC Community Lead / Organizer",
    isCoLead: false,
    semester: "5",
    branch: "B.Tech CSE",
    letterRefId: "GDGOC/ITMBU/2026-27/JL-LEAD-01",
    responsibilities: [
      "Lead Google Developer Groups on Campus (GDGoC) chapter execution, developer workshops, and Google Solution Challenge hackathons.",
      "Liaise with Google Developer Relations team and university leadership.",
      "Mentor domain directors across Flutter, Cloud, Web, and Machine Learning tracks."
    ]
  },
  {
    _id: "gdgoc-web-01",
    organization: "GDGOC",
    name: "Aryan Patel",
    email: "aryan.patel@itmbu.ac.in",
    department: "Web Development Wing",
    roleType: "Director",
    designation: "Lead - Web Technologies & Angular/React",
    isCoLead: false,
    semester: "5",
    branch: "B.Tech CSE",
    letterRefId: "GDGOC/ITMBU/2026-27/JL-WEB-01",
    responsibilities: [
      "Conduct hands-on codelabs on modern Progressive Web Apps, Angular, React, and Firebase.",
      "Maintain GDGoC chapter portal and open-source campus web applications."
    ]
  },
  {
    _id: "gdgoc-app-01",
    organization: "GDGOC",
    name: "Kavya Shah",
    email: "kavya.shah@itmbu.ac.in",
    department: "Android & Flutter Wing",
    roleType: "Director",
    designation: "Lead - Android & Flutter Development",
    isCoLead: false,
    semester: "5",
    branch: "B.Tech CSE",
    letterRefId: "GDGOC/ITMBU/2026-27/JL-APP-01",
    responsibilities: [
      "Direct Flutter and Kotlin Android application bootcamps and multi-platform app projects.",
      "Lead participation in Google Developer Student Solution Challenge."
    ]
  },
  {
    _id: "gdgoc-cloud-01",
    organization: "GDGOC",
    name: "Yashvi Joshi",
    email: "yashvi.joshi@itmbu.ac.in",
    department: "Cloud & DevOps Wing",
    roleType: "Director",
    designation: "Lead - Google Cloud & DevOps",
    isCoLead: false,
    semester: "5",
    branch: "B.Tech CSE",
    letterRefId: "GDGOC/ITMBU/2026-27/JL-CLOUD-01",
    responsibilities: [
      "Organize Google Cloud Study Jams, Kubernetes masterclasses, and GCP certification drives.",
      "Guide students on Cloud Functions, BigQuery, and Docker deployments."
    ]
  },
  {
    _id: "gdgoc-ai-01",
    organization: "GDGOC",
    name: "Devanshu Rathod",
    email: "devanshu.r@itmbu.ac.in",
    department: "AI & Machine Learning Wing",
    roleType: "Director",
    designation: "Lead - TensorFlow & Gemini AI",
    isCoLead: false,
    semester: "5",
    branch: "B.Tech CSE (AI/ML)",
    letterRefId: "GDGOC/ITMBU/2026-27/JL-AI-01",
    responsibilities: [
      "Host workshops on Google Gemini API, TensorFlow, Kaggle competitions, and Generative AI.",
      "Spearhead AI projects tackling real-world sustainability and campus challenges."
    ]
  },
  {
    _id: "gdgoc-design-01",
    organization: "GDGOC",
    name: "Riddhi Parmar",
    email: "riddhi.p@itmbu.ac.in",
    department: "UI/UX & Creative Wing",
    roleType: "Director",
    designation: "Lead - UI/UX & Brand Creative",
    isCoLead: false,
    semester: "3",
    branch: "B.Tech CSE",
    letterRefId: "GDGOC/ITMBU/2026-27/JL-DES-01",
    responsibilities: [
      "Drive Google Material Design 3 guidelines compliance across all digital assets and badges.",
      "Design interactive prototypes, Figma community kits, and event visual identities."
    ]
  },
  {
    _id: "gdgoc-pr-01",
    organization: "GDGOC",
    name: "Siddharth Dave",
    email: "siddharth.d@itmbu.ac.in",
    department: "Outreach & Event Operations",
    roleType: "Associate Coordinator",
    designation: "Associate Coordinator - Community & PR",
    isCoLead: true,
    semester: "3",
    branch: "B.Tech CSE",
    letterRefId: "GDGOC/ITMBU/2026-27/JL-PR-01",
    responsibilities: [
      "Oversee community registrations, social outreach, and cross-chapter collaborative hackathons.",
      "Coordinate DevFest celebrations and tech talk speaker logistics."
    ]
  },
  {
    _id: "gdgoc-fac-01",
    organization: "GDGOC",
    name: "Dr. Pradeep Laxkar",
    email: "pradeep.laxkar@itmbu.ac.in",
    department: "Faculty Mentors & Advisory",
    roleType: "Faculty Mentor",
    designation: "Faculty Advisor & Head CSE",
    isCoLead: false,
    semester: "Faculty",
    branch: "Department of CSE",
    letterRefId: "GDGOC/ITMBU/2026-27/JL-FAC-01",
    responsibilities: [
      "Provide institutional faculty mentorship, academic alignment, and official endorsement for GDGoC initiatives."
    ]
  }
];
