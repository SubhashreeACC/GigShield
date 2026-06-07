'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import styles from '../admin.module.css';

export default function AdminClaimsPage() {
  const [claims, setClaims] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function fetchClaims() {
      setLoading(true);
      try {
        const res = await api.admin.getClaims(1, statusFilter);
        if (!cancelled) { setClaims(res.data || []); setPagination(res.pagination || {}); }
      } catch {} finally { if (!cancelled) setLoading(false); }
    }
    fetchClaims();
    return () => { cancelled = true; };
  }, [statusFilter]);

  async function loadClaims(page = 1) {
    setLoading(true);
    try {
      const res = await api.admin.getClaims(page, statusFilter);
      setClaims(res.data || []);
      setPagination(res.pagination || {});
    } catch {} finally { setLoading(false); }
  }

  async function handleApprove(id) {
    try { await api.admin.approveClaim(id); loadClaims(pagination.page); } catch (e) { alert(e.message); }
  }

  async function handleReject(id) {
    try { await api.admin.rejectClaim(id); loadClaims(pagination.page); } catch (e) { alert(e.message); }
  }

  return (
    <div>
      <h1 className={styles.title}>Claims Management</h1>
      <div className={styles.toolbar}>
        <div className={styles.filters}>
          {['', 'pending', 'approved', 'paid', 'rejected'].map(s => (
            <button key={s || 'all'} className={`${styles.filterBtn} ${statusFilter === s ? styles.filterActive : ''}`}
              onClick={() => setStatusFilter(s)}>{s ? s.charAt(0).toUpperCase() + s.slice(1) : 'All'}</button>
          ))}
        </div>
        <span className={styles.count}>{pagination.total || 0} claims</span>
      </div>

      <div className={styles.table}>
        <div className={styles.tableHeader}>
          <span>User</span><span>Trigger</span><span>Amount</span><span>Fraud</span><span>Status</span><span>Actions</span>
        </div>
        {loading ? (
          [1,2,3].map(i => <div key={i} className="skeleton" style={{height:'48px', borderRadius:'var(--radius-md)', margin:'var(--space-1) 0'}} />)
        ) : claims.map(claim => (
          <div key={claim.id} className={styles.tableRow}>
            <span>{claim.user?.name || claim.user?.phone || '—'}</span>
            <span>{claim.triggerEvent?.type || '—'}</span>
            <span>₹{claim.amount}</span>
            <span>{claim.fraudScore != null ? `${(claim.fraudScore * 100).toFixed(0)}%` : '—'}</span>
            <span><span className={`badge ${
              claim.status === 'paid' ? 'badge-success' : claim.status === 'approved' ? 'badge-info' :
              claim.status === 'rejected' ? 'badge-danger' : 'badge-warning'
            }`}>{claim.status}</span></span>
            <span className={styles.actions}>
              {claim.status === 'pending' && (
                <>
                  <button className={styles.actionBtn} onClick={() => handleApprove(claim.id)} title="Approve">✅</button>
                  <button className={styles.actionBtn} onClick={() => handleReject(claim.id)} title="Reject">❌</button>
                </>
              )}
            </span>
          </div>
        ))}
      </div>

      {pagination.totalPages > 1 && (
        <div className={styles.pagination}>
          <button className="btn btn-secondary" disabled={pagination.page <= 1} onClick={() => loadClaims(pagination.page - 1)}>← Prev</button>
          <span className={styles.pageInfo}>Page {pagination.page} of {pagination.totalPages}</span>
          <button className="btn btn-secondary" disabled={pagination.page >= pagination.totalPages} onClick={() => loadClaims(pagination.page + 1)}>Next →</button>
        </div>
      )}
    </div>
  );
}
