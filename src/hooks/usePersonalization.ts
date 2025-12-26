import { useState, useEffect } from 'react';
import { useAuth } from '../components/Auth/AuthProvider';
import { supabase } from '../lib/supabase';

export interface PersonalizationState {
  enabled: boolean;
  pythonSkill: string;
  rosExperience: string;
  linuxFamiliarity: string;
  gpuAccess: string;
  budgetTier: string;
}

export function usePersonalization() {
  const { user, profile } = useAuth();
  const [enabled, setEnabled] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    // Load personalization state from session
    loadPersonalizationState();
  }, [user]);

  async function loadPersonalizationState() {
    if (!user) return;

    try {
      const { data: session } = await supabase
        .from('sessions')
        .select('personalization_enabled')
        .eq('user_id', user.id)
        .single();

      if (session) {
        setEnabled(session.personalization_enabled);
      }
    } catch (error) {
      console.error('Error loading personalization state:', error);
    } finally {
      setLoading(false);
    }
  }

  async function togglePersonalization() {
    if (!user) {
      // Redirect to login
      window.location.href = '/login?returnUrl=' + encodeURIComponent(window.location.pathname);
      return;
    }

    const newEnabled = !enabled;
    setEnabled(newEnabled);

    // Update session in database
    try {
      await supabase
        .from('sessions')
        .update({
          personalization_enabled: newEnabled,
          last_active_at: new Date().toISOString(),
        })
        .eq('user_id', user.id);
    } catch (error) {
      console.error('Error updating personalization state:', error);
      // Revert on error
      setEnabled(!newEnabled);
    }
  }

  return {
    enabled,
    loading,
    togglePersonalization,
    profile: profile || null,
  };
}
