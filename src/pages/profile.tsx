import React, { useState, useEffect } from 'react';
import Layout from '@theme/Layout';
import { AuthProvider, useAuth } from '../components/Auth/AuthProvider';
import styles from '../components/Auth/Auth.module.css';

function ProfileContent() {
  const { user, profile, loading, updateProfile } = useAuth();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [pythonSkill, setPythonSkill] = useState('');
  const [rosExperience, setRosExperience] = useState('');
  const [linuxFamiliarity, setLinuxFamiliarity] = useState('');
  const [gpuAccess, setGpuAccess] = useState('');
  const [budgetTier, setBudgetTier] = useState('');

  useEffect(() => {
    if (profile) {
      setPythonSkill(profile.python_skill || '');
      setRosExperience(profile.ros_experience || '');
      setLinuxFamiliarity(profile.linux_familiarity || '');
      setGpuAccess(profile.gpu_access || '');
      setBudgetTier(profile.budget_tier || '');
    }
  }, [profile]);

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '3rem' }}>Loading...</div>;
  }

  if (!user) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem' }}>
        <h2>Please sign in to view your profile</h2>
        <a href="/login" style={{ color: 'var(--ifm-color-primary)' }}>
          Sign in here
        </a>
      </div>
    );
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      await updateProfile({
        python_skill: pythonSkill as any,
        ros_experience: rosExperience as any,
        linux_familiarity: linuxFamiliarity as any,
        gpu_access: gpuAccess as any,
        budget_tier: budgetTier as any,
        user_id: user.id,
        created_at: profile?.created_at || '',
        updated_at: new Date().toISOString(),
      });

      setSuccess(true);
      setEditing(false);

      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={styles.authForm}>
      <h2>Your Profile</h2>

      {success && (
        <div style={{
          padding: '0.75rem',
          marginBottom: '1rem',
          backgroundColor: 'var(--ifm-color-success-lightest)',
          color: 'var(--ifm-color-success-darkest)',
          border: '1px solid var(--ifm-color-success-light)',
          borderRadius: '4px'
        }}>
          ✓ Profile updated successfully!
        </div>
      )}

      {error && <div className={styles.error}>⚠️ {error}</div>}

      <form onSubmit={handleSave}>
        <div className={styles.formGroup}>
          <label>Python Programming Skill</label>
          {editing ? (
            <select
              value={pythonSkill}
              onChange={(e) => setPythonSkill(e.target.value)}
              required
            >
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          ) : (
            <div style={{ padding: '0.75rem', backgroundColor: 'var(--ifm-color-emphasis-100)', borderRadius: '4px' }}>
              {pythonSkill || 'Not set'}
            </div>
          )}
        </div>

        <div className={styles.formGroup}>
          <label>ROS / ROS 2 Experience</label>
          {editing ? (
            <select
              value={rosExperience}
              onChange={(e) => setRosExperience(e.target.value)}
              required
            >
              <option value="none">None</option>
              <option value="basic">Basic</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          ) : (
            <div style={{ padding: '0.75rem', backgroundColor: 'var(--ifm-color-emphasis-100)', borderRadius: '4px' }}>
              {rosExperience || 'Not set'}
            </div>
          )}
        </div>

        <div className={styles.formGroup}>
          <label>Linux / Command Line Familiarity</label>
          {editing ? (
            <select
              value={linuxFamiliarity}
              onChange={(e) => setLinuxFamiliarity(e.target.value)}
              required
            >
              <option value="none">None</option>
              <option value="basic">Basic</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          ) : (
            <div style={{ padding: '0.75rem', backgroundColor: 'var(--ifm-color-emphasis-100)', borderRadius: '4px' }}>
              {linuxFamiliarity || 'Not set'}
            </div>
          )}
        </div>

        <div className={styles.formGroup}>
          <label>GPU Access</label>
          {editing ? (
            <select
              value={gpuAccess}
              onChange={(e) => setGpuAccess(e.target.value)}
              required
            >
              <option value="none">None (CPU only)</option>
              <option value="integrated">Integrated GPU</option>
              <option value="dedicated_consumer">Dedicated GPU (Consumer)</option>
              <option value="dedicated_professional">Professional GPU</option>
            </select>
          ) : (
            <div style={{ padding: '0.75rem', backgroundColor: 'var(--ifm-color-emphasis-100)', borderRadius: '4px' }}>
              {gpuAccess || 'Not set'}
            </div>
          )}
        </div>

        <div className={styles.formGroup}>
          <label>Hardware Budget</label>
          {editing ? (
            <select
              value={budgetTier}
              onChange={(e) => setBudgetTier(e.target.value)}
              required
            >
              <option value="simulation_only">Simulation Only</option>
              <option value="budget_hardware">Budget Hardware</option>
              <option value="research_grade">Research Grade</option>
            </select>
          ) : (
            <div style={{ padding: '0.75rem', backgroundColor: 'var(--ifm-color-emphasis-100)', borderRadius: '4px' }}>
              {budgetTier || 'Not set'}
            </div>
          )}
        </div>

        <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
          {editing ? (
            <>
              <button
                type="submit"
                className={styles.submitButton}
                disabled={saving}
                style={{ flex: 1 }}
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setEditing(false);
                  setError(null);
                  // Reset to current profile values
                  if (profile) {
                    setPythonSkill(profile.python_skill || '');
                    setRosExperience(profile.ros_experience || '');
                    setLinuxFamiliarity(profile.linux_familiarity || '');
                    setGpuAccess(profile.gpu_access || '');
                    setBudgetTier(profile.budget_tier || '');
                  }
                }}
                className={styles.submitButton}
                style={{ flex: 1, backgroundColor: 'var(--ifm-color-emphasis-400)' }}
              >
                Cancel
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => setEditing(true)}
              className={styles.submitButton}
            >
              Edit Profile
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <AuthProvider>
      <Layout
        title="Your Profile"
        description="Manage your personalization settings"
      >
        <main style={{ minHeight: '70vh', paddingTop: '2rem', paddingBottom: '2rem' }}>
          <ProfileContent />
        </main>
      </Layout>
    </AuthProvider>
  );
}
