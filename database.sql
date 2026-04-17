-- Supabase Schema for Domestic Violence Case Analyzer

-- Create enum for severity levels
CREATE TYPE severity_level AS ENUM ('low', 'moderate', 'high', 'critical');

-- Create enum for case status
CREATE TYPE case_status AS ENUM ('draft', 'analyzed');

-- Cases Table
CREATE TABLE public.cases (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    victim_name TEXT NOT NULL,
    abuse_type TEXT NOT NULL,
    threat_level TEXT NOT NULL,
    statement_text TEXT,
    severity severity_level,
    risk_score INTEGER,
    escalation_level TEXT,
    abuse_patterns JSONB DEFAULT '[]'::jsonb,
    status case_status DEFAULT 'draft',
    urgency TEXT,
    user_id UUID REFERENCES auth.users(id) -- For row level security
);

-- Timeline Events Table
CREATE TABLE public.timeline_events (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    case_id UUID REFERENCES public.cases(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    description TEXT NOT NULL,
    severity severity_level DEFAULT 'low',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Documents reference (Simplified)
CREATE TABLE public.documents (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    case_id UUID REFERENCES public.cases(id) ON DELETE CASCADE,
    file_name TEXT NOT NULL,
    file_type TEXT NOT NULL,
    file_size INTEGER,
    storage_path TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add Row Level Security (RLS)
ALTER TABLE public.cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.timeline_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to view/manage only their own cases
CREATE POLICY "Users can view their own cases" ON public.cases
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own cases" ON public.cases
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own cases" ON public.cases
    FOR UPDATE USING (auth.uid() = user_id);

-- Apply similar policies to child tables
CREATE POLICY "Users can manage timeline events for their cases" ON public.timeline_events
    FOR ALL USING (case_id IN (SELECT id FROM public.cases WHERE user_id = auth.uid()));

CREATE POLICY "Users can manage documents for their cases" ON public.documents
    FOR ALL USING (case_id IN (SELECT id FROM public.cases WHERE user_id = auth.uid()));
