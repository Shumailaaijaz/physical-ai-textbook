-- Physical AI Textbook Platform Database Migration
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Create personalization_profiles table
CREATE TABLE IF NOT EXISTS personalization_profiles (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  python_skill TEXT CHECK (python_skill IN ('beginner', 'intermediate', 'advanced')) DEFAULT 'beginner',
  ros_experience TEXT CHECK (ros_experience IN ('none', 'basic', 'intermediate', 'advanced')) DEFAULT 'none',
  linux_familiarity TEXT CHECK (linux_familiarity IN ('none', 'basic', 'intermediate', 'advanced')) DEFAULT 'none',
  gpu_access TEXT CHECK (gpu_access IN ('none', 'integrated', 'dedicated_consumer', 'dedicated_professional')) DEFAULT 'none',
  budget_tier TEXT CHECK (budget_tier IN ('simulation_only', 'budget_hardware', 'research_grade')) DEFAULT 'simulation_only',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create sessions table
CREATE TABLE IF NOT EXISTS sessions (
  session_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  personalization_enabled BOOLEAN DEFAULT FALSE,
  language_preference TEXT CHECK (language_preference IN ('en', 'ur')) DEFAULT 'en',
  last_chapter_id TEXT,
  last_scroll_position INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_active_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '7 days'),
  UNIQUE(user_id)
);

-- 3. Create translation_content table
CREATE TABLE IF NOT EXISTS translation_content (
  translation_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  chapter_id TEXT NOT NULL,
  language_code TEXT CHECK (language_code IN ('ur')) DEFAULT 'ur',
  mdx_content TEXT NOT NULL,
  completeness_percentage INTEGER CHECK (completeness_percentage >= 0 AND completeness_percentage <= 100) DEFAULT 0,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  translator_notes TEXT,
  UNIQUE(chapter_id, language_code)
);

-- 4. Create labs table
CREATE TABLE IF NOT EXISTS labs (
  lab_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  chapter_id TEXT NOT NULL,
  lab_number INTEGER NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  docker_image_tag TEXT NOT NULL,
  github_url TEXT,
  estimated_duration_minutes INTEGER,
  difficulty TEXT CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')) DEFAULT 'beginner',
  requires_gpu BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(chapter_id, lab_number)
);

-- 5. Create citations table
CREATE TABLE IF NOT EXISTS citations (
  citation_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  chapter_id TEXT NOT NULL,
  citation_text TEXT NOT NULL,
  citation_type TEXT CHECK (citation_type IN ('peer_reviewed', 'official_docs', 'secondary')) DEFAULT 'secondary',
  doi TEXT,
  url TEXT,
  display_order INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_translation_chapter_id ON translation_content(chapter_id);
CREATE INDEX IF NOT EXISTS idx_labs_chapter_id ON labs(chapter_id);
CREATE INDEX IF NOT EXISTS idx_citations_chapter_id ON citations(chapter_id);

-- Enable Row Level Security (RLS)
ALTER TABLE personalization_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE translation_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE labs ENABLE ROW LEVEL SECURITY;
ALTER TABLE citations ENABLE ROW LEVEL SECURITY;

-- RLS Policies for personalization_profiles
CREATE POLICY "Users can view their own profile"
  ON personalization_profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile"
  ON personalization_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
  ON personalization_profiles FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policies for sessions
CREATE POLICY "Users can view their own session"
  ON sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own session"
  ON sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own session"
  ON sessions FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policies for translation_content (public read)
CREATE POLICY "Anyone can view translations"
  ON translation_content FOR SELECT
  TO public
  USING (true);

-- RLS Policies for labs (public read)
CREATE POLICY "Anyone can view labs"
  ON labs FOR SELECT
  TO public
  USING (true);

-- RLS Policies for citations (public read)
CREATE POLICY "Anyone can view citations"
  ON citations FOR SELECT
  TO public
  USING (true);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
CREATE TRIGGER update_personalization_profiles_updated_at
  BEFORE UPDATE ON personalization_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data (optional - for testing)
-- NOTE: You'll need to replace the user_id with actual user IDs from your auth.users table

-- Sample translation for Chapter 0 (Preface)
-- INSERT INTO translation_content (chapter_id, language_code, mdx_content, completeness_percentage)
-- VALUES (
--   '00-preface',
--   'ur',
--   '# پیش لفظ\n\nیہ Physical AI اور Humanoid Robotics کی تعلیم کے لیے ایک جامع کتاب ہے۔',
--   100
-- );

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO postgres, anon, authenticated, service_role;

-- Migration complete
SELECT 'Database migration completed successfully!' AS status;
