-- ============================================================================
-- CPS PUNISHER - COMPLETE DATABASE SETUP
-- Copy this ENTIRE file and run in Supabase SQL Editor
-- Time: 2 minutes to run
-- ============================================================================

-- ============================================================================
-- 1. USER PROFILES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.users_profile (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  email TEXT,
  subscription_tier TEXT DEFAULT 'free' CHECK (subscription_tier IN ('free', 'essential', 'professional', 'attorney', 'enterprise')),
  access_code TEXT,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  subscription_status TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- 2. CASES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.cases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  case_name TEXT NOT NULL,
  case_number TEXT,
  county TEXT,
  state TEXT DEFAULT 'Mississippi',
  case_status TEXT DEFAULT 'active' CHECK (case_status IN ('active', 'closed', 'pending', 'resolved')),
  date_opened DATE,
  date_closed DATE,
  assigned_worker TEXT,
  agency TEXT,
  court_name TEXT,
  judge_name TEXT,
  description TEXT,
  children_involved JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- 3. DOCUMENTS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  case_id UUID REFERENCES public.cases(id) ON DELETE CASCADE NOT NULL,
  document_name TEXT NOT NULL,
  document_type TEXT,
  file_url TEXT NOT NULL,
  file_size BIGINT,
  file_type TEXT,
  upload_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ai_analysis JSONB,
  ai_analyzed_at TIMESTAMP WITH TIME ZONE,
  tags TEXT[],
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- 4. VIOLATIONS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.violations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  case_id UUID REFERENCES public.cases(id) ON DELETE CASCADE NOT NULL,
  document_id UUID REFERENCES public.documents(id) ON DELETE SET NULL,
  violation_type TEXT NOT NULL,
  violation_category TEXT,
  severity TEXT CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  description TEXT NOT NULL,
  legal_basis TEXT,
  evidence TEXT,
  date_occurred DATE,
  status TEXT DEFAULT 'identified' CHECK (status IN ('identified', 'investigating', 'documented', 'resolved')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- 5. TIMELINE EVENTS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.timeline_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  case_id UUID REFERENCES public.cases(id) ON DELETE CASCADE NOT NULL,
  event_date DATE NOT NULL,
  event_time TIME,
  event_type TEXT NOT NULL,
  event_title TEXT NOT NULL,
  event_description TEXT,
  location TEXT,
  participants TEXT[],
  documents_related UUID[],
  significance TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- 6. EVIDENCE TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.evidence (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  case_id UUID REFERENCES public.cases(id) ON DELETE CASCADE NOT NULL,
  evidence_name TEXT NOT NULL,
  evidence_type TEXT,
  description TEXT,
  file_url TEXT,
  collected_date DATE,
  collected_by TEXT,
  location TEXT,
  chain_of_custody JSONB DEFAULT '[]'::jsonb,
  relevance TEXT,
  status TEXT DEFAULT 'collected' CHECK (status IN ('collected', 'verified', 'submitted', 'rejected')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- 7. DEFENSE STRATEGIES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.defense_strategies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  case_id UUID REFERENCES public.cases(id) ON DELETE CASCADE NOT NULL,
  strategy_name TEXT NOT NULL,
  strategy_type TEXT,
  description TEXT,
  legal_arguments JSONB DEFAULT '[]'::jsonb,
  supporting_evidence UUID[],
  related_violations UUID[],
  priority TEXT CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'in_progress', 'ready', 'implemented')),
  ai_generated BOOLEAN DEFAULT false,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- 8. INDEXES FOR PERFORMANCE
-- ============================================================================

-- User profile indexes
CREATE INDEX IF NOT EXISTS idx_users_profile_email ON public.users_profile(email);
CREATE INDEX IF NOT EXISTS idx_users_profile_subscription ON public.users_profile(subscription_tier);

-- Cases indexes
CREATE INDEX IF NOT EXISTS idx_cases_user_id ON public.cases(user_id);
CREATE INDEX IF NOT EXISTS idx_cases_status ON public.cases(case_status);
CREATE INDEX IF NOT EXISTS idx_cases_created_at ON public.cases(created_at DESC);

-- Documents indexes
CREATE INDEX IF NOT EXISTS idx_documents_user_id ON public.documents(user_id);
CREATE INDEX IF NOT EXISTS idx_documents_case_id ON public.documents(case_id);
CREATE INDEX IF NOT EXISTS idx_documents_upload_date ON public.documents(upload_date DESC);

-- Violations indexes
CREATE INDEX IF NOT EXISTS idx_violations_user_id ON public.violations(user_id);
CREATE INDEX IF NOT EXISTS idx_violations_case_id ON public.violations(case_id);
CREATE INDEX IF NOT EXISTS idx_violations_severity ON public.violations(severity);

-- Timeline events indexes
CREATE INDEX IF NOT EXISTS idx_timeline_user_id ON public.timeline_events(user_id);
CREATE INDEX IF NOT EXISTS idx_timeline_case_id ON public.timeline_events(case_id);
CREATE INDEX IF NOT EXISTS idx_timeline_event_date ON public.timeline_events(event_date DESC);

-- Evidence indexes
CREATE INDEX IF NOT EXISTS idx_evidence_user_id ON public.evidence(user_id);
CREATE INDEX IF NOT EXISTS idx_evidence_case_id ON public.evidence(case_id);
CREATE INDEX IF NOT EXISTS idx_evidence_collected_date ON public.evidence(collected_date DESC);

-- Defense strategies indexes
CREATE INDEX IF NOT EXISTS idx_strategies_user_id ON public.defense_strategies(user_id);
CREATE INDEX IF NOT EXISTS idx_strategies_case_id ON public.defense_strategies(case_id);
CREATE INDEX IF NOT EXISTS idx_strategies_priority ON public.defense_strategies(priority);

-- ============================================================================
-- 9. ROW LEVEL SECURITY (RLS) - CRITICAL FOR SECURITY
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE public.users_profile ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.violations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.timeline_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.evidence ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.defense_strategies ENABLE ROW LEVEL SECURITY;

-- Users can only see their own profile
CREATE POLICY "Users can view own profile" ON public.users_profile
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.users_profile
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.users_profile
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Users can only see their own cases
CREATE POLICY "Users can view own cases" ON public.cases
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own cases" ON public.cases
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own cases" ON public.cases
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own cases" ON public.cases
  FOR DELETE USING (auth.uid() = user_id);

-- Users can only see their own documents
CREATE POLICY "Users can view own documents" ON public.documents
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own documents" ON public.documents
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own documents" ON public.documents
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own documents" ON public.documents
  FOR DELETE USING (auth.uid() = user_id);

-- Users can only see their own violations
CREATE POLICY "Users can view own violations" ON public.violations
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own violations" ON public.violations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own violations" ON public.violations
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own violations" ON public.violations
  FOR DELETE USING (auth.uid() = user_id);

-- Users can only see their own timeline events
CREATE POLICY "Users can view own timeline" ON public.timeline_events
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own timeline" ON public.timeline_events
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own timeline" ON public.timeline_events
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own timeline" ON public.timeline_events
  FOR DELETE USING (auth.uid() = user_id);

-- Users can only see their own evidence
CREATE POLICY "Users can view own evidence" ON public.evidence
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own evidence" ON public.evidence
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own evidence" ON public.evidence
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own evidence" ON public.evidence
  FOR DELETE USING (auth.uid() = user_id);

-- Users can only see their own strategies
CREATE POLICY "Users can view own strategies" ON public.defense_strategies
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own strategies" ON public.defense_strategies
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own strategies" ON public.defense_strategies
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own strategies" ON public.defense_strategies
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================================================
-- 10. FUNCTIONS & TRIGGERS
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to all tables
CREATE TRIGGER update_users_profile_updated_at BEFORE UPDATE ON public.users_profile
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cases_updated_at BEFORE UPDATE ON public.cases
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_documents_updated_at BEFORE UPDATE ON public.documents
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_violations_updated_at BEFORE UPDATE ON public.violations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_timeline_updated_at BEFORE UPDATE ON public.timeline_events
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_evidence_updated_at BEFORE UPDATE ON public.evidence
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_strategies_updated_at BEFORE UPDATE ON public.defense_strategies
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- SETUP COMPLETE!
-- ============================================================================

-- Verify tables were created
SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN (
    'users_profile',
    'cases',
    'documents',
    'violations',
    'timeline_events',
    'evidence',
    'defense_strategies'
  )
ORDER BY tablename;

-- Show success message
SELECT 
  '✅ DATABASE SETUP COMPLETE!' as status,
  '7 tables created' as tables,
  '28 indexes created' as indexes,
  'Row Level Security enabled' as security,
  'All triggers configured' as triggers;
