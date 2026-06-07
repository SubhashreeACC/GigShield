'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import styles from './page.module.css';

export default function AdminOverviewPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await api.admin.getOverview();
        setStats(res.data);
      } catch (err) {
        console.error('Failed to load admin overview:', err);
      } finally { setLoading(false); }
    }
    load();
  }, []);

  if (loading) {
    return (
      <div>
        <h1 className={styles.title}>Dashboard Overview</h1>
        <div className={styles.statGrid}>
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="skeleton" style={{ height: '120px', borderRadius: 'var(--radius-lg)' }} />
          ))}
        </div>
      </div>
    );
  }

  const cards = [
    { label: 'Total Users', value: stats?.totalUsers || 0, icon: '👥', color: 'var(--color-secondary)' },
    { label: 'Active Subscriptions', value: stats?.activeSubscriptions || 0, icon: '🛡️', color: 'var(--color-accent)' },
    { label: 'Premium This Week', value: `₹${stats?.premiumCollectedThisWeek || 0}`, icon: '💰', color: 'var(--color-warning)' },
    { label: 'Payouts This Week', value: `₹${stats?.payoutsThisWeek || 0}`, icon: '💸', color: 'var(--color-accent)' },
    { label: 'Loss Ratio', value: stats?.lossRatio || 0, icon: '📉', color: stats?.lossRatio > 1 ? 'var(--color-danger)' : 'var(--color-accent)' },
    { label: 'Active Triggers', value: stats?.activeTriggersThisWeek || 0, icon: '⚡', color: 'var(--color-warning)' },
    { label: 'Pending Claims', value: stats?.pendingClaims || 0, icon: '⏳', color: 'var(--color-warning)' },
  ];

  return (
    <div>
      <h1 className={styles.title}>Dashboard Overview</h1>
      <div className={styles.statGrid} id="admin-stats">
        {cards.map((card, i) => (
          <div key={i} className={`card ${styles.statCard}`}>
            <div className={styles.statIcon} style={{ background: `${card.color}15`, color: card.color }}>
              {card.icon}
            </div>
            <div className={styles.statInfo}>
              <span className={styles.statValue}>{card.value}</span>
              <span className={styles.statLabel}>{card.label}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
