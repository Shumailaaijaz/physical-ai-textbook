import React, { useState } from 'react';
import { useAuth } from './AuthProvider';
import styles from './Auth.module.css';

export default function SignupForm() {
  const { signUp } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Personalization questions
  const [pythonSkill, setPythonSkill] = useState<string>('beginner');
  const [rosExperience, setRosExperience] = useState<string>('none');
  const [linuxFamiliarity, setLinuxFamiliarity] = useState<string>('none');
  const [gpuAccess, setGpuAccess] = useState<string>('none');
  const [budgetTier, setBudgetTier] = useState<string>('simulation_only');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await signUp(email, password, {
        python_skill: pythonSkill as any,
        ros_experience: rosExperience as any,
        linux_familiarity: linuxFamiliarity as any,
        gpu_access: gpuAccess as any,
        budget_tier: budgetTier as any,
        user_id: '', // Will be set by the API
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      setSuccess(true);
      // Redirect to homepage or dashboard
      window.location.href = '/';
    } catch (err: any) {
      setError(err.message || 'Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className={styles.success}>
        <h2>✓ Account Created Successfully!</h2>
        <p>Redirecting you to the textbook...</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className={styles.authForm}>
      <h2>Create Your Account</h2>
      <p className={styles.subtitle}>
        Get personalized content based on your experience level
      </p>

      {error && <div className={styles.error}>⚠️ {error}</div>}

      <div className={styles.formGroup}>
        <label htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          placeholder="your.email@example.com"
        />
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="password">Password</label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={8}
          placeholder="At least 8 characters"
        />
      </div>

      <hr className={styles.divider} />

      <h3>Personalization Questions</h3>
      <p className={styles.personalizeInfo}>
        Answer these questions to get content tailored to your experience level
      </p>

      <div className={styles.formGroup}>
        <label htmlFor="python_skill">Python Programming Skill</label>
        <select
          id="python_skill"
          value={pythonSkill}
          onChange={(e) => setPythonSkill(e.target.value)}
          required
        >
          <option value="beginner">Beginner (new to programming)</option>
          <option value="intermediate">Intermediate (1-2 years experience)</option>
          <option value="advanced">Advanced (3+ years experience)</option>
        </select>
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="ros_experience">ROS / ROS 2 Experience</label>
        <select
          id="ros_experience"
          value={rosExperience}
          onChange={(e) => setRosExperience(e.target.value)}
          required
        >
          <option value="none">None (first time)</option>
          <option value="basic">Basic (completed tutorials)</option>
          <option value="intermediate">Intermediate (built projects)</option>
          <option value="advanced">Advanced (production systems)</option>
        </select>
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="linux_familiarity">Linux / Command Line Familiarity</label>
        <select
          id="linux_familiarity"
          value={linuxFamiliarity}
          onChange={(e) => setLinuxFamiliarity(e.target.value)}
          required
        >
          <option value="none">None (never used terminal)</option>
          <option value="basic">Basic (can navigate files)</option>
          <option value="intermediate">Intermediate (comfortable with bash)</option>
          <option value="advanced">Advanced (write shell scripts)</option>
        </select>
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="gpu_access">GPU Access</label>
        <select
          id="gpu_access"
          value={gpuAccess}
          onChange={(e) => setGpuAccess(e.target.value)}
          required
        >
          <option value="none">None (CPU only)</option>
          <option value="integrated">Integrated GPU</option>
          <option value="dedicated_consumer">Dedicated GPU (GTX/RTX 20xx-40xx)</option>
          <option value="dedicated_professional">Professional GPU (A100/H100)</option>
        </select>
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="budget_tier">Hardware Budget</label>
        <select
          id="budget_tier"
          value={budgetTier}
          onChange={(e) => setBudgetTier(e.target.value)}
          required
        >
          <option value="simulation_only">Simulation Only (Cloud/Codespaces)</option>
          <option value="budget_hardware">Budget Hardware (&lt; $500)</option>
          <option value="research_grade">Research Grade ($2000+)</option>
        </select>
      </div>

      <button
        type="submit"
        className={styles.submitButton}
        disabled={loading}
      >
        {loading ? 'Creating Account...' : 'Create Account'}
      </button>

      <p className={styles.switchForm}>
        Already have an account?{' '}
        <a href="/login">Sign in here</a>
      </p>
    </form>
  );
}
