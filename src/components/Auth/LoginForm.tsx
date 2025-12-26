import React, { useState } from 'react';
import Link from '@docusaurus/Link';
import useBaseUrl from '@docusaurus/useBaseUrl';
import { useAuth } from './AuthProvider';
import styles from './Auth.module.css';

export default function LoginForm() {
  const { signIn } = useAuth();
  const baseUrl = useBaseUrl('/');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await signIn(email, password);
      // Redirect to homepage or where they came from
      const returnUrl = new URLSearchParams(window.location.search).get('returnUrl') || baseUrl;
      window.location.href = returnUrl;
    } catch (err: any) {
      setError('Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.authForm}>
      <h2>Sign In</h2>
      <p className={styles.subtitle}>
        Welcome back! Access your personalized textbook
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
          autoComplete="email"
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
          placeholder="Your password"
          autoComplete="current-password"
        />
      </div>

      <button
        type="submit"
        className={styles.submitButton}
        disabled={loading}
      >
        {loading ? 'Signing in...' : 'Sign In'}
      </button>

      <p className={styles.switchForm}>
        Don't have an account?{' '}
        <Link to="/signup">Create one here</Link>
      </p>
    </form>
  );
}
