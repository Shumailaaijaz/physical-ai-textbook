import type { VercelRequest, VercelResponse } from '@vercel/node';
import { supabase } from '../../src/lib/supabase';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'PATCH') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get the access token from the Authorization header
    const authHeader = req.headers.authorization;
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ error: 'No authorization token provided' });
    }

    // Verify the token and get user
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    const updates = req.body;

    // Validate allowed fields
    const allowedFields = [
      'personalization_enabled',
      'language_preference',
      'last_chapter_id',
      'last_scroll_position'
    ];

    const filteredUpdates = Object.keys(updates)
      .filter(key => allowedFields.includes(key))
      .reduce((obj, key) => {
        obj[key] = updates[key];
        return obj;
      }, {} as any);

    if (Object.keys(filteredUpdates).length === 0) {
      return res.status(400).json({ error: 'No valid fields to update' });
    }

    // Update session
    const { data: session, error: updateError } = await supabase
      .from('sessions')
      .update({
        ...filteredUpdates,
        last_active_at: new Date().toISOString(),
      })
      .eq('user_id', user.id)
      .select()
      .single();

    if (updateError) {
      console.error('Session update error:', updateError);
      return res.status(500).json({ error: 'Failed to update session' });
    }

    return res.status(200).json({ session });
  } catch (error: any) {
    console.error('Session state update error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      details: error.message
    });
  }
}
