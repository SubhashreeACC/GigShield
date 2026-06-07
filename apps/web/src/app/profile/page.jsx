'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import styles from './page.module.css';

export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function load() {
      try {
        const meRes = await api.getMe();
        setUser(meRes.data);
        const subRes = await api.getActiveSubscription();
        setSubscription(subRes.data);
      } catch {} finally { setLoading(false); }
    }
    load();
  }, []);

  function handleLogout() {
    api.logout();
    router.push('/sign-in');
  }

  if (loading) {
    return (
      <div className="container">
        <div className="skeleton" style={{ height: '400px', borderRadius: 'var(--radius-lg)' }} />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container">
        <div className="card" style={{ textAlign: 'center', padding: 'var(--space-10)' }}>
          <h2>Please Log In</h2>
          <p>Sign in to view your profile</p>
          <button className="btn btn-primary" onClick={() => router.push('/sign-in')}>Sign In</button>
        </div>
      </div>
    );
  }

  return (
    <div className="container" style={{ maxWidth: '640px', margin: '0 auto' }}>
      <h1 className={styles.title}>Profile</h1>

      {/* User Info */}
      <div className={`card ${styles.profileCard}`} id="profile-card">
        <div className={styles.avatar}>
          <span className={styles.avatarEmoji}>👤</span>
        </div>
        <h2 className={styles.userName}>{user.name || 'Gig Worker'}</h2>
        <span className={styles.userPhone}>📱 +91 {user.phone}</span>

        <div className={styles.infoGrid}>
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>Platform</span>
            <span className={styles.infoValue}>
              {user.platform === 'Swiggy' ? '🍔' : user.platform === 'Zomato' ? '🍕' : '📦'} {user.platform || 'Not set'}
            </span>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>City</span>
            <span className={styles.infoValue}>📍 {user.city || 'Not set'}</span>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>Zone</span>
            <span className={styles.infoValue}>{user.zone || 'Not set'}</span>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>Risk Level</span>
            <span className={`badge ${
              user.riskLevel === 'low' ? 'badge-success' :
              user.riskLevel === 'medium' ? 'badge-warning' : 'badge-danger'
            }`}>
              {user.riskLevel?.toUpperCase() || 'N/A'}
            </span>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>Member Since</span>
            <span className={styles.infoValue}>{new Date(user.createdAt).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}</span>
          </div>
        </div>
      </div>

      {/* Subscription Management */}
      <div className={`card ${styles.section}`}>
        <h3 className={styles.sectionTitle}>Subscription</h3>
        {subscription ? (
          <div className={styles.subInfo}>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Plan</span>
              <span className={styles.infoValue}>{subscription.plan?.name} — ₹{subscription.plan?.weeklyPremium}/week</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Status</span>
              <span className="badge badge-success">Active</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Auto-Renew</span>
              <span className={styles.infoValue}>{subscription.autoRenew ? 'On' : 'Off'}</span>
            </div>
          </div>
        ) : (
          <p className={styles.noSub}>No active subscription</p>
        )}
      </div>

      {/* Payout Settings */}
      <div className={`card ${styles.section}`}>
        <h3 className={styles.sectionTitle}>Payout Method</h3>
        <div className={styles.infoItem}>
          <span className={styles.infoLabel}>UPI ID</span>
          <span className={styles.infoValue}>•••@upi (sandbox)</span>
        </div>
      </div>

      {/* Actions */}
      <div className={styles.actions}>
        <button className="btn btn-danger" onClick={handleLogout} id="logout-btn" style={{ width: '100%' }}>
          Sign Out
        </button>
      </div>
    </div>
  );
}
