import { useState, useEffect } from "react";

// ─── Helpers ──────────────────────────────────────────────────────────────────────
const getUsers = () => {
  try { return JSON.parse(localStorage.getItem("gigshield_users") || "[]"); }
  catch { return []; }
};
const saveUsers = (users) => localStorage.setItem("gigshield_users", JSON.stringify(users));

// ─── Logo ─────────────────────────────────────────────────────────────────────────
function GigShieldLogo({ size = 72 }) {
  return (
    <div style={{
      width: size, height: size,
      borderRadius: size * 0.26,
      background: "linear-gradient(145deg, #3b6ef8 0%, #1a4de8 100%)",
      display: "flex", alignItems: "center", justifyContent: "center",
      boxShadow: "0 8px 32px rgba(59,110,248,0.38), 0 2px 8px rgba(26,77,232,0.18)",
      flexShrink: 0,
    }}>
      <svg width={size * 0.58} height={size * 0.58} viewBox="0 0 40 44" fill="none">
        <path d="M20 2L4 8.5V20.5C4 29.5 11 37.8 20 40C29 37.8 36 29.5 36 20.5V8.5L20 2Z"
          fill="white" fillOpacity="0.18" />
        <path d="M20 2L4 8.5V20.5C4 29.5 11 37.8 20 40C29 37.8 36 29.5 36 20.5V8.5L20 2Z"
          stroke="white" strokeWidth="2.5" strokeLinejoin="round" />
        <path d="M13 21.5L17.5 26L27 16"
          stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
}

// ─── Shared Input ─────────────────────────────────────────────────────────────────
function Input({ label, type = "text", value, onChange, error, placeholder, disabled }) {
  const [focused, setFocused] = useState(false);
  const [showPwd, setShowPwd] = useState(false);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <label style={{
        fontSize: 12, fontWeight: 700,
        color: error ? "#e53e3e" : focused ? "#1a4de8" : "#4a5568",
        letterSpacing: "0.06em", textTransform: "uppercase", transition: "color 0.2s",
      }}>{label}</label>
      <div style={{ position: "relative" }}>
        <input
          type={type === "password" && showPwd ? "text" : type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{
            width: "100%", padding: "13px 16px",
            paddingRight: type === "password" ? 44 : 16,
            fontSize: 15, fontFamily: "'DM Sans', sans-serif", color: "#1a202c",
            background: focused ? "#f0f4ff" : "#f7f8fc",
            border: `2px solid ${error ? "#feb2b2" : focused ? "#3b6ef8" : "#e2e8f0"}`,
            borderRadius: 12, outline: "none",
            transition: "all 0.2s ease", boxSizing: "border-box",
            cursor: disabled ? "not-allowed" : "text",
            opacity: disabled ? 0.6 : 1,
          }}
        />
        {type === "password" && (
          <button type="button" onClick={() => setShowPwd(v => !v)} style={{
            position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)",
            background: "none", border: "none", cursor: "pointer", color: "#a0aec0",
            padding: 0, display: "flex",
          }}>
            {showPwd ? (
              <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" strokeLinecap="round" strokeLinejoin="round"/>
                <line x1="1" y1="1" x2="23" y2="23" strokeLinecap="round"/>
              </svg>
            ) : (
              <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="12" cy="12" r="3"/>
              </svg>
            )}
          </button>
        )}
      </div>
      {error && (
        <span style={{ fontSize: 12, color: "#e53e3e", display: "flex", alignItems: "center", gap: 4 }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
          </svg>
          {error}
        </span>
      )}
    </div>
  );
}

// ─── Banner ───────────────────────────────────────────────────────────────────────
function Banner({ type, message }) {
  if (!message) return null;
  const isError = type === "error";
  return (
    <div style={{
      background: isError ? "#fff5f5" : "#f0fff4",
      border: `1px solid ${isError ? "#fed7d7" : "#c6f6d5"}`,
      borderRadius: 10, padding: "12px 14px", marginBottom: 20,
      fontSize: 13, color: isError ? "#c53030" : "#276749",
      display: "flex", alignItems: "flex-start", gap: 8,
    }}>
      <svg width="16" height="16" style={{ marginTop: 1, flexShrink: 0 }} viewBox="0 0 24 24" fill="currentColor">
        {isError
          ? <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
          : <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
        }
      </svg>
      {message}
    </div>
  );
}

// ─── Auth Page Shell ──────────────────────────────────────────────────────────────
function AuthShell({ children, visible }) {
  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(160deg, #eef2ff 0%, #f0f7ff 40%, #e8f0fe 100%)",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: "24px 16px", fontFamily: "'DM Sans', sans-serif",
      position: "relative", overflow: "hidden",
    }}>
      <div style={{
        position: "absolute", top: -80, right: -80, width: 320, height: 320, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(59,110,248,0.10) 0%, transparent 70%)", pointerEvents: "none",
      }} />
      <div style={{
        position: "absolute", bottom: -60, left: -60, width: 260, height: 260, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(99,148,255,0.08) 0%, transparent 70%)", pointerEvents: "none",
      }} />
      <div style={{
        width: "100%", maxWidth: 440,
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(20px)",
        transition: "opacity 0.45s ease, transform 0.45s ease",
      }}>
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 14 }}>
            <GigShieldLogo size={76} />
          </div>
          <h1 style={{ fontSize: 29, fontWeight: 800, color: "#1a4de8", letterSpacing: "-0.5px", margin: 0 }}>
            GigShield
          </h1>
          <p style={{ fontSize: 14, color: "#718096", marginTop: 5, fontWeight: 400 }}>
            Protection built for riders, by riders.
          </p>
        </div>
        {children}
        <p style={{ textAlign: "center", fontSize: 12, color: "#cbd5e0", marginTop: 20 }}>
          © 2026 GigShield · Rider Protection Platform
        </p>
      </div>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes shake {
          0%,100% { transform: translateX(0); }
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
}

// ─── Primary Button ───────────────────────────────────────────────────────────────
function PrimaryButton({ loading, children }) {
  return (
    <button type="submit" disabled={loading} style={{
      width: "100%", padding: "15px",
      background: loading ? "#93a9f5" : "linear-gradient(135deg, #3b6ef8 0%, #1a4de8 100%)",
      color: "white", border: "none", borderRadius: 14,
      fontSize: 15, fontWeight: 700, cursor: loading ? "not-allowed" : "pointer",
      letterSpacing: "0.02em", transition: "all 0.2s ease",
      boxShadow: loading ? "none" : "0 4px 16px rgba(59,110,248,0.36)",
      display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
      fontFamily: "'DM Sans', sans-serif",
    }}
      onMouseEnter={e => { if (!loading) e.currentTarget.style.transform = "scale(1.02)"; }}
      onMouseLeave={e => { e.currentTarget.style.transform = "scale(1)"; }}
    >
      {loading ? (
        <>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
            style={{ animation: "spin 0.8s linear infinite" }} stroke="white" strokeWidth="2.5">
            <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" strokeLinecap="round"/>
          </svg>
          Please wait…
        </>
      ) : children}
    </button>
  );
}

// ─── Ghost Button (outlined) ──────────────────────────────────────────────────────
function GhostButton({ onClick, children }) {
  return (
    <button type="button" onClick={onClick} style={{
      width: "100%", padding: "14px", background: "transparent",
      border: "2px solid #3b6ef8", borderRadius: 14,
      fontSize: 15, fontWeight: 700, color: "#1a4de8",
      cursor: "pointer", letterSpacing: "0.02em", transition: "all 0.2s ease",
      display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
      fontFamily: "'DM Sans', sans-serif",
    }}
      onMouseEnter={e => { e.currentTarget.style.background = "#eff4ff"; e.currentTarget.style.transform = "scale(1.01)"; }}
      onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.transform = "scale(1)"; }}
    >
      {children}
    </button>
  );
}

// ─── Divider ──────────────────────────────────────────────────────────────────────
function Divider({ label }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "22px 0" }}>
      <div style={{ flex: 1, height: 1, background: "#e2e8f0" }} />
      <span style={{ fontSize: 12, color: "#a0aec0", fontWeight: 500 }}>{label}</span>
      <div style={{ flex: 1, height: 1, background: "#e2e8f0" }} />
    </div>
  );
}

// ─── LOGIN SCREEN ─────────────────────────────────────────────────────────────────
function LoginScreen({ onLogin, onGoSignUp }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [banner, setBanner] = useState(null);
  const [loading, setLoading] = useState(false);
  const [shake, setShake] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => { setTimeout(() => setVisible(true), 60); }, []);

  const triggerShake = () => { setShake(true); setTimeout(() => setShake(false), 500); };

  const validate = () => {
    const e = {};
    if (!email) e.email = "Email address is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = "Enter a valid email address";
    if (!password) e.password = "Password is required";
    return e;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); triggerShake(); return; }
    setErrors({}); setBanner(null); setLoading(true);
    await new Promise(r => setTimeout(r, 900));

    const users = getUsers();
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
    if (!user) {
      setLoading(false);
      setBanner({ type: "error", message: "No account found with these credentials. Please check your details or create an account." });
      triggerShake();
      return;
    }
    setLoading(false);
    onLogin(user);
  };

  return (
    <AuthShell visible={visible}>
      <div style={{
        background: "white", borderRadius: 24, padding: "36px 32px",
        boxShadow: "0 4px 24px rgba(26,77,232,0.08), 0 1px 4px rgba(0,0,0,0.04)",
        border: "1px solid rgba(226,232,240,0.8)",
        animation: shake ? "shake 0.4s ease" : "none",
      }}>
        <h2 style={{ fontSize: 20, fontWeight: 800, color: "#1a202c", margin: "0 0 4px 0" }}>Welcome back</h2>
        <p style={{ fontSize: 14, color: "#a0aec0", margin: "0 0 26px 0" }}>Sign in to your rider account</p>

        <Banner type={banner?.type} message={banner?.message} />

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <Input label="Email Address" type="email" value={email}
            onChange={e => { setEmail(e.target.value); setErrors(p => ({ ...p, email: "" })); setBanner(null); }}
            error={errors.email} placeholder="you@example.com" disabled={loading} />
          <Input label="Password" type="password" value={password}
            onChange={e => { setPassword(e.target.value); setErrors(p => ({ ...p, password: "" })); setBanner(null); }}
            error={errors.password} placeholder="Enter your password" disabled={loading} />

          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: -6 }}>
            <button type="button" style={{
              background: "none", border: "none", fontSize: 13, color: "#3b6ef8",
              cursor: "pointer", fontWeight: 600, padding: 0, fontFamily: "'DM Sans', sans-serif",
            }}>Forgot password?</button>
          </div>

          <PrimaryButton loading={loading}>
            Sign In
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </PrimaryButton>
        </form>

        <Divider label="New to GigShield?" />

        <GhostButton onClick={onGoSignUp}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2"/>
            <circle cx="9" cy="7" r="4"/>
            <line x1="19" y1="8" x2="19" y2="14"/>
            <line x1="22" y1="11" x2="16" y2="11"/>
          </svg>
          Create a Rider Account
        </GhostButton>
      </div>
    </AuthShell>
  );
}

// ─── SIGN UP SCREEN ───────────────────────────────────────────────────────────────
function SignUpScreen({ onSignedUp, onGoLogin }) {
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "", confirm: "" });
  const [errors, setErrors] = useState({});
  const [banner, setBanner] = useState(null);
  const [loading, setLoading] = useState(false);
  const [shake, setShake] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => { setTimeout(() => setVisible(true), 60); }, []);

  const set = key => e => {
    setForm(p => ({ ...p, [key]: e.target.value }));
    setErrors(p => ({ ...p, [key]: "" }));
    setBanner(null);
  };

  const triggerShake = () => { setShake(true); setTimeout(() => setShake(false), 500); };

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Full name is required";
    else if (form.name.trim().split(" ").filter(Boolean).length < 2) e.name = "Please enter first and last name";
    if (!form.email) e.email = "Email address is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Enter a valid email address";
    if (!form.phone) e.phone = "Phone number is required";
    else if (!/^\+?[\d\s\-()]{7,15}$/.test(form.phone)) e.phone = "Enter a valid phone number";
    if (!form.password) e.password = "Password is required";
    else if (form.password.length < 8) e.password = "Password must be at least 8 characters";
    else if (!/[A-Z]/.test(form.password)) e.password = "Include at least one uppercase letter";
    else if (!/[0-9]/.test(form.password)) e.password = "Include at least one number";
    if (!form.confirm) e.confirm = "Please confirm your password";
    else if (form.confirm !== form.password) e.confirm = "Passwords do not match";
    return e;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); triggerShake(); return; }
    setErrors({}); setBanner(null); setLoading(true);
    await new Promise(r => setTimeout(r, 1000));

    const users = getUsers();
    if (users.find(u => u.email.toLowerCase() === form.email.toLowerCase())) {
      setLoading(false);
      setBanner({ type: "error", message: "An account with this email already exists. Please sign in instead." });
      triggerShake();
      return;
    }

    const newUser = {
      name: form.name.trim(),
      email: form.email.toLowerCase(),
      phone: form.phone.trim(),
      password: form.password,
      badge: "STANDARD",
      joinedAt: new Date().toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }),
    };
    saveUsers([...users, newUser]);
    setLoading(false);
    onSignedUp(newUser);
  };

  // Password strength meter
  const pwd = form.password;
  const strength = pwd.length === 0 ? 0
    : [pwd.length >= 8, /[A-Z]/.test(pwd), /[0-9]/.test(pwd), /[^A-Za-z0-9]/.test(pwd)].filter(Boolean).length;
  const strengthMeta = [
    null,
    { label: "Weak", color: "#e53e3e" },
    { label: "Fair", color: "#f59e0b" },
    { label: "Good", color: "#3b82f6" },
    { label: "Strong", color: "#22c55e" },
  ];

  return (
    <AuthShell visible={visible}>
      <div style={{
        background: "white", borderRadius: 24, padding: "36px 32px",
        boxShadow: "0 4px 24px rgba(26,77,232,0.08), 0 1px 4px rgba(0,0,0,0.04)",
        border: "1px solid rgba(226,232,240,0.8)",
        animation: shake ? "shake 0.4s ease" : "none",
      }}>
        <h2 style={{ fontSize: 20, fontWeight: 800, color: "#1a202c", margin: "0 0 4px 0" }}>Create your account</h2>
        <p style={{ fontSize: 14, color: "#a0aec0", margin: "0 0 26px 0" }}>
          Join GigShield and get protected today
        </p>

        <Banner type={banner?.type} message={banner?.message} />

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <Input label="Full Name" value={form.name} onChange={set("name")}
            error={errors.name} placeholder="First and last name" disabled={loading} />
          <Input label="Email Address" type="email" value={form.email} onChange={set("email")}
            error={errors.email} placeholder="you@example.com" disabled={loading} />
          <Input label="Phone Number" type="tel" value={form.phone} onChange={set("phone")}
            error={errors.phone} placeholder="+91 98765 43210" disabled={loading} />

          <div>
            <Input label="Password" type="password" value={form.password} onChange={set("password")}
              error={errors.password} placeholder="Min. 8 chars, 1 uppercase, 1 number" disabled={loading} />
            {pwd.length > 0 && (
              <div style={{ marginTop: 8 }}>
                <div style={{ display: "flex", gap: 4, marginBottom: 4 }}>
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} style={{
                      flex: 1, height: 3, borderRadius: 2,
                      background: i <= strength ? strengthMeta[strength].color : "#e2e8f0",
                      transition: "background 0.3s ease",
                    }} />
                  ))}
                </div>
                <span style={{ fontSize: 11, color: strengthMeta[strength].color, fontWeight: 700 }}>
                  {strengthMeta[strength].label} password
                </span>
              </div>
            )}
          </div>

          <Input label="Confirm Password" type="password" value={form.confirm} onChange={set("confirm")}
            error={errors.confirm} placeholder="Re-enter your password" disabled={loading} />

          <div style={{ marginTop: 4 }}>
            <PrimaryButton loading={loading}>
              Create Account
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </PrimaryButton>
          </div>
        </form>

        <Divider label="Already have an account?" />

        <GhostButton onClick={onGoLogin}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4M10 17l5-5-5-5M15 12H3"/>
          </svg>
          Sign In Instead
        </GhostButton>
      </div>
    </AuthShell>
  );
}

// ─── HOME SCREEN ─────────────────────────────────────────────────────────────────
function HomeScreen({ user, onSignOut }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => { setTimeout(() => setVisible(true), 60); }, []);

  const stats = [
    { label: "Active Coverage", value: "✓ Active", color: "#22c55e", border: "#bbf7d0" },
    { label: "This Month", value: "32 Rides", color: "#3b6ef8", border: "#bfdbfe" },
    { label: "Claims Filed", value: "0", color: "#8b5cf6", border: "#ddd6fe" },
    { label: "Shield Score", value: "98 / 100", color: "#f59e0b", border: "#fde68a" },
  ];

  const recentActivity = [
    { action: "Account created successfully", time: `Joined ${user.joinedAt || "Today"}`, icon: "🎉" },
    { action: "Coverage activated", time: "Just now", icon: "🛡️" },
    { action: "Profile verification pending", time: "Action required", icon: "🔒" },
  ];

  const initials = user.name.split(" ").filter(Boolean).map(n => n[0]).join("").slice(0, 2).toUpperCase();

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(160deg, #eef2ff 0%, #f0f7ff 40%, #e8f0fe 100%)",
      fontFamily: "'DM Sans', sans-serif", position: "relative", overflow: "hidden",
    }}>
      <div style={{
        position: "absolute", top: -120, right: -120, width: 400, height: 400, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(59,110,248,0.08) 0%, transparent 70%)", pointerEvents: "none",
      }} />

      {/* Nav */}
      <nav style={{
        background: "rgba(255,255,255,0.88)", backdropFilter: "blur(12px)",
        borderBottom: "1px solid rgba(226,232,240,0.8)",
        padding: "0 24px", display: "flex", alignItems: "center",
        justifyContent: "space-between", height: 64,
        position: "sticky", top: 0, zIndex: 10,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <GigShieldLogo size={36} />
          <span style={{ fontSize: 18, fontWeight: 800, color: "#1a4de8", letterSpacing: "-0.3px" }}>GigShield</span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{
            display: "flex", alignItems: "center", gap: 8,
            background: "#f0f4ff", borderRadius: 20, padding: "6px 12px",
          }}>
            <div style={{
              width: 28, height: 28, borderRadius: "50%",
              background: "linear-gradient(135deg, #3b6ef8, #1a4de8)",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "white", fontSize: 11, fontWeight: 700, flexShrink: 0,
            }}>{initials}</div>
            <span style={{ fontSize: 13, fontWeight: 600, color: "#2d3748" }}>{user.name}</span>
            <span style={{
              fontSize: 10, fontWeight: 700, color: "#3b6ef8",
              background: "#dbeafe", borderRadius: 4, padding: "2px 6px",
            }}>{user.badge}</span>
          </div>

          <button onClick={onSignOut} style={{
            background: "none", border: "2px solid #e2e8f0", borderRadius: 10,
            padding: "7px 14px", fontSize: 13, fontWeight: 600, color: "#718096",
            cursor: "pointer", transition: "all 0.2s ease",
            display: "flex", alignItems: "center", gap: 6,
            fontFamily: "'DM Sans', sans-serif",
          }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = "#fc8181"; e.currentTarget.style.color = "#e53e3e"; e.currentTarget.style.background = "#fff5f5"; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = "#e2e8f0"; e.currentTarget.style.color = "#718096"; e.currentTarget.style.background = "none"; }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/>
            </svg>
            Sign Out
          </button>
        </div>
      </nav>

      {/* Main */}
      <main style={{
        maxWidth: 900, margin: "0 auto", padding: "36px 24px",
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(16px)",
        transition: "opacity 0.5s ease, transform 0.5s ease",
      }}>
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: "#1a202c", margin: "0 0 4px 0", letterSpacing: "-0.3px" }}>
            Welcome, {user.name.split(" ")[0]} 👋
          </h1>
          <p style={{ fontSize: 15, color: "#718096", margin: 0 }}>
            Your coverage is active and up to date. Here's your overview.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 16, marginBottom: 28 }}>
          {stats.map(s => (
            <div key={s.label} style={{
              background: "white", borderRadius: 16, padding: "20px",
              border: `1px solid ${s.border}`, transition: "transform 0.2s ease, box-shadow 0.2s ease",
            }}
              onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 6px 20px rgba(0,0,0,0.07)"; }}
              onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}
            >
              <p style={{ fontSize: 12, color: "#a0aec0", margin: "0 0 8px 0", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>{s.label}</p>
              <p style={{ fontSize: 20, fontWeight: 800, color: s.color, margin: 0 }}>{s.value}</p>
            </div>
          ))}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
          <div style={{
            background: "white", borderRadius: 20, padding: "28px",
            boxShadow: "0 2px 16px rgba(26,77,232,0.06)", border: "1px solid rgba(226,232,240,0.8)",
          }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: "#1a202c", margin: "0 0 20px 0" }}>Shield Status</h3>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "16px 0" }}>
              <div style={{ position: "relative", marginBottom: 16 }}>
                <GigShieldLogo size={64} />
                <div style={{
                  position: "absolute", bottom: -2, right: -2, width: 20, height: 20,
                  borderRadius: "50%", background: "#22c55e", border: "2px solid white",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <div style={{ width: 7, height: 7, borderRadius: "50%", background: "white" }} />
                </div>
              </div>
              <div style={{
                fontSize: 15, fontWeight: 700, color: "#22c55e",
                background: "#f0fdf4", border: "1px solid #bbf7d0",
                borderRadius: 20, padding: "6px 16px", marginBottom: 8,
              }}>✓ Fully Protected</div>
              <p style={{ fontSize: 13, color: "#a0aec0", textAlign: "center", margin: 0 }}>
                Your rider protection plan is active.<br />Coverage renews May 1, 2027.
              </p>
            </div>
          </div>

          <div style={{
            background: "white", borderRadius: 20, padding: "28px",
            boxShadow: "0 2px 16px rgba(26,77,232,0.06)", border: "1px solid rgba(226,232,240,0.8)",
          }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: "#1a202c", margin: "0 0 20px 0" }}>Recent Activity</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {recentActivity.map((item, i) => (
                <div key={i} style={{
                  display: "flex", alignItems: "center", gap: 12,
                  padding: "12px", background: "#f8faff", borderRadius: 12, transition: "background 0.2s",
                }}
                  onMouseEnter={e => { e.currentTarget.style.background = "#eff4ff"; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "#f8faff"; }}
                >
                  <span style={{ fontSize: 20 }}>{item.icon}</span>
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 600, color: "#2d3748", margin: 0 }}>{item.action}</p>
                    <p style={{ fontSize: 11, color: "#a0aec0", margin: "2px 0 0 0" }}>{item.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');
        * { box-sizing: border-box; }
      `}</style>
    </div>
  );
}

// ─── APP ROOT ─────────────────────────────────────────────────────────────────────
export default function App() {
  const [screen, setScreen] = useState("login");
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem("gigshield_session") || "null"); }
    catch { return null; }
  });

  const handleLogin = (userData) => {
    localStorage.setItem("gigshield_session", JSON.stringify(userData));
    setUser(userData);
  };

  const handleSignedUp = (userData) => {
    localStorage.setItem("gigshield_session", JSON.stringify(userData));
    setUser(userData);
  };

  const handleSignOut = () => {
    localStorage.removeItem("gigshield_session");
    setUser(null);
    setScreen("login");
  };

  if (user) return <HomeScreen user={user} onSignOut={handleSignOut} />;
  if (screen === "signup") return <SignUpScreen onSignedUp={handleSignedUp} onGoLogin={() => setScreen("login")} />;
  return <LoginScreen onLogin={handleLogin} onGoSignUp={() => setScreen("signup")} />;
}
