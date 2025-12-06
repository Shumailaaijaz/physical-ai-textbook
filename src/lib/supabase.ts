import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || 'placeholder-key';

const isConfigured = process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY;

if (!isConfigured && typeof window !== 'undefined') {
  console.warn('Supabase environment variables not set. Database features will be disabled.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

// Database Types
export interface User {
  id: string;
  email: string;
  created_at: string;
  updated_at: string;
}

export interface PersonalizationProfile {
  user_id: string;
  python_skill: 'beginner' | 'intermediate' | 'advanced';
  ros_experience: 'none' | 'basic' | 'intermediate' | 'advanced';
  linux_familiarity: 'none' | 'basic' | 'intermediate' | 'advanced';
  gpu_access: 'none' | 'integrated' | 'dedicated_consumer' | 'dedicated_professional';
  budget_tier: 'simulation_only' | 'budget_hardware' | 'research_grade';
  created_at: string;
  updated_at: string;
}

export interface Session {
  session_id: string;
  user_id: string;
  personalization_enabled: boolean;
  language_preference: 'en' | 'ur';
  last_chapter_id: string | null;
  last_scroll_position: number;
  created_at: string;
  last_active_at: string;
  expires_at: string;
}

export interface TranslationContent {
  translation_id: string;
  chapter_id: string;
  language_code: 'ur';
  mdx_content: string;
  completeness_percentage: number;
  last_updated: string;
  translator_notes: string | null;
}

export interface Lab {
  lab_id: string;
  chapter_id: string;
  lab_number: number;
  title: string;
  description: string;
  docker_image_tag: string;
  github_url: string;
  estimated_duration_minutes: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  requires_gpu: boolean;
}

export interface Citation {
  citation_id: string;
  chapter_id: string;
  citation_text: string;
  citation_type: 'peer_reviewed' | 'official_docs' | 'secondary';
  doi: string | null;
  url: string | null;
  display_order: number;
}
