import React, { useState, useEffect } from 'react';
import Layout from '@theme/Layout';
import { AuthProvider, useAuth } from '../components/Auth/AuthProvider';
import styles from './profile.module.css';

function ProfileContent() {
  const { user, profile, session, loading, updateProfile, signOut } = useAuth();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

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

  if (!user || !session) {
    return (
      <div className={styles.notLoggedIn}>
        <h2>Please Log In</h2>
        <p>You need to be logged in to view your profile.</p>
        <a href="/login" className={styles.loginButton}>
          Go to Login
        </a>
      </div>
    );
  }

  const userEmail = session.user?.email || '';
  const userName = userEmail.split('@')[0];

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

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

      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      setEditing(false);

      setTimeout(() => setMessage(null), 3000);
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to update profile' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={styles.profileContainer}>
      {/* Header Section with User Info */}
      <div className={styles.profileHeader}>
        <div className={styles.avatarLarge}>
          {userName.charAt(0).toUpperCase()}
        </div>
        <div className={styles.headerInfo}>
          <h1>{userName}</h1>
          <p className={styles.userEmail}>{userEmail}</p>
          <p className={styles.joinedDate}>
            Member since {new Date(session.user.created_at || '').toLocaleDateString()}
          </p>
        </div>
      </div>

      {/* Message Display */}
      {message && (
        <div className={`${styles.message} ${styles[message.type]}`}>
          {message.type === 'success' ? '✓' : '⚠️'} {message.text}
        </div>
      )}

      {/* Personalization Settings Section */}
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2>Personalization Settings</h2>
          {!editing && (
            <button onClick={() => setEditing(true)} className={styles.editButton}>
              Edit
            </button>
          )}
        </div>

        <p className={styles.sectionDescription}>
          These settings help us tailor content and recommendations to your skill level and resources.
        </p>

      <form onSubmit={handleSave}>
        <div className={styles.settingsGrid}>
        <div className={styles.settingItem}>
          <label>Python Programming Skill</label>
          {editing ? (
            <select
              value={pythonSkill}
              onChange={(e) => setPythonSkill(e.target.value)}
              required
            >
              <option value="beginner">Beginner (new to programming)</option>
              <option value="intermediate">Intermediate (1-2 years experience)</option>
              <option value="advanced">Advanced (3+ years experience)</option>
            </select>
          ) : (
            <div className={styles.settingValue}>
              {pythonSkill || 'Not set'}
            </div>
          )}
        </div>

        <div className={styles.settingItem}>
          <label>ROS / ROS 2 Experience</label>
          {editing ? (
            <select
              value={rosExperience}
              onChange={(e) => setRosExperience(e.target.value)}
              required
            >
              <option value="none">None (first time)</option>
              <option value="basic">Basic (completed tutorials)</option>
              <option value="intermediate">Intermediate (built projects)</option>
              <option value="advanced">Advanced (production systems)</option>
            </select>
          ) : (
            <div className={styles.settingValue}>
              {rosExperience || 'Not set'}
            </div>
          )}
        </div>

        <div className={styles.settingItem}>
          <label>Linux / Command Line Familiarity</label>
          {editing ? (
            <select
              value={linuxFamiliarity}
              onChange={(e) => setLinuxFamiliarity(e.target.value)}
              required
            >
              <option value="none">None (never used terminal)</option>
              <option value="basic">Basic (can navigate files)</option>
              <option value="intermediate">Intermediate (comfortable with bash)</option>
              <option value="advanced">Advanced (write shell scripts)</option>
            </select>
          ) : (
            <div className={styles.settingValue}>
              {linuxFamiliarity || 'Not set'}
            </div>
          )}
        </div>

        <div className={styles.settingItem}>
          <label>GPU Access</label>
          {editing ? (
            <select
              value={gpuAccess}
              onChange={(e) => setGpuAccess(e.target.value)}
              required
            >
              <option value="none">None (CPU only)</option>
              <option value="integrated">Integrated GPU</option>
              <option value="dedicated_consumer">Dedicated GPU (GTX/RTX 20xx-40xx)</option>
              <option value="dedicated_professional">Professional GPU (A100/H100)</option>
            </select>
          ) : (
            <div className={styles.settingValue}>
              {gpuAccess || 'Not set'}
            </div>
          )}
        </div>

        <div className={styles.settingItem}>
          <label>Hardware Budget</label>
          {editing ? (
            <select
              value={budgetTier}
              onChange={(e) => setBudgetTier(e.target.value)}
              required
            >
              <option value="simulation_only">Simulation Only (Cloud/Codespaces)</option>
              <option value="budget_hardware">Budget Hardware (&lt; $500)</option>
              <option value="research_grade">Research Grade ($2000+)</option>
            </select>
          ) : (
            <div className={styles.settingValue}>
              {budgetTier || 'Not set'}
            </div>
          )}
        </div>
        </div>

        {editing && (
        <div className={styles.buttonGroup}>
          <button
            type="submit"
            className={styles.saveButton}
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
          <button
            type="button"
            onClick={() => {
              setEditing(false);
              setMessage(null);
              // Reset to current profile values
              if (profile) {
                setPythonSkill(profile.python_skill || '');
                setRosExperience(profile.ros_experience || '');
                setLinuxFamiliarity(profile.linux_familiarity || '');
                setGpuAccess(profile.gpu_access || '');
                setBudgetTier(profile.budget_tier || '');
              }
            }}
            className={styles.cancelButton}
          >
            Cancel
          </button>
        </div>
        )}
      </form>
      </div>

      {/* Account Actions */}
      <div className={styles.section}>
        <h2>Account</h2>
        <button
          onClick={async () => {
            await signOut();
            window.location.href = '/physical-ai-textbook/';
          }}
          className={styles.signOutButton}
        >
          Sign Out
        </button>
      </div>
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
