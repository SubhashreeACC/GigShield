'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import styles from '../admin.module.css';

export default function AdminFraudPage() {
  const [alerts, setAlerts] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadAlerts(); }, []);

  async function loadAlerts(page = 1) {
    setLoading(true);
    try {
      const res = await api.admin.getFraudAlerts(page);
      setAlerts(res.data || []);
      setPagination(res.pagination || {});
    } catch {} finally { setLoading(false); }
  }

  async function handleApprove(id) {
    try { await api.admin.approveClaim(id); loadAlerts(pagination.page); } catch (e) { alert(e.message); }
  }

  async function handleReject(id) {
    try { await api.admin.rejectClaim(id); loadAlerts(pagination.page); } catch (e) { alert(e.message); }
  }

  return (
    <div>
      <h1 className={styles.title}>🚨 Fraud Alerts</h1>
      <p className={styles.subtitle}>Claims with fraud score between 30%–70% requiring manual review</p>

      {loading ? (
        [1,2,3].map(i => <div key={i} className="skeleton" style={{height:'120px', borderRadius:'var(--radius-lg)', margin:'var(--space-3) 0'}} />)
      ) : alerts.length > 0 ? (
        <div className={styles.alertList}>
          {alerts.map(alert => (
            <div key={alert.id} className={`card ${styles.alertCard}`} id={`fraud-alert-${alert.id}`}>
              <div className={styles.alertHeader}>
                <div>
                  <strong>{alert.user?.name || alert.user?.phone}</strong>
                  <span className={styles.muted}> · {alert.user?.city}/{alert.user?.zone}</span>
                </div>
                <span className="badge badge-warning">{(alert.fraudScore * 100).toFixed(0)}% risk</span>
              </div>
              <div className={styles.alertBody}>
                <span>Trigger: {alert.triggerEvent?.type} · Amount: ₹{alert.amount}</span>
              </div>
              {alert.fraudChecks?.length > 0 && (
                <div className={styles.checks}>
                  {alert.fraudChecks.map((check, i) => (
                    <span key={i} className={`badge ${check.passed ? 'badge-success' : 'badge-danger'}`}>
                      {check.checkType}: {check.passed ? 'Pass' : 'Fail'}
                    </span>
                  ))}
                </div>
              )}
              <div className={styles.alertActions}>
                <button className="btn btn-primary" onClick={() => handleApprove(alert.id)} style={{flex:1}}>✅ Approve</button>
                <button className="btn btn-danger" onClick={() => handleReject(alert.id)} style={{flex:1}}>❌ Reject</button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card" style={{textAlign:'center', padding:'var(--space-10)'}}>
          <p>No fraud alerts to review 🎉</p>
        </div>
      )}
    </div>
  );
}
