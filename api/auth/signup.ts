import type { VercelRequest, VercelResponse } from '@vercel/node';
import { supabase } from '../../src/lib/supabase';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, password, profile } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    if (!profile || !profile.python_skill || !profile.ros_experience ||
        !profile.linux_familiarity || !profile.gpu_access || !profile.budget_tier) {
      return res.status(400).json({
        error: 'All personalization questions must be answered'
      });
    }

    // Create user in Supabase
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError) {
      return res.status(400).json({ error: authError.message });
    }

    if (!authData.user) {
      return res.status(500).json({ error: 'Failed to create user' });
    }

    // Create personalization profile
    const { error: profileError } = await supabase
      .from('personalization_profiles')
      .insert({
        user_id: authData.user.id,
        python_skill: profile.python_skill,
        ros_experience: profile.ros_experience,
        linux_familiarity: profile.linux_familiarity,
        gpu_access: profile.gpu_access,
        budget_tier: profile.budget_tier,
      });

    if (profileError) {
      console.error('Profile creation error:', profileError);
      // User is created but profile failed - this is recoverable
    }

    // Create initial session
    const { error: sessionError } = await supabase
      .from('sessions')
      .insert({
        user_id: authData.user.id,
        personalization_enabled: false,
        language_preference: 'en',
        last_active_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
      });

    if (sessionError) {
      console.error('Session creation error:', sessionError);
    }

    return res.status(201).json({
      message: 'User created successfully',
      user: {
        id: authData.user.id,
        email: authData.user.email,
      },
      session: authData.session,
    });
  } catch (error: any) {
    console.error('Signup error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      details: error.message
    });
  }
}
