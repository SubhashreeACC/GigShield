'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { registerUser, loginWithPhone } from '@/lib/auth';
import styles from './page.module.css';

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState('choose'); // choose | phone-otp | email-form | google
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Phone OTP state
  const [phone, setPhone] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [otpVerified, setOtpVerified] = useState(false);
  const otpRefs = useRef([]);

  // Registration form state
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    address: '',
    email: '',
    secondaryEmail: '',
    password: '',
    confirmPassword: '',
  });

  function handleFormChange(e) {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  }

  // --- Send OTP ---
  async function handleSendOtp() {
    setError('');
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length < 10) {
      setError('Please enter a valid 10-digit mobile number');
      return;
    }
    setLoading(true);
    // Simulate OTP send
    await new Promise(r => setTimeout(r, 1000));
    setOtpSent(true);
    setLoading(false);
    setSuccess('OTP sent to +91 ' + cleaned + ' (use 123456 for demo)');
  }

  // --- OTP Input handling ---
  function handleOtpChange(index, value) {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  }

  function handleOtpKeyDown(index, e) {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  }

  async function handleVerifyOtp() {
    setError('');
    const otpCode = otp.join('');
    if (otpCode.length < 6) {
      setError('Please enter the 6-digit OTP');
      return;
    }
    setLoading(true);
    await new Promise(r => setTimeout(r, 800));

    // Demo: accept 123456
    if (otpCode === '123456') {
      setOtpVerified(true);
      setSuccess('Phone verified! Complete your registration below.');
    } else {
      setError('Invalid OTP. Use 123456 for demo.');
    }
    setLoading(false);
  }

  // --- Submit Registration ---
  async function handleRegister(e) {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validation
    if (!formData.name.trim()) {
      setError('Please enter your full name');
      return;
    }
    if (!formData.age) {
      setError('Please enter your age');
      return;
    }
    if (!formData.address.trim()) {
      setError('Please enter your residential address');
      return;
    }
    if (!formData.password) {
      setError('Please create a password');
      return;
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const cleanPhone = phone.replace(/\D/g, '');
      registerUser({
        name: formData.name.trim(),
        phone: cleanPhone || undefined,
        email: formData.email.trim() || undefined,
        secondaryEmail: formData.secondaryEmail.trim() || undefined,
        age: formData.age,
        address: formData.address.trim(),
        password: formData.password,
        authMethod: step === 'phone-otp' ? 'phone' : step === 'google' ? 'google' : 'email',
      });

      // Auto-login after registration
      if (cleanPhone) {
        loginWithPhone(cleanPhone);
      }

      setSuccess('Registration successful! Redirecting...');
      setTimeout(() => router.push('/dashboard'), 1500);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  // --- Google Auth (simulated) ---
  async function handleGoogleAuth() {
    setLoading(true);
    setError('');
    await new Promise(r => setTimeout(r, 1200));
    setStep('google');
    setFormData(prev => ({
      ...prev,
      name: 'Demo User',
      email: 'demo@gmail.com',
    }));
    setSuccess('Google account connected! Complete your profile below.');
    setLoading(false);
  }

  // --- Choose Step ---
  if (step === 'choose') {
    return (
      <div className={`container ${styles.page}`}>
        <div className={styles.card}>
          <div className={styles.header}>
            <span className={styles.icon}>🛡️</span>
            <h1 className={styles.title}>Create Your Account</h1>
            <p className={styles.subtitle}>Join GigShield and protect your income</p>
          </div>

          <div className={styles.socialAuth}>
            <button
              className={`${styles.socialBtn} ${styles.phoneBtn}`}
              onClick={() => setStep('phone-otp')}
              id="register-phone-btn"
            >
              <span className={styles.socialIcon}>📱</span>
              Register with Mobile OTP
            </button>

            <button
              className={`${styles.socialBtn} ${styles.googleBtn}`}
              onClick={handleGoogleAuth}
              disabled={loading}
              id="register-google-btn"
            >
              <span className={styles.socialIcon}>
                <svg width="20" height="20" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
              </span>
              Continue with Google
            </button>

            <button
              className={`${styles.socialBtn} ${styles.emailBtn}`}
              onClick={() => setStep('email-form')}
              id="register-email-btn"
            >
              <span className={styles.socialIcon}>✉️</span>
              Register with Email
            </button>
          </div>

          {error && <p className={styles.error} role="alert">{error}</p>}

          <p className={styles.loginLink}>
            Already have an account? <Link href="/sign-in">Sign In</Link>
          </p>
        </div>
      </div>
    );
  }

  // --- Phone OTP Step ---
  if (step === 'phone-otp' && !otpVerified) {
    return (
      <div className={`container ${styles.page}`}>
        <div className={styles.card}>
          <button className={styles.backBtn} onClick={() => { setStep('choose'); setOtpSent(false); setOtp(['', '', '', '', '', '']); setError(''); setSuccess(''); }}>
            ← Back
          </button>

          <div className={styles.header}>
            <span className={styles.icon}>📱</span>
            <h1 className={styles.title}>{otpSent ? 'Verify OTP' : 'Phone Registration'}</h1>
            <p className={styles.subtitle}>
              {otpSent ? 'Enter the 6-digit code sent to your phone' : 'Enter your mobile number to get started'}
            </p>
          </div>

          {!otpSent ? (
            <div className={styles.form}>
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
                  />
                </div>
              </div>
              {error && <p className={styles.error} role="alert">{error}</p>}
              <button
                className="btn btn-primary"
                onClick={handleSendOtp}
                disabled={loading}
                style={{ width: '100%' }}
              >
                {loading ? 'Sending...' : 'Send OTP'}
              </button>
            </div>
          ) : (
            <div className={styles.otpSection}>
              {success && <p className={styles.success}>{success}</p>}
              <div className={styles.otpInputGroup}>
                {otp.map((digit, i) => (
                  <input
                    key={i}
                    ref={el => otpRefs.current[i] = el}
                    type="text"
                    className={styles.otpDigit}
                    value={digit}
                    onChange={(e) => handleOtpChange(i, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(i, e)}
                    maxLength={1}
                    autoFocus={i === 0}
                    inputMode="numeric"
                  />
                ))}
              </div>
              {error && <p className={styles.error} role="alert">{error}</p>}
              <button
                className="btn btn-primary"
                onClick={handleVerifyOtp}
                disabled={loading}
                style={{ width: '100%' }}
              >
                {loading ? 'Verifying...' : 'Verify OTP'}
              </button>
              <p className={styles.resendText}>
                Didn&apos;t get the code?{' '}
                <button className={styles.resendBtn} onClick={handleSendOtp}>Resend OTP</button>
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // --- Registration Form (shown after OTP verified, Google auth, or Email chosen) ---
  return (
    <div className={`container ${styles.page}`}>
      <div className={styles.card}>
        <button className={styles.backBtn} onClick={() => { setStep('choose'); setOtpVerified(false); setOtpSent(false); setError(''); setSuccess(''); }}>
          ← Back
        </button>

        <div className={styles.header}>
          <span className={styles.icon}>📝</span>
          <h1 className={styles.title}>Complete Registration</h1>
          <p className={styles.subtitle}>Fill in your details to get protected</p>
        </div>

        {success && <p className={styles.success}>{success}</p>}

        <form onSubmit={handleRegister} className={styles.form} id="register-form">
          <div className={styles.inputGroup}>
            <label htmlFor="name" className={styles.label}>Full Name</label>
            <input
              id="name"
              name="name"
              type="text"
              className="input"
              placeholder="Enter your full name"
              value={formData.name}
              onChange={handleFormChange}
              autoFocus={step !== 'google'}
            />
          </div>

          <div className={styles.row}>
            <div className={styles.inputGroup}>
              <label htmlFor="age" className={styles.label}>Age</label>
              <input
                id="age"
                name="age"
                type="number"
                className="input"
                placeholder="e.g., 25"
                value={formData.age}
                onChange={handleFormChange}
              />
            </div>

            {step === 'phone-otp' && (
              <div className={styles.inputGroup}>
                <label className={styles.label}>Phone</label>
                <input
                  type="text"
                  className="input"
                  value={`+91 ${phone}`}
                  disabled
                  style={{ opacity: 0.7 }}
                />
              </div>
            )}

            {(step === 'email-form' || step === 'google') && (
              <div className={styles.inputGroup}>
                <label htmlFor="email" className={styles.label}>Email Address</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  className="input"
                  placeholder="your@email.com"
                  value={formData.email}
                  onChange={handleFormChange}
                  disabled={step === 'google'}
                  style={step === 'google' ? { opacity: 0.7 } : undefined}
                />
              </div>
            )}
          </div>

          {step === 'email-form' && (
            <div className={styles.inputGroup}>
              <label htmlFor="reg-phone" className={styles.label}>Mobile Number (Optional)</label>
              <div className={styles.phoneInput}>
                <span className={styles.prefix}>+91</span>
                <input
                  id="reg-phone"
                  type="tel"
                  className="input"
                  placeholder="Enter 10-digit number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  maxLength={10}
                />
              </div>
            </div>
          )}

          <div className={styles.inputGroup}>
            <label htmlFor="address" className={styles.label}>Residential Address</label>
            <input
              id="address"
              name="address"
              type="text"
              className="input"
              placeholder="Enter your residential address"
              value={formData.address}
              onChange={handleFormChange}
            />
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="secondaryEmail" className={styles.label}>Optional Secondary Email</label>
            <input
              id="secondaryEmail"
              name="secondaryEmail"
              type="email"
              className="input"
              placeholder="secondary@email.com"
              value={formData.secondaryEmail}
              onChange={handleFormChange}
            />
          </div>

          <div className={styles.row}>
            <div className={styles.inputGroup}>
              <label htmlFor="password" className={styles.label}>Create Password</label>
              <input
                id="password"
                name="password"
                type="password"
                className="input"
                placeholder="Min 6 characters"
                value={formData.password}
                onChange={handleFormChange}
              />
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="confirmPassword" className={styles.label}>Confirm Password</label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                className="input"
                placeholder="Re-enter password"
                value={formData.confirmPassword}
                onChange={handleFormChange}
              />
            </div>
          </div>

          {error && <p className={styles.error} role="alert">{error}</p>}

          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
            id="register-submit"
            style={{ width: '100%' }}
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <p className={styles.disclaimer}>
          By registering, you agree to GigShield&apos;s Terms of Service and Privacy Policy.
        </p>

        <p className={styles.loginLink}>
          Already have an account? <Link href="/sign-in">Sign In</Link>
        </p>
      </div>
    </div>
  );
}
