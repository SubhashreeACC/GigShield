import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { authAPI } from '../services/api';

const GigShieldLogo = ({ size = 76 }) => (
  <div
    style={{
      width: size,
      height: size,
      borderRadius: size * 0.26,
      background: 'linear-gradient(145deg, #3b6ef8 0%, #1a4de8 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      boxShadow:
        '0 8px 32px rgba(59,110,248,0.38), 0 2px 8px rgba(26,77,232,0.18)',
      flexShrink: 0,
    }}
  >
    <svg
      width={size * 0.58}
      height={size * 0.58}
      viewBox="0 0 40 44"
      fill="none"
    >
      <path
        d="M20 2L4 8.5V20.5C4 29.5 11 37.8 20 40C29 37.8 36 29.5 36 20.5V8.5L20 2Z"
        fill="white"
        fillOpacity="0.18"
      />
      <path
        d="M20 2L4 8.5V20.5C4 29.5 11 37.8 20 40C29 37.8 36 29.5 36 20.5V8.5L20 2Z"
        stroke="white"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      <path
        d="M13 21.5L17.5 26L27 16"
        stroke="white"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  </div>
);

const Banner = ({ type, message }) => {
  if (!message) {
    return null;
  }

  const isError = type === 'error';

  return (
    <div
      style={{
        background: isError ? '#fff5f5' : '#f0fff4',
        border: `1px solid ${isError ? '#fed7d7' : '#c6f6d5'}`,
        borderRadius: 10,
        padding: '12px 14px',
        marginBottom: 20,
        fontSize: 13,
        color: isError ? '#c53030' : '#276749',
        display: 'flex',
        alignItems: 'flex-start',
        gap: 8,
      }}
    >
      <svg
        width="16"
        height="16"
        style={{ marginTop: 1, flexShrink: 0 }}
        viewBox="0 0 24 24"
        fill="currentColor"
      >
        {isError ? (
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
        ) : (
          <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
        )}
      </svg>
      {message}
    </div>
  );
};

const Input = ({
  label,
  type = 'text',
  value,
  onChange,
  error,
  placeholder,
  disabled,
}) => {
  const [focused, setFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <label
        style={{
          fontSize: 12,
          fontWeight: 700,
          color: error ? '#e53e3e' : focused ? '#1a4de8' : '#4a5568',
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
          transition: 'color 0.2s',
        }}
      >
        {label}
      </label>

      <div style={{ position: 'relative' }}>
        <input
          type={type === 'password' && showPassword ? 'text' : type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{
            width: '100%',
            padding: '13px 16px',
            paddingRight: type === 'password' ? 44 : 16,
            fontSize: 15,
            fontFamily: "'DM Sans', sans-serif",
            color: '#1a202c',
            background: focused ? '#f0f4ff' : '#f7f8fc',
            border: `2px solid ${
              error ? '#feb2b2' : focused ? '#3b6ef8' : '#e2e8f0'
            }`,
            borderRadius: 12,
            outline: 'none',
            transition: 'all 0.2s ease',
            boxSizing: 'border-box',
            cursor: disabled ? 'not-allowed' : 'text',
            opacity: disabled ? 0.6 : 1,
          }}
        />

        {type === 'password' ? (
          <button
            type="button"
            onClick={() => setShowPassword((currentValue) => !currentValue)}
            style={{
              position: 'absolute',
              right: 14,
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#a0aec0',
              padding: 0,
              display: 'flex',
            }}
          >
            {showPassword ? (
              <svg
                width="18"
                height="18"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <line
                  x1="1"
                  y1="1"
                  x2="23"
                  y2="23"
                  strokeLinecap="round"
                />
              </svg>
            ) : (
              <svg
                width="18"
                height="18"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <circle cx="12" cy="12" r="3" />
              </svg>
            )}
          </button>
        ) : null}
      </div>

      {error ? (
        <span
          style={{
            fontSize: 12,
            color: '#e53e3e',
            display: 'flex',
            alignItems: 'center',
            gap: 4,
          }}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
          </svg>
          {error}
        </span>
      ) : null}
    </div>
  );
};

const PrimaryButton = ({ loading, children }) => (
  <button
    type="submit"
    disabled={loading}
    style={{
      width: '100%',
      padding: '15px',
      background: loading
        ? '#93a9f5'
        : 'linear-gradient(135deg, #3b6ef8 0%, #1a4de8 100%)',
      color: 'white',
      border: 'none',
      borderRadius: 14,
      fontSize: 15,
      fontWeight: 700,
      cursor: loading ? 'not-allowed' : 'pointer',
      letterSpacing: '0.02em',
      transition: 'all 0.2s ease',
      boxShadow: loading ? 'none' : '0 4px 16px rgba(59,110,248,0.36)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 10,
      fontFamily: "'DM Sans', sans-serif",
    }}
    onMouseEnter={(event) => {
      if (!loading) {
        event.currentTarget.style.transform = 'scale(1.02)';
      }
    }}
    onMouseLeave={(event) => {
      event.currentTarget.style.transform = 'scale(1)';
    }}
  >
    {loading ? (
      <>
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          style={{ animation: 'spin 0.8s linear infinite' }}
          stroke="white"
          strokeWidth="2.5"
        >
          <path
            d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"
            strokeLinecap="round"
          />
        </svg>
        Please wait...
      </>
    ) : (
      children
    )}
  </button>
);

const GhostButton = ({ onClick, children }) => (
  <button
    type="button"
    onClick={onClick}
    style={{
      width: '100%',
      padding: '14px',
      background: 'transparent',
      border: '2px solid #3b6ef8',
      borderRadius: 14,
      fontSize: 15,
      fontWeight: 700,
      color: '#1a4de8',
      cursor: 'pointer',
      letterSpacing: '0.02em',
      transition: 'all 0.2s ease',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      fontFamily: "'DM Sans', sans-serif",
    }}
    onMouseEnter={(event) => {
      event.currentTarget.style.background = '#eff4ff';
      event.currentTarget.style.transform = 'scale(1.01)';
    }}
    onMouseLeave={(event) => {
      event.currentTarget.style.background = 'transparent';
      event.currentTarget.style.transform = 'scale(1)';
    }}
  >
    {children}
  </button>
);

const Divider = ({ label }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '22px 0' }}>
    <div style={{ flex: 1, height: 1, background: '#e2e8f0' }} />
    <span style={{ fontSize: 12, color: '#a0aec0', fontWeight: 500 }}>{label}</span>
    <div style={{ flex: 1, height: 1, background: '#e2e8f0' }} />
  </div>
);

const AuthShell = ({ children, visible }) => (
  <div
    style={{
      minHeight: '100vh',
      background: 'linear-gradient(160deg, #eef2ff 0%, #f0f7ff 40%, #e8f0fe 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px 16px',
      fontFamily: "'DM Sans', sans-serif",
      position: 'relative',
      overflow: 'hidden',
    }}
  >
    <div
      style={{
        position: 'absolute',
        top: -80,
        right: -80,
        width: 320,
        height: 320,
        borderRadius: '50%',
        background:
          'radial-gradient(circle, rgba(59,110,248,0.10) 0%, transparent 70%)',
        pointerEvents: 'none',
      }}
    />

    <div
      style={{
        position: 'absolute',
        bottom: -60,
        left: -60,
        width: 260,
        height: 260,
        borderRadius: '50%',
        background:
          'radial-gradient(circle, rgba(99,148,255,0.08) 0%, transparent 70%)',
        pointerEvents: 'none',
      }}
    />

    <div
      style={{
        width: '100%',
        maxWidth: 440,
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(20px)',
        transition: 'opacity 0.45s ease, transform 0.45s ease',
      }}
    >
      <div style={{ textAlign: 'center', marginBottom: 28 }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 14 }}>
          <GigShieldLogo size={76} />
        </div>
        <h1
          style={{
            fontSize: 29,
            fontWeight: 800,
            color: '#1a4de8',
            letterSpacing: '-0.5px',
            margin: 0,
          }}
        >
          GigShield
        </h1>
        <p style={{ fontSize: 14, color: '#718096', marginTop: 5, fontWeight: 400 }}>
          Protection built for riders, by riders.
        </p>
      </div>

      {children}

      <p style={{ textAlign: 'center', fontSize: 12, color: '#cbd5e0', marginTop: 20 }}>
        Copyright 2026 GigShield | Rider Protection Platform
      </p>
    </div>

    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');
      @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
      }
      @keyframes shake {
        0%, 100% { transform: translateX(0); }
        20% { transform: translateX(-6px); }
        40% { transform: translateX(6px); }
        60% { transform: translateX(-4px); }
        80% { transform: translateX(4px); }
      }
      * { box-sizing: border-box; }
      input::placeholder { color: #c0c8d8; }
    `}</style>
  </div>
);

const LoginScreen = ({ onGoSignUp, onAuthSuccess }) => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [banner, setBanner] = useState(null);
  const [loading, setLoading] = useState(false);
  const [shake, setShake] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setVisible(true), 60);
    return () => window.clearTimeout(timer);
  }, []);

  const triggerShake = () => {
    setShake(true);
    window.setTimeout(() => setShake(false), 500);
  };

  const validate = () => {
    const nextErrors = {};

    if (!email.trim()) {
      nextErrors.email = 'Email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      nextErrors.email = 'Enter a valid email address';
    }

    if (!password) {
      nextErrors.password = 'Password is required';
    }

    return nextErrors;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const nextErrors = validate();

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      triggerShake();
      return;
    }

    setErrors({});
    setBanner(null);
    setLoading(true);

    try {
      const response = await authAPI.login({ email, password });
      onAuthSuccess(response.data.user);
      toast.success('Signed in successfully.');
      navigate('/claims');
    } catch (error) {
      setBanner({
        type: 'error',
        message:
          error.response?.data?.error ||
          'No account found with these credentials.',
      });
      triggerShake();
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell visible={visible}>
      <div
        style={{
          background: 'white',
          borderRadius: 24,
          padding: '36px 32px',
          boxShadow: '0 4px 24px rgba(26,77,232,0.08), 0 1px 4px rgba(0,0,0,0.04)',
          border: '1px solid rgba(226,232,240,0.8)',
          animation: shake ? 'shake 0.4s ease' : 'none',
        }}
      >
        <h2 style={{ fontSize: 20, fontWeight: 800, color: '#1a202c', margin: '0 0 4px 0' }}>
          Welcome back
        </h2>
        <p style={{ fontSize: 14, color: '#a0aec0', margin: '0 0 26px 0' }}>
          Sign in to your rider account
        </p>

        <Banner type={banner?.type} message={banner?.message} />

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <Input
            label="Email Address"
            type="email"
            value={email}
            onChange={(event) => {
              setEmail(event.target.value);
              setErrors((currentValue) => ({ ...currentValue, email: '' }));
              setBanner(null);
            }}
            error={errors.email}
            placeholder="you@example.com"
            disabled={loading}
          />

          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(event) => {
              setPassword(event.target.value);
              setErrors((currentValue) => ({ ...currentValue, password: '' }));
              setBanner(null);
            }}
            error={errors.password}
            placeholder="Enter your password"
            disabled={loading}
          />

          <PrimaryButton loading={loading}>
            Sign In
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </PrimaryButton>
        </form>

        <Divider label="New to GigShield?" />

        <GhostButton onClick={onGoSignUp}>
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <line x1="19" y1="8" x2="19" y2="14" />
            <line x1="22" y1="11" x2="16" y2="11" />
          </svg>
          Create a Rider Account
        </GhostButton>
      </div>
    </AuthShell>
  );
};

const SignUpScreen = ({ onGoLogin, onAuthSuccess }) => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirm: '',
  });
  const [errors, setErrors] = useState({});
  const [banner, setBanner] = useState(null);
  const [loading, setLoading] = useState(false);
  const [shake, setShake] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setVisible(true), 60);
    return () => window.clearTimeout(timer);
  }, []);

  const updateField = (key) => (event) => {
    setForm((currentValue) => ({ ...currentValue, [key]: event.target.value }));
    setErrors((currentValue) => ({ ...currentValue, [key]: '' }));
    setBanner(null);
  };

  const triggerShake = () => {
    setShake(true);
    window.setTimeout(() => setShake(false), 500);
  };

  const validate = () => {
    const nextErrors = {};

    if (!form.name.trim()) {
      nextErrors.name = 'Full name is required';
    } else if (form.name.trim().split(' ').filter(Boolean).length < 2) {
      nextErrors.name = 'Please enter first and last name';
    }

    if (!form.email.trim()) {
      nextErrors.email = 'Email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      nextErrors.email = 'Enter a valid email address';
    }

    if (!form.password) {
      nextErrors.password = 'Password is required';
    } else if (form.password.length < 6) {
      nextErrors.password = 'Password must be at least 6 characters';
    }

    if (!form.confirm) {
      nextErrors.confirm = 'Please confirm your password';
    } else if (form.confirm !== form.password) {
      nextErrors.confirm = 'Passwords do not match';
    }

    return nextErrors;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const nextErrors = validate();

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      triggerShake();
      return;
    }

    setErrors({});
    setBanner(null);
    setLoading(true);

    try {
      const response = await authAPI.register({
        name: form.name,
        email: form.email,
        password: form.password,
      });

      onAuthSuccess(response.data.user);
      toast.success('Registration completed. Claim Management is ready.');
      navigate('/claims');
    } catch (error) {
      setBanner({
        type: 'error',
        message:
          error.response?.data?.error ||
          'We could not create the account right now.',
      });
      triggerShake();
    } finally {
      setLoading(false);
    }
  };

  const password = form.password;
  const strength =
    password.length === 0
      ? 0
      : [
          password.length >= 6,
          /[A-Z]/.test(password),
          /[0-9]/.test(password),
          /[^A-Za-z0-9]/.test(password),
        ].filter(Boolean).length;

  const strengthMeta = [
    null,
    { label: 'Weak', color: '#e53e3e' },
    { label: 'Fair', color: '#f59e0b' },
    { label: 'Good', color: '#3b82f6' },
    { label: 'Strong', color: '#22c55e' },
  ];
  const activeStrength = password.length === 0 ? 0 : Math.max(strength, 1);
  const activeStrengthMeta = strengthMeta[activeStrength];

  return (
    <AuthShell visible={visible}>
      <div
        style={{
          background: 'white',
          borderRadius: 24,
          padding: '36px 32px',
          boxShadow: '0 4px 24px rgba(26,77,232,0.08), 0 1px 4px rgba(0,0,0,0.04)',
          border: '1px solid rgba(226,232,240,0.8)',
          animation: shake ? 'shake 0.4s ease' : 'none',
        }}
      >
        <h2 style={{ fontSize: 20, fontWeight: 800, color: '#1a202c', margin: '0 0 4px 0' }}>
          Create your account
        </h2>
        <p style={{ fontSize: 14, color: '#a0aec0', margin: '0 0 26px 0' }}>
          Join GigShield and get protected today
        </p>

        <Banner type={banner?.type} message={banner?.message} />

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Input
            label="Full Name"
            value={form.name}
            onChange={updateField('name')}
            error={errors.name}
            placeholder="First and last name"
            disabled={loading}
          />

          <Input
            label="Email Address"
            type="email"
            value={form.email}
            onChange={updateField('email')}
            error={errors.email}
            placeholder="you@example.com"
            disabled={loading}
          />

          <div>
            <Input
              label="Password"
              type="password"
              value={form.password}
              onChange={updateField('password')}
              error={errors.password}
              placeholder="Use at least 6 characters"
              disabled={loading}
            />

            {password.length > 0 ? (
              <div style={{ marginTop: 8 }}>
                <div style={{ display: 'flex', gap: 4, marginBottom: 4 }}>
                  {[1, 2, 3, 4].map((bar) => (
                    <div
                      key={bar}
                      style={{
                        flex: 1,
                        height: 3,
                        borderRadius: 2,
                        background:
                          bar <= activeStrength
                            ? activeStrengthMeta.color
                            : '#e2e8f0',
                        transition: 'background 0.3s ease',
                      }}
                    />
                  ))}
                </div>
                <span
                  style={{
                    fontSize: 11,
                    color: activeStrengthMeta.color,
                    fontWeight: 700,
                  }}
                >
                  {activeStrengthMeta.label} password
                </span>
              </div>
            ) : null}
          </div>

          <Input
            label="Confirm Password"
            type="password"
            value={form.confirm}
            onChange={updateField('confirm')}
            error={errors.confirm}
            placeholder="Re-enter your password"
            disabled={loading}
          />

          <div style={{ marginTop: 4 }}>
            <PrimaryButton loading={loading}>
              Create Account
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </PrimaryButton>
          </div>
        </form>

        <Divider label="Already have an account?" />

        <GhostButton onClick={onGoLogin}>
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4M10 17l5-5-5-5M15 12H3" />
          </svg>
          Sign In Instead
        </GhostButton>
      </div>
    </AuthShell>
  );
};

const ExistingSessionCard = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setVisible(true), 60);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <AuthShell visible={visible}>
      <div
        style={{
          background: 'white',
          borderRadius: 24,
          padding: '36px 32px',
          boxShadow: '0 4px 24px rgba(26,77,232,0.08), 0 1px 4px rgba(0,0,0,0.04)',
          border: '1px solid rgba(226,232,240,0.8)',
        }}
      >
        <h2 style={{ fontSize: 20, fontWeight: 800, color: '#1a202c', margin: '0 0 4px 0' }}>
          Welcome back
        </h2>
        <p style={{ fontSize: 14, color: '#718096', margin: '0 0 24px 0' }}>
          Your backend session is ready for {user.name}.
        </p>

        <Banner
          type="success"
          message="Your account is active. Open Claim Management or sign out to switch users."
        />

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <GhostButton onClick={() => navigate('/claims')}>
            Open Claim Management
          </GhostButton>
          <GhostButton onClick={onLogout}>Sign Out</GhostButton>
        </div>
      </div>
    </AuthShell>
  );
};

const AuthPage = ({ user, onAuthSuccess, onLogout }) => {
  const [screen, setScreen] = useState('signup');

  if (user) {
    return <ExistingSessionCard user={user} onLogout={onLogout} />;
  }

  if (screen === 'login') {
    return (
      <LoginScreen
        onGoSignUp={() => setScreen('signup')}
        onAuthSuccess={onAuthSuccess}
      />
    );
  }

  return (
    <SignUpScreen
      onGoLogin={() => setScreen('login')}
      onAuthSuccess={onAuthSuccess}
    />
  );
};

export default AuthPage;
