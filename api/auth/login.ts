import type { VercelRequest, VercelResponse } from '@vercel/node';
import { supabase } from '../../src/lib/supabase';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Sign in with Supabase
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    if (!authData.user || !authData.session) {
      return res.status(500).json({ error: 'Failed to create session' });
    }

    // Update last_active_at in sessions table
    const { error: sessionError } = await supabase
      .from('sessions')
      .update({ last_active_at: new Date().toISOString() })
      .eq('user_id', authData.user.id);

    if (sessionError) {
      console.error('Session update error:', sessionError);
    }

    // Get user profile
    const { data: profile } = await supabase
      .from('personalization_profiles')
      .select('*')
      .eq('user_id', authData.user.id)
      .single();

    return res.status(200).json({
      message: 'Login successful',
      user: {
        id: authData.user.id,
        email: authData.user.email,
      },
      profile,
      session: authData.session,
    });
  } catch (error: any) {
    console.error('Login error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      details: error.message
    });
  }
}
