'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { adminLogin } from '@/lib/auth';
import styles from './page.module.css';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (!email.trim()) {
      setError('Please enter your admin email');
      return;
    }
    if (!password) {
      setError('Please enter your password');
      return;
    }

    setLoading(true);
    try {
      adminLogin(email.trim(), password);
      router.push('/admin');
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.header}>
          <div className={styles.iconWrapper}>
            <span className={styles.icon}>🔐</span>
          </div>
          <h1 className={styles.title}>Admin Portal</h1>
          <p className={styles.subtitle}>Sign in with your admin credentials</p>
        </div>

        <form onSubmit={handleSubmit} className={styles.form} id="admin-login-form">
          <div className={styles.inputGroup}>
            <label htmlFor="admin-email" className={styles.label}>Admin Email</label>
            <input
              id="admin-email"
              type="email"
              className="input"
              placeholder="admin@gigshield.in"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoFocus
            />
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="admin-password" className={styles.label}>Password</label>
            <input
              id="admin-password"
              type="password"
              className="input"
              placeholder="Enter admin password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {error && (
            <div className={styles.errorBox} role="alert">
              <span className={styles.errorIcon}>⚠️</span>
              <p className={styles.error}>{error}</p>
            </div>
          )}

          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
            id="admin-login-submit"
            style={{ width: '100%' }}
          >
            {loading ? 'Signing in...' : 'Sign In as Admin'}
          </button>
        </form>

        <p className={styles.hint}>
          💡 Demo: admin@gigshield.in / admin123
        </p>

        <p className={styles.backLink}>
          <Link href="/">← Back to GigShield</Link>
        </p>
      </div>
    </div>
  );
}
