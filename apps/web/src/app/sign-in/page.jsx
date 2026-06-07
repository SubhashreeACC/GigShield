'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { loginUser, loginWithPhone, getRegisteredUsers } from '@/lib/auth';
import styles from './page.module.css';

export default function SignInPage() {
  const [mode, setMode] = useState('phone'); // phone | email
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showRedirect, setShowRedirect] = useState(false);
  const router = useRouter();

  async function handlePhoneSubmit(e) {
    e.preventDefault();
    setError('');
    setShowRedirect(false);

    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length < 10) {
      setError('Please enter a valid 10-digit mobile number');
      return;
    }

    setLoading(true);
    try {
      loginWithPhone(cleaned);
      router.push('/dashboard');
    } catch (err) {
      if (err.message === 'UNREGISTERED') {
        setError('User Not Found. Please register first.');
        setShowRedirect(true);
      } else {
        setError(err.message || 'Login failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleEmailSubmit(e) {
    e.preventDefault();
    setError('');
    setShowRedirect(false);

    if (!email.trim()) {
      setError('Please enter your email address');
      return;
    }
    if (!password) {
      setError('Please enter your password');
      return;
    }

    setLoading(true);
    try {
      loginUser(email.trim(), password);
      router.push('/dashboard');
    } catch (err) {
      if (err.message === 'UNREGISTERED') {
        setError('User Not Found. Please register first.');
        setShowRedirect(true);
      } else {
        setError(err.message || 'Login failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={`container ${styles.page}`}>
      <div className={styles.card}>
        <div className={styles.header}>
          <span className={styles.icon}>🛡️</span>
          <h1 className={styles.title}>Welcome Back</h1>
          <p className={styles.subtitle}>Sign in to your GigShield account</p>
        </div>

        {/* Mode Toggle */}
        <div className={styles.modeToggle}>
          <button
            className={`${styles.modeBtn} ${mode === 'phone' ? styles.modeBtnActive : ''}`}
            onClick={() => { setMode('phone'); setError(''); setShowRedirect(false); }}
            type="button"
          >
            📱 Phone
          </button>
          <button
            className={`${styles.modeBtn} ${mode === 'email' ? styles.modeBtnActive : ''}`}
            onClick={() => { setMode('email'); setError(''); setShowRedirect(false); }}
            type="button"
          >
            ✉️ Email
          </button>
        </div>

        {/* Phone Login */}
        {mode === 'phone' && (
          <form onSubmit={handlePhoneSubmit} className={styles.form} id="sign-in-form">
            <div className={styles.inputGroup}>
              <label htmlFor="phone" className={styles.label}>Mobile Number</label>
              <div className={styles.phoneInput}>
                <span className={styles.prefix}>+91</span>
                <input
                  id="phone"
                  type="tel"
                  className="input"
                  placeholder="Enter 10-digit number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  maxLength={10}
                  autoFocus
                  aria-label="Mobile phone number"
                />
              </div>
            </div>

            {error && (
              <div className={styles.errorBox} role="alert">
                <span className={styles.errorIcon}>⚠️</span>
                <p className={styles.error}>{error}</p>
              </div>
            )}

            {showRedirect && (
              <Link href="/register" className={`btn btn-secondary ${styles.redirectBtn}`} id="redirect-register">
                Create a New Account →
              </Link>
            )}

            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
              id="sign-in-submit"
              style={{ width: '100%' }}
            >
              {loading ? 'Signing in...' : 'Continue with Phone'}
            </button>
          </form>
        )}

        {/* Email Login */}
        {mode === 'email' && (
          <form onSubmit={handleEmailSubmit} className={styles.form} id="sign-in-email-form">
            <div className={styles.inputGroup}>
              <label htmlFor="email" className={styles.label}>Email Address</label>
              <input
                id="email"
                type="email"
                className="input"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoFocus
              />
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="password" className={styles.label}>Password</label>
              <input
                id="password"
                type="password"
                className="input"
                placeholder="Enter your password"
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

            {showRedirect && (
              <Link href="/register" className={`btn btn-secondary ${styles.redirectBtn}`} id="redirect-register-email">
                Create a New Account →
              </Link>
            )}

            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
              id="sign-in-email-submit"
              style={{ width: '100%' }}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
        )}

        {/* Social Logins */}
        <div style={{ marginTop: 'var(--space-4)' }}>
          <div style={{ display: 'flex', alignItems: 'center', margin: 'var(--space-4) 0', color: 'var(--color-text-muted)' }}>
            <div style={{ flex: 1, height: '1px', background: 'var(--color-border)' }}></div>
            <span style={{ padding: '0 var(--space-3)', fontSize: 'var(--text-sm)' }}>Or continue with</span>
            <div style={{ flex: 1, height: '1px', background: 'var(--color-border)' }}></div>
          </div>
          <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
            <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => router.push('/dashboard')} type="button">
               <span style={{ marginRight: '8px' }}>G</span> Google
            </button>
            <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => router.push('/dashboard')} type="button">
               <span style={{ marginRight: '8px' }}>X</span> Twitter
            </button>
          </div>
        </div>

        <p className={styles.registerLink}>
          Don&apos;t have an account? <Link href="/register">Sign Up Now</Link>
        </p>

        <p className={styles.registerLink} style={{ marginTop: 'var(--space-2)' }}>
          Are you an administrator? <Link href="/admin/login">Admin Sign In</Link>
        </p>

        <p className={styles.disclaimer}>
          By continuing, you agree to GigShield&apos;s Terms of Service and Privacy Policy.
        </p>
      </div>
    </div>
  );
}
