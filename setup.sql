-- Supabase Setup Script for MathSoc Fresher Orientation

-- 1. Create the registrations table
CREATE TABLE public.registrations (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    name text NOT NULL,
    entry_number text NOT NULL UNIQUE,
    team text NOT NULL,
    ip_address text UNIQUE,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Enable Row Level Security (RLS)
ALTER TABLE public.registrations ENABLE ROW LEVEL SECURITY;

-- 3. Create a policy to allow anonymous inserts (users registering themselves)
CREATE POLICY "Allow anonymous inserts" ON public.registrations
    FOR INSERT
    TO anon
    WITH CHECK (true);

-- 4. Create a policy to allow anonymous reads (to check if an IP or entry number already exists)
CREATE POLICY "Allow anonymous read of own IP" ON public.registrations
    FOR SELECT
    TO anon
    USING (true);
