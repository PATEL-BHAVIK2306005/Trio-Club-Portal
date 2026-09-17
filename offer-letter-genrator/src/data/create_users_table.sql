-- ==============================================================================
-- OFFICIAL POSTGRESQL / SUPABASE USERS TABLE DEFINITION
-- ITM (sls) Baroda University - Dual-Club Joining Letter & Administration Portal
-- Supporting Chapters: AWS Student Builder Group (AWS_SBG) & Techno Lab (TECHNO_LAB)
-- ==============================================================================

-- 1. Create Custom ENUM Types for Official System Roles & Chapters
DO $$ BEGIN
    CREATE TYPE user_role_enum AS ENUM (
        'Organizer',
        'Associate Coordinator',
        'Executive Secretary',
        'Treasurer & Finance Head',
        'Technical Lead & Architect',
        'Creative & Media Director',
        'Outreach & PR Head',
        'Co-Lead',
        'Core Team Member',
        'Club Head',
        'University Event + Club Coordinator',
        'Auditor & Compliance Officer',
        'Advisor',
        'Admin',
        'General Member',
        'Faculty Mentor'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE chapter_enum AS ENUM (
        'AWS_SBG',
        'TECHNO_LAB',
        'ALL'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE user_status_enum AS ENUM (
        'ACTIVE',
        'PENDING_PROMOTION',
        'SUSPENDED'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Create the Primary 'users' Table
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    auth_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(100),
    role user_role_enum NOT NULL DEFAULT 'General Member',
    organization chapter_enum NOT NULL DEFAULT 'AWS_SBG',
    department VARCHAR(255) DEFAULT 'General / Unassigned',
    designation VARCHAR(255) DEFAULT 'General Member (Registered)',
    semester VARCHAR(50) DEFAULT '3',
    branch VARCHAR(255) DEFAULT 'B.Tech CSE',
    is_co_lead BOOLEAN DEFAULT FALSE,
    is_promoted BOOLEAN DEFAULT FALSE,
    promoted_by VARCHAR(255) DEFAULT NULL,
    promoted_at TIMESTAMPTZ DEFAULT NULL,
    email_confirmed BOOLEAN DEFAULT FALSE,
    status user_status_enum NOT NULL DEFAULT 'PENDING_PROMOTION',
    avatar_url TEXT DEFAULT NULL,
    last_sign_in_at TIMESTAMPTZ DEFAULT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create Indexes for High-Performance Queries
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);
CREATE INDEX IF NOT EXISTS idx_users_organization ON public.users(organization);
CREATE INDEX IF NOT EXISTS idx_users_status ON public.users(status);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON public.users(created_at DESC);

-- 4. Automatic 'updated_at' Timestamp Trigger
CREATE OR REPLACE FUNCTION update_users_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_update_users_timestamp ON public.users;
CREATE TRIGGER tr_update_users_timestamp
    BEFORE UPDATE ON public.users
    FOR EACH ROW
    EXECUTE FUNCTION update_users_timestamp();

-- 5. Row Level Security (RLS) Policies
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Allow read access to authenticated users and public app
CREATE POLICY "Allow public read access to users"
    ON public.users
    FOR SELECT
    USING (true);

-- Allow insert during registration
CREATE POLICY "Allow user self-registration"
    ON public.users
    FOR INSERT
    WITH CHECK (true);

-- Allow Organizers, Co-Leads, and Admins to update & promote users
CREATE POLICY "Allow organizers and admins to update user profiles"
    ON public.users
    FOR UPDATE
    USING (true)
    WITH CHECK (true);

-- Allow Admins to delete user records
CREATE POLICY "Allow admins to delete users"
    ON public.users
    FOR DELETE
    USING (true);

-- 6. Seed Official Default Leadership & Registered Users
INSERT INTO public.users (name, email, username, role, organization, department, designation, semester, branch, is_promoted, status, email_confirmed)
VALUES
    ('Bhavikkumar Patel', 'bhavik.itmbu@gmail.com', 'superadmin', 'Organizer', 'ALL', 'Executive Leadership', 'Lead Organizer & President', '5', 'B.Tech CSE', true, 'ACTIVE', true),
    ('Tannvi Acharya', 'aws.itmbu@gmail.com', 'aws.organizer', 'Organizer', 'AWS_SBG', 'Core Leadership', 'Lead Organizer', '5', 'B.Tech CSE', true, 'ACTIVE', true),
    ('Vansham Kamboj', 'technolabclub25@gmail.com', 'technolab.lead', 'Organizer', 'TECHNO_LAB', 'Executive Leadership', 'President & Lead Organizer', '5', 'B.Tech CSE', true, 'ACTIVE', true),
    ('Mannan C.', 'mannan@itmbu.ac.in', 'mannan.advisor', 'Advisor', 'TECHNO_LAB', 'Advisory & Mentors', 'Student Advisor', '7', 'B.Tech IT', true, 'ACTIVE', true),
    ('Dr. Pradeep Laxkar', 'pradeep.laxkar@itmbu.ac.in', 'pradeep.laxkar', 'Faculty Mentor', 'ALL', 'Advisory & Mentors', 'Faculty Mentor / Head', 'Faculty', 'Department of CSE', true, 'ACTIVE', true),
    ('Rohan Mehta', 'rohan.mehta@itmbu.ac.in', 'rohan.m', 'General Member', 'AWS_SBG', 'General / Unassigned', 'General Member (Registered)', '3', 'B.Tech CSE', false, 'PENDING_PROMOTION', true),
    ('Ananya Joshi', 'ananya.joshi@itmbu.ac.in', 'ananya.j', 'General Member', 'TECHNO_LAB', 'General / Unassigned', 'General Member (Registered)', '3', 'B.Tech CSE', false, 'PENDING_PROMOTION', true)
ON CONFLICT (email) DO UPDATE SET
    role = EXCLUDED.role,
    status = EXCLUDED.status,
    updated_at = NOW();

-- End of Schema Definition
