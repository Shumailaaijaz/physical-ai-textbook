import type { VercelRequest, VercelResponse } from '@vercel/node';
import { supabase } from '../../src/lib/supabase';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get the access token from the Authorization header
    const authHeader = req.headers.authorization;
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ valid: false, error: 'No authorization token provided' });
    }

    // Verify the token and get user
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return res.status(401).json({ valid: false, error: 'Invalid or expired token' });
    }

    // Get session from database
    const { data: session, error: sessionError } = await supabase
      .from('sessions')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (sessionError || !session) {
      return res.status(404).json({ valid: false, error: 'Session not found' });
    }

    // Check if session is expired
    const expiresAt = new Date(session.expires_at);
    const now = new Date();

    if (expiresAt < now) {
      return res.status(401).json({ valid: false, error: 'Session expired' });
    }

    // Update last_active_at
    await supabase
      .from('sessions')
      .update({ last_active_at: now.toISOString() })
      .eq('user_id', user.id);

    return res.status(200).json({
      valid: true,
      session: {
        personalization_enabled: session.personalization_enabled,
        language_preference: session.language_preference,
        last_chapter_id: session.last_chapter_id,
        last_scroll_position: session.last_scroll_position,
      },
    });
  } catch (error: any) {
    console.error('Session validation error:', error);
    return res.status(500).json({
      valid: false,
      error: 'Internal server error',
      details: error.message
    });
  }
}
