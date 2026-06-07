'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import styles from './page.module.css';

export default function ClaimDetailPage({ params }) {
  const { id } = use(params);
  const [claim, setClaim] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function load() {
      try {
        const res = await api.getClaimDetail(id);
        setClaim(res.data);
      } catch (err) {
        console.error('Failed to load claim:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  if (loading) {
    return (
      <div className="container">
        <div className="skeleton" style={{ height: '400px', borderRadius: 'var(--radius-lg)' }} />
      </div>
    );
  }

  if (!claim) {
    return (
      <div className="container">
        <div className="card" style={{ textAlign: 'center', padding: 'var(--space-10)' }}>
          <h2>Claim Not Found</h2>
          <button className="btn btn-primary" onClick={() => router.push('/claims')}>
            Back to Claims
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container" style={{ maxWidth: '720px', margin: '0 auto' }}>
      <button className={styles.backBtn} onClick={() => router.push('/claims')}>← Back to Claims</button>

      <div className={styles.header}>
        <h1>Claim Details</h1>
        <span className={`badge ${
          claim.status === 'paid' ? 'badge-success' :
          claim.status === 'approved' ? 'badge-info' :
          claim.status === 'rejected' ? 'badge-danger' : 'badge-warning'
        }`} style={{ fontSize: 'var(--text-sm)', padding: 'var(--space-2) var(--space-4)' }}>
          {claim.status?.toUpperCase()}
        </span>
      </div>

      {/* Amount */}
      <div className={`card ${styles.amountCard}`}>
        <span className={styles.amountLabel}>Claim Amount</span>
        <span className={styles.amountValue}>₹{claim.amount}</span>
        <span className={styles.amountPlan}>{claim.subscription?.plan?.name} Plan</span>
      </div>

      {/* Trigger Info */}
      <div className={`card ${styles.section}`}>
        <h3 className={styles.sectionTitle}>What Triggered This Claim</h3>
        <div className={styles.infoGrid}>
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>Type</span>
            <span className={styles.infoValue}>
              {claim.triggerEvent?.type === 'rain' ? '🌧️' : '🌡️'} {claim.triggerEvent?.type}
            </span>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>Location</span>
            <span className={styles.infoValue}>{claim.triggerEvent?.city} · {claim.triggerEvent?.zone}</span>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>Severity</span>
            <span className={`badge ${claim.triggerEvent?.severity === 'critical' ? 'badge-danger' : 'badge-warning'}`}>
              {claim.triggerEvent?.severity}
            </span>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>Detected At</span>
            <span className={styles.infoValue}>
              {claim.triggerEvent?.detectedAt ? new Date(claim.triggerEvent.detectedAt).toLocaleString('en-IN') : 'N/A'}
            </span>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>Threshold</span>
            <span className={styles.infoValue}>{claim.triggerEvent?.thresholdBreached}</span>
          </div>
        </div>
      </div>

      {/* Fraud Check Results */}
      {claim.fraudChecks?.length > 0 && (
        <div className={`card ${styles.section}`}>
          <h3 className={styles.sectionTitle}>Verification Results</h3>
          <div className={styles.fraudScore}>
            <span className={styles.infoLabel}>Fraud Score</span>
            <span className={styles.scoreValue}>{((claim.fraudScore || 0) * 100).toFixed(0)}%</span>
            <span className={`badge ${claim.fraudScore < 0.3 ? 'badge-success' : claim.fraudScore > 0.7 ? 'badge-danger' : 'badge-warning'}`}>
              {claim.fraudScore < 0.3 ? 'Low Risk' : claim.fraudScore > 0.7 ? 'High Risk' : 'Under Review'}
            </span>
          </div>
          <div className={styles.checksList}>
            {claim.fraudChecks.map((check, i) => (
              <div key={i} className={styles.checkItem}>
                <span className={styles.checkIcon}>{check.passed ? '✅' : '⚠️'}</span>
                <div className={styles.checkInfo}>
                  <span className={styles.checkType}>{check.checkType}</span>
                  <span className={styles.checkDetail}>
                    {check.details?.reason || check.details?.note || (check.passed ? 'Passed' : 'Flagged')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Payout Info */}
      {claim.payouts?.length > 0 && (
        <div className={`card card-payout ${styles.section}`}>
          <h3 className={styles.sectionTitle}>Payout Details</h3>
          <div className={styles.infoGrid}>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Method</span>
              <span className={styles.infoValue}>{claim.payouts[0]?.method?.toUpperCase()}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Status</span>
              <span className={`badge ${claim.payouts[0]?.status === 'success' ? 'badge-success' : 'badge-warning'}`}>
                {claim.payouts[0]?.status}
              </span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Reference</span>
              <span className={styles.infoValue} style={{ fontSize: 'var(--text-caption)' }}>
                {claim.payouts[0]?.razorpayPayoutId || 'N/A'}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
