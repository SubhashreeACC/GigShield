'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import styles from '../admin.module.css';

export default function AdminTriggersPage() {
  const [events, setEvents] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadEvents(); }, []);

  async function loadEvents(page = 1) {
    setLoading(true);
    try {
      const res = await api.admin.getTriggerEvents(page);
      setEvents(res.data || []);
      setPagination(res.pagination || {});
    } catch {} finally { setLoading(false); }
  }

  return (
    <div>
      <h1 className={styles.title}>⚡ Trigger Events</h1>
      <p className={styles.subtitle}>Timeline of all parametric trigger events</p>

      <div className={styles.table}>
        <div className={styles.tableHeader}>
          <span>Type</span><span>City/Zone</span><span>Severity</span><span>Source</span><span>Detected At</span><span>Claims</span>
        </div>
        {loading ? (
          [1,2,3].map(i => <div key={i} className="skeleton" style={{height:'48px', borderRadius:'var(--radius-md)', margin:'var(--space-1) 0'}} />)
        ) : events.map(event => (
          <div key={event.id} className={styles.tableRow}>
            <span>
              {event.type === 'rain' ? '🌧️' : event.type === 'heat' ? '🌡️' : event.type === 'aqi' ? '💨' : '🚧'} {event.type}
            </span>
            <span>{event.city} / {event.zone}</span>
            <span><span className={`badge ${event.severity === 'critical' ? 'badge-danger' : 'badge-warning'}`}>{event.severity}</span></span>
            <span>{event.source}</span>
            <span>{new Date(event.detectedAt).toLocaleString('en-IN')}</span>
            <span>{event._count?.claims || 0}</span>
          </div>
        ))}
      </div>

      {pagination.totalPages > 1 && (
        <div className={styles.pagination}>
          <button className="btn btn-secondary" disabled={pagination.page <= 1} onClick={() => loadEvents(pagination.page - 1)}>← Prev</button>
          <span className={styles.pageInfo}>Page {pagination.page} of {pagination.totalPages}</span>
          <button className="btn btn-secondary" disabled={pagination.page >= pagination.totalPages} onClick={() => loadEvents(pagination.page + 1)}>Next →</button>
        </div>
      )}
    </div>
  );
}
