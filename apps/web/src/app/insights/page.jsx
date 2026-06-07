'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import styles from './page.module.css';

export default function InsightsPage() {
  const [user, setUser] = useState(null);
  const [triggers, setTriggers] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const meRes = await api.getMe();
        setUser(meRes.data);
        try {
          const trigRes = await api.getTriggerStatus();
          setTriggers(trigRes.data);
        } catch {}
      } catch {} finally { setLoading(false); }
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="container">
        {[1, 2, 3].map(i => (
          <div key={i} className="skeleton" style={{ height: '160px', borderRadius: 'var(--radius-lg)', marginBottom: 'var(--space-4)' }} />
        ))}
      </div>
    );
  }

  const riskColors = { low: '#00D084', medium: '#FF8A00', high: '#EF4444' };
  const riskLevel = user?.riskLevel || 'medium';

  return (
    <div className="container">
      <h1 className={styles.title}>Insights</h1>

      {/* Risk Score */}
      <div className={`card ${styles.riskCard}`} id="risk-score-card">
        <h2 className={styles.sectionTitle}>Your Risk Score</h2>
        <div className={styles.riskDisplay}>
          <div className={styles.riskCircle} style={{ borderColor: riskColors[riskLevel] }}>
            <span className={styles.riskValue}>{((user?.riskScore || 0.5) * 100).toFixed(0)}</span>
            <span className={styles.riskLabel}>/ 100</span>
          </div>
          <div className={styles.riskInfo}>
            <span className={`badge ${
              riskLevel === 'low' ? 'badge-success' :
              riskLevel === 'medium' ? 'badge-warning' : 'badge-danger'
            }`} style={{ fontSize: 'var(--text-body)', padding: 'var(--space-2) var(--space-5)' }}>
              {riskLevel?.toUpperCase()} RISK
            </span>
            <p className={styles.riskDesc}>
              {riskLevel === 'low' ? 'Your area has minimal disruption risk this season.' :
               riskLevel === 'medium' ? 'Moderate risk of weather disruptions in your zone.' :
               'High risk — frequent disruptions expected. You\'re covered!'}
            </p>
          </div>
        </div>
      </div>

      {/* Weather Forecast Impact */}
      <div className={`card ${styles.weatherCard}`} id="weather-impact">
        <h2 className={styles.sectionTitle}>Current Conditions</h2>
        {triggers ? (
          <div className={styles.conditionsGrid}>
            <div className={styles.conditionItem}>
              <span className={styles.conditionIcon}>🌡️</span>
              <span className={styles.conditionValue}>{triggers.weather?.temp?.toFixed(1) || '--'}°C</span>
              <span className={styles.conditionLabel}>Temperature</span>
            </div>
            <div className={styles.conditionItem}>
              <span className={styles.conditionIcon}>🌧️</span>
              <span className={styles.conditionValue}>{triggers.weather?.rainfall?.toFixed(1) || '0'} mm</span>
              <span className={styles.conditionLabel}>Rainfall</span>
            </div>
            <div className={styles.conditionItem}>
              <span className={styles.conditionIcon}>💨</span>
              <span className={styles.conditionValue}>{triggers.aqi?.value || '--'}</span>
              <span className={styles.conditionLabel}>AQI</span>
            </div>
            <div className={styles.conditionItem}>
              <span className={styles.conditionIcon}>💧</span>
              <span className={styles.conditionValue}>{triggers.weather?.humidity || '--'}%</span>
              <span className={styles.conditionLabel}>Humidity</span>
            </div>
          </div>
        ) : (
          <p className={styles.noData}>Login and complete onboarding to see weather data for your zone.</p>
        )}
      </div>

      {/* Weekly Payout Trend */}
      <div className={`card ${styles.trendCard}`} id="payout-trend">
        <h2 className={styles.sectionTitle}>Weekly Payout Trend</h2>
        <div className={styles.chart}>
          {[
            { week: 'W1', payout: 500, height: 50 },
            { week: 'W2', payout: 1000, height: 100 },
            { week: 'W3', payout: 0, height: 5 },
            { week: 'W4', payout: 2000, height: 100 },
          ].map((bar, i) => (
            <div key={i} className={styles.chartBar}>
              <div className={styles.barWrapper}>
                <div
                  className={styles.barFill}
                  style={{ height: `${Math.max(bar.height, 5)}%` }}
                />
              </div>
              <span className={styles.barAmount}>₹{bar.payout}</span>
              <span className={styles.barWeek}>{bar.week}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Protection Coverage */}
      <div className={`card ${styles.coverageCard}`} id="protection-coverage">
        <h2 className={styles.sectionTitle}>Protection Coverage</h2>
        <div className={styles.coverageGrid}>
          {[
            { type: 'Rain', icon: '🌧️', covered: true, threshold: '10 mm/hr' },
            { type: 'Heat', icon: '🌡️', covered: true, threshold: '42°C' },
            { type: 'AQI', icon: '💨', covered: user?.activeSubscription?.plan?.name !== 'Basic', threshold: 'AQI 300' },
            { type: 'Traffic', icon: '🚧', covered: user?.activeSubscription?.plan?.name === 'Pro', threshold: 'Zone shutdown' },
          ].map((item, i) => (
            <div key={i} className={styles.coverageItem}>
              <span className={styles.coverageIcon}>{item.icon}</span>
              <div className={styles.coverageInfo}>
                <span className={styles.coverageType}>{item.type}</span>
                <span className={styles.coverageThreshold}>{item.threshold}</span>
              </div>
              <span className={`badge ${item.covered ? 'badge-success' : 'badge-info'}`}>
                {item.covered ? 'Covered' : 'Upgrade'}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
