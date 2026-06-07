'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';
import { api } from '@/lib/api';
import { getCurrentUser, isLoggedIn } from '@/lib/auth';

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [subscription, setSubscription] = useState(null);
  const [triggers, setTriggers] = useState(null);
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check local auth first
    const localUser = getCurrentUser();
    if (!localUser && !isLoggedIn()) {
      router.push('/sign-in');
      return;
    }

    async function loadDashboard() {
      try {
        const meRes = await api.getMe();
        setUser(meRes.data || localUser);

        const subRes = await api.getActiveSubscription();
        setSubscription(subRes.data);

        try {
          const trigRes = await api.getTriggerStatus();
          setTriggers(trigRes.data);
        } catch {}

        try {
          const claimRes = await api.getClaims(1);
          setClaims(claimRes.data?.slice(0, 3) || []);
        } catch {}
      } catch {
        // Use local user data as fallback
        setUser(localUser);
      } finally {
        setLoading(false);
      }
    }
    loadDashboard();
  }, [router]);

  if (loading) {
    return (
      <div className="container">
        <div className={styles.heroCard}>
          <div className="skeleton" style={{ height: '200px', borderRadius: 'var(--radius-lg)' }} />
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container">
        <div className={styles.loginPrompt}>
          <span className={styles.loginPromptIcon}>🔒</span>
          <h2 className={styles.loginPromptTitle}>Login Required</h2>
          <p className={styles.loginPromptText}>
            Please sign in to access your dashboard and manage your income protection.
          </p>
          <div className={styles.loginPromptActions}>
            <Link href="/sign-in" className="btn btn-primary">Sign In</Link>
            <Link href="/register" className="btn btn-secondary">Create Account</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      {/* Greeting Header */}
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.greeting}>
            Welcome back{user.name ? `, ${user.name}` : ''} 👋
          </h1>
          <p className={styles.greetingSub}>
            Here&apos;s your income protection overview
          </p>
        </div>
      </div>

      {/* Coverage Card */}
      <section className={styles.coverageCard} id="coverage-card">
        {subscription ? (
          <>
            <div className={styles.coverageStatus}>
              <span className={styles.coverageIcon}>✅</span>
              <div>
                <h2 className={styles.coverageTitle}>You&apos;re Protected</h2>
                <p className={styles.coveragePlan}>
                  {subscription.plan?.name} Plan — ₹{subscription.plan?.coverageAmount} coverage
                </p>
              </div>
            </div>
            <div className={styles.coverageMeta}>
              <span className="badge badge-success">Active</span>
              <span className={styles.coverageDays}>
                {subscription.daysRemaining} days remaining this week
              </span>
            </div>
          </>
        ) : (
          <>
            <div className={styles.coverageStatus}>
              <span className={styles.coverageIcon}>❌</span>
              <div>
                <h2 className={styles.coverageTitle}>Not Covered</h2>
                <p className={styles.coveragePlan}>Subscribe to a plan to get protected</p>
              </div>
            </div>
            <Link href="/coverage" className="btn btn-primary" id="subscribe-cta">
              Get Protected
            </Link>
          </>
        )}
      </section>

      {/* Disruption Alerts */}
      <section className={styles.section} id="disruption-alerts">
        <h2 className={styles.sectionTitle}>Disruption Alerts</h2>
        {triggers?.isTriggered ? (
          <div className={styles.alertGrid}>
            {triggers.triggers.map((trigger, i) => (
              <div key={i} className={`card card-alert animate-fade-in ${styles.alertCard}`}>
                <div className={styles.alertHeader}>
                  <span className={styles.alertEmoji}>
                    {trigger.type === 'rain' ? '🌧️' : trigger.type === 'heat' ? '🌡️' : trigger.type === 'aqi' ? '💨' : '🚧'}
                  </span>
                  <span className={`badge ${trigger.severity === 'critical' ? 'badge-danger' : 'badge-warning'}`}>
                    {trigger.severity}
                  </span>
                </div>
                <p className={styles.alertMessage}>{trigger.message}</p>
                {subscription && (
                  <p className={styles.alertCovered}>You&apos;re covered 👍</p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className={`card ${styles.noAlerts}`}>
            <span className={styles.noAlertsIcon}>☀️</span>
            <p>No active disruptions in your zone. All clear!</p>
          </div>
        )}
      </section>

      {/* Weekly Earnings Protection Summary */}
      <section className={styles.section} id="earnings-summary">
        <h2 className={styles.sectionTitle}>Weekly Protection</h2>
        <div className={`card ${styles.earningsCard}`}>
          <div className={styles.earningsAmount}>
            <span className={styles.earningsLabel}>This Week</span>
            <span className={styles.earningsValue}>
              ₹{subscription?.plan?.coverageAmount || 0}
            </span>
            <span className={styles.earningsLabel}>protected</span>
          </div>
          <div className={styles.earningsBars}>
            {[65, 80, 45, 100].map((pct, i) => (
              <div key={i} className={styles.barGroup}>
                <div className={styles.bar}>
                  <div className={styles.barFill} style={{ height: `${pct}%` }} />
                </div>
                <span className={styles.barLabel}>W{i + 1}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Recent Claims */}
      <section className={styles.section} id="recent-claims">
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Recent Claims</h2>
          <Link href="/claims" className={styles.viewAll}>View All →</Link>
        </div>
        {claims.length > 0 ? (
          <div className={styles.claimsList}>
            {claims.map((claim) => (
              <Link href={`/claims/${claim.id}`} key={claim.id} className={`card card-interactive ${styles.claimItem}`}>
                <div className={styles.claimInfo}>
                  <span className={styles.claimType}>
                    {claim.triggerEvent?.type === 'rain' ? '🌧️' : '🌡️'}
                    {' '}{claim.triggerEvent?.type || 'Event'}
                  </span>
                  <span className={styles.claimDate}>
                    {new Date(claim.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div className={styles.claimRight}>
                  <span className={styles.claimAmount}>₹{claim.amount}</span>
                  <span className={`badge ${
                    claim.status === 'paid' ? 'badge-success' :
                    claim.status === 'approved' ? 'badge-info' :
                    claim.status === 'rejected' ? 'badge-danger' : 'badge-warning'
                  }`}>
                    {claim.status === 'paid' ? '✅ Paid' :
                     claim.status === 'approved' ? '✅ Approved' :
                     claim.status === 'rejected' ? '❌ Rejected' : '⏳ Pending'}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className={`card ${styles.noAlerts}`}>
            <p>No claims yet. You&apos;ll see them here when triggered.</p>
          </div>
        )}
      </section>
    </div>
  );
}
