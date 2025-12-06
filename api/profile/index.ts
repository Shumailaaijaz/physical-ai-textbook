import type { VercelRequest, VercelResponse } from '@vercel/node';
import { supabase } from '../../src/lib/supabase';

export default async function handler(req: VercelRequest, res: VercelResponse) {
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

    if (req.method === 'GET') {
      // Get user profile
      const { data: profile, error: profileError } = await supabase
        .from('personalization_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (profileError) {
        return res.status(404).json({ error: 'Profile not found' });
      }

      return res.status(200).json({ profile });
    }

    if (req.method === 'PATCH') {
      // Update user profile
      const updates = req.body;

      // Validate allowed fields
      const allowedFields = ['python_skill', 'ros_experience', 'linux_familiarity', 'gpu_access', 'budget_tier'];
      const filteredUpdates = Object.keys(updates)
        .filter(key => allowedFields.includes(key))
        .reduce((obj, key) => {
          obj[key] = updates[key];
          return obj;
        }, {} as any);

      if (Object.keys(filteredUpdates).length === 0) {
        return res.status(400).json({ error: 'No valid fields to update' });
      }

      const { data: profile, error: updateError } = await supabase
        .from('personalization_profiles')
        .update({
          ...filteredUpdates,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user.id)
        .select()
        .single();

      if (updateError) {
        return res.status(500).json({ error: 'Failed to update profile' });
      }

      return res.status(200).json({ profile });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error: any) {
    console.error('Profile API error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      details: error.message
    });
  }
}
