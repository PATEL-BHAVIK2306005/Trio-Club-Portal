const { createClient } = require('@supabase/supabase-js');
const seedMembers = require('../Offer-Letter-DB/data/seedData');

const SUPABASE_URL = 'https://hbuhkenlctqefgpqxiah.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_8ng1nrZRN0sP_Kohwj1jjg_mD0ZHsSc';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const gdgocMembers = [
  {
    organization: "GDGOC",
    name: "Harshil Vaghela",
    department: "Core Technical Track",
    roleType: "Organizer",
    designation: "GDGoC Campus Lead / Organizer",
    isCoLead: false,
    semester: "5",
    branch: "B.Tech CSE",
    letterRefId: "GDGOC/ITMBU/2026-27/JL-LEAD-01",
    responsibilities: [
      "Direct overall Google Developer Groups on Campus roadmap and student ecosystem at ITMBU.",
      "Liaise with Google Developer Relations and regional community coordinators.",
      "Lead technical tracks across Web, Android, Cloud, AI/ML, and Flutter."
    ]
  },
  {
    organization: "GDGOC",
    name: "Aman Shah",
    department: "Web & Cloud Track",
    roleType: "Associate Coordinator",
    designation: "Associate Coordinator - Web & Cloud Track",
    isCoLead: true,
    semester: "5",
    branch: "B.Tech CSE",
    letterRefId: "GDGOC/ITMBU/2026-27/JL-WEB-01",
    responsibilities: [
      "Coordinate full-stack web workshops, cloud deployments, and hands-on coding labs.",
      "Mentor junior developers in open-source development and Git/GitHub."
    ]
  },
  {
    organization: "GDGOC",
    name: "Rohan Trivedi",
    department: "Android & Mobile Track",
    roleType: "Core Team Member",
    designation: "Android & Kotlin Technical Lead",
    isCoLead: false,
    semester: "5",
    branch: "B.Tech CSE",
    letterRefId: "GDGOC/ITMBU/2026-27/JL-MOB-01",
    responsibilities: [
      "Lead mobile development study jams using Kotlin, Jetpack Compose, and Flutter.",
      "Guide students in publishing apps on Google Play Store."
    ]
  },
  {
    organization: "GDGOC",
    name: "Pooja Mehta",
    department: "AI / ML & Data Track",
    roleType: "Core Team Member",
    designation: "AI & Machine Learning Lead",
    isCoLead: false,
    semester: "5",
    branch: "B.Tech CSE (AI & DS)",
    letterRefId: "GDGOC/ITMBU/2026-27/JL-AIML-01",
    responsibilities: [
      "Organize TensorFlow, PyTorch, and Google Cloud Vertex AI study groups.",
      "Direct hands-on AI project incubation and Kaggle hackathon preparation."
    ]
  },
  {
    organization: "GDGOC",
    name: "Yashvi Shah",
    department: "Design & UI/UX Track",
    roleType: "Associate Coordinator",
    designation: "Associate Coordinator - Creative & UI/UX Track",
    isCoLead: true,
    semester: "5",
    branch: "B.Tech CSE",
    letterRefId: "GDGOC/ITMBU/2026-27/JL-DSGN-01",
    responsibilities: [
      "Lead design sprints, Figma prototypes, and Material 3 design system adherence.",
      "Direct creative visual identities for all GDGoC ITMBU campaigns."
    ]
  },
  {
    organization: "GDGOC",
    name: "Prof. Bhumika Patel",
    department: "Faculty Mentors",
    roleType: "Faculty Mentor",
    designation: "Faculty Advisor & Mentor (CSE & IT Department)",
    isCoLead: false,
    semester: "Faculty",
    branch: "CSE & IT Department",
    letterRefId: "GDGOC/ITMBU/2026-27/JL-FAC-01",
    responsibilities: [
      "Provide official academic guidance, institutional compliance, and faculty patronage.",
      "Authorize chapter events and endorse official appointments."
    ]
  }
];

const allMembersToSeed = [...seedMembers, ...gdgocMembers];

// Schema-exact mapping (matches Supabase PostgreSQL table columns exactly)
const mapToDbMember = (member) => ({
  name: member.name,
  department: member.department || 'General',
  role_type: member.roleType || 'Core Member',
  designation: member.designation || '',
  is_co_lead: Boolean(member.isCoLead),
  semester: member.semester || '3',
  branch: member.branch || 'B.Tech CSE',
  letter_ref_id: member.letterRefId || '',
  status: member.status || 'Issued',
  responsibilities: Array.isArray(member.responsibilities) ? member.responsibilities : [],
  organization: member.organization || 'AWS_SBG',
  updated_at: new Date().toISOString()
});

async function main() {
  console.log(`Connecting to Supabase at: ${SUPABASE_URL}`);
  
  // 1. Clear existing rows
  const { error: delError } = await supabase.from('members').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  if (delError) console.warn('Delete warning:', delError.message);

  // 2. Insert all in chunks of 20
  const rows = allMembersToSeed.map(mapToDbMember);
  console.log(`Inserting total ${rows.length} members across AWS SBG, Techno Lab, and GDGoC ITMBU...`);

  let insertedCount = 0;
  for (let i = 0; i < rows.length; i += 20) {
    const chunk = rows.slice(i, i + 20);
    const { data, error } = await supabase.from('members').insert(chunk).select();
    if (error) {
      console.error(`Chunk error (${i}-${i+20}):`, error);
    } else {
      insertedCount += (data ? data.length : chunk.length);
      console.log(`✓ Inserted chunk ${Math.floor(i / 20) + 1} (${insertedCount}/${rows.length})`);
    }
  }

  // 3. Verify total in database
  const { data: verifyData, error: verifyError } = await supabase.from('members').select('*');
  if (verifyError) {
    console.error('Verify error:', verifyError);
  } else {
    console.log(`🎉 SUCCESS! Supabase PostgreSQL Cloud now contains ${verifyData.length} LIVE verified members across all 3 chapters!`);
  }
}

main();
