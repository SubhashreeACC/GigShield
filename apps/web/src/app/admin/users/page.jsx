'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import styles from '../admin.module.css';

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function fetchUsers() {
      setLoading(true);
      try {
        const res = await api.admin.getUsers(1, search);
        if (!cancelled) { setUsers(res.data || []); setPagination(res.pagination || {}); }
      } catch {} finally { if (!cancelled) setLoading(false); }
    }
    fetchUsers();
    return () => { cancelled = true; };
  }, [search]);

  async function loadUsers(page = 1) {
    setLoading(true);
    try {
      const res = await api.admin.getUsers(page, search);
      setUsers(res.data || []);
      setPagination(res.pagination || {});
    } catch {} finally { setLoading(false); }
  }

  return (
    <div>
      <h1 className={styles.title}>Users</h1>
      <div className={styles.toolbar}>
        <input className="input" placeholder="Search by name, phone, or city..." value={search}
          onChange={e => setSearch(e.target.value)} onKeyDown={e => e.key === 'Enter' && loadUsers()}
          style={{ maxWidth: '400px' }} id="admin-user-search" />
        <span className={styles.count}>{pagination.total || 0} users</span>
      </div>

      <div className={styles.table}>
        <div className={styles.tableHeader}>
          <span>Name</span><span>Phone</span><span>Platform</span><span>City/Zone</span><span>Plan</span><span>Claims</span>
        </div>
        {loading ? (
          [1,2,3].map(i => <div key={i} className="skeleton" style={{height:'48px', borderRadius:'var(--radius-md)', margin:'var(--space-1) 0'}} />)
        ) : users.map(user => (
          <div key={user.id} className={styles.tableRow} id={`admin-user-${user.id}`}>
            <span className={styles.cellName}>{user.name || '—'}</span>
            <span>{user.phone}</span>
            <span>{user.platform || '—'}</span>
            <span>{user.city || '—'} / {user.zone || '—'}</span>
            <span>{user.subscriptions?.[0]?.plan?.name || <em className={styles.muted}>None</em>}</span>
            <span>{user._count?.claims || 0}</span>
          </div>
        ))}
      </div>

      {pagination.totalPages > 1 && (
        <div className={styles.pagination}>
          <button className="btn btn-secondary" disabled={pagination.page <= 1} onClick={() => loadUsers(pagination.page - 1)}>← Prev</button>
          <span className={styles.pageInfo}>Page {pagination.page} of {pagination.totalPages}</span>
          <button className="btn btn-secondary" disabled={pagination.page >= pagination.totalPages} onClick={() => loadUsers(pagination.page + 1)}>Next →</button>
        </div>
      )}
    </div>
  );
}
