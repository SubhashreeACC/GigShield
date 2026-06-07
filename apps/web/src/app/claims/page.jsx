'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import styles from './page.module.css';

export default function ClaimsPage() {
  const [claims, setClaims] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function fetchClaims() {
      setLoading(true);
      try {
        const res = await api.getClaims(1, statusFilter);
        if (!cancelled) {
          setClaims(res.data || []);
          setPagination(res.pagination || { page: 1, totalPages: 1 });
        }
      } catch (err) {
        console.error('Failed to load claims:', err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchClaims();
    return () => { cancelled = true; };
  }, [statusFilter]);

  async function loadClaims(page = 1) {
    setLoading(true);
    try {
      const res = await api.getClaims(page, statusFilter);
      setClaims(res.data || []);
      setPagination(res.pagination || { page: 1, totalPages: 1 });
    } catch (err) {
      console.error('Failed to load claims:', err);
    } finally {
      setLoading(false);
    }
  }

  const statusFilters = ['', 'pending', 'approved', 'paid', 'rejected'];

  return (
    <div className="container">
      <div className={styles.titleRow}>
        <h1 className={styles.title}>Claims History</h1>
        <Link href="/claims/new" className="btn btn-primary" id="new-claim-btn">
          + File New Claim
        </Link>
      </div>

      {/* Filters */}
      <div className={styles.filters} id="claims-filters">
        {statusFilters.map(s => (
          <button
            key={s || 'all'}
            className={`${styles.filterBtn} ${statusFilter === s ? styles.filterActive : ''}`}
            onClick={() => setStatusFilter(s)}
            id={`filter-${s || 'all'}`}
          >
            {s ? s.charAt(0).toUpperCase() + s.slice(1) : 'All'}
          </button>
        ))}
      </div>

      {/* Claims List */}
      {loading ? (
        <div className={styles.loading}>
          {[1, 2, 3].map(i => (
            <div key={i} className="skeleton" style={{ height: '80px', borderRadius: 'var(--radius-lg)', marginBottom: 'var(--space-2)' }} />
          ))}
        </div>
      ) : claims.length > 0 ? (
        <div className={styles.claimsList}>
          {claims.map(claim => (
            <Link href={`/claims/${claim.id}`} key={claim.id} className={`card card-interactive ${styles.claimRow}`} id={`claim-${claim.id}`}>
              <div className={styles.claimLeft}>
                <span className={styles.claimIcon}>
                  {claim.triggerEvent?.type === 'rain' ? '🌧️' :
                   claim.triggerEvent?.type === 'heat' ? '🌡️' :
                   claim.triggerEvent?.type === 'aqi' ? '💨' : '🚧'}
                </span>
                <div className={styles.claimInfo}>
                  <span className={styles.claimType}>{claim.triggerEvent?.type || 'Event'}</span>
                  <span className={styles.claimDate}>{new Date(claim.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                  <span className={styles.claimCity}>{claim.triggerEvent?.city} · {claim.triggerEvent?.zone}</span>
                </div>
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
        <div className={`card ${styles.empty}`}>
          <span className={styles.emptyIcon}>📋</span>
          <h3>No Claims Yet</h3>
          <p>Claims are created automatically when disruptions affect your zone. No action needed from you!</p>
        </div>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className={styles.pagination}>
          <button
            className="btn btn-secondary"
            disabled={pagination.page <= 1}
            onClick={() => loadClaims(pagination.page - 1)}
          >
            ← Previous
          </button>
          <span className={styles.pageInfo}>
            Page {pagination.page} of {pagination.totalPages}
          </span>
          <button
            className="btn btn-secondary"
            disabled={pagination.page >= pagination.totalPages}
            onClick={() => loadClaims(pagination.page + 1)}
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
}
