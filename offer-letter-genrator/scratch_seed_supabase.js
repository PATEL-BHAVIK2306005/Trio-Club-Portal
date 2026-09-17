const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const SUPABASE_URL = 'https://hbuhkenlctqefgpqxiah.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_8ng1nrZRN0sP_Kohwj1jjg_mD0ZHsSc';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Helper to convert from JS member model to Supabase DB payload
const mapToDbMember = (member) => ({
  name: member.name,
  email: member.email || (member.name ? `${member.name.toLowerCase().replace(/[^a-z0-9]/g, '.')}@itmbu.ac.in` : null),
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

async function runSeed() {
  console.log('Seeding Supabase tables with verified rosters...');

  // Read teamData from src
  const content = fs.readFileSync('./src/data/teamData.js', 'utf8');
  // Simple extraction of initial data
  const { INITIAL_TEAM_DATA } = require('./src/data/teamDataCommon.js');

  const rows = INITIAL_TEAM_DATA.map(mapToDbMember);
  console.log(`Inserting ${rows.length} members into Supabase...`);

  const { data, error } = await supabase.from('members').insert(rows).select();

  if (error) {
    console.error('Seed Error:', error);
  } else {
    console.log(`✓ Successfully seeded ${data.length} members into Supabase PostgreSQL Cloud!`);
  }
}
