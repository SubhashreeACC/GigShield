'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from './page.module.css';
import { getCurrentUser } from '@/lib/auth';

const SITUATIONS = [
  { id: 'rain', icon: '🌧️', label: 'Heavy Rainfall', desc: 'Heavy rain making roads unsafe for delivery' },
  { id: 'heat', icon: '🌡️', label: 'Extreme Heat', desc: 'Temperature above 42°C causing health risks' },
  { id: 'aqi', icon: '💨', label: 'Poor Air Quality', desc: 'AQI above 300 making outdoor work hazardous' },
  { id: 'flood', icon: '🌊', label: 'Flooding', desc: 'Water logging or flooding in delivery zone' },
  { id: 'storm', icon: '⛈️', label: 'Storm/Cyclone', desc: 'Severe storm or cyclone warning' },
  { id: 'curfew', icon: '🚧', label: 'Curfew/Bandh', desc: 'Government-imposed curfew or bandh' },
];

const SEVERITY_LEVELS = [
  { id: 'low', label: '😐 Low', desc: 'Slight disruption, some deliveries affected' },
  { id: 'medium', label: '😟 Medium', desc: 'Significant disruption, most deliveries affected' },
  { id: 'high', label: '😱 Severe', desc: 'Complete shutdown, no deliveries possible' },
];

function calculateEligibleAmount(requestedAmount, severity) {
  const req = parseInt(requestedAmount) || 0;
  const severityMultiplier = { low: 0.5, medium: 0.8, high: 1.0 };
  const multiplier = severityMultiplier[severity] || 0.8;
  return Math.round(req * multiplier);
}

export default function NewClaimPage() {
  const router = useRouter();
  const [step, setStep] = useState(1); // 1: Situation, 2: Details, 3: Review
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const [situation, setSituation] = useState('');
  const [severity, setSeverity] = useState('');
  const [problemDescription, setProblemDescription] = useState('');
  const [damageDetails, setDamageDetails] = useState('');
  const [amountRequested, setAmountRequested] = useState('');
  const [city, setCity] = useState('');
  const [zone, setZone] = useState('');
  const [dateOccurred, setDateOccurred] = useState(new Date().toISOString().split('T')[0]);

  const estimatedAmount = calculateEligibleAmount(amountRequested, severity);

  function handleNextStep() {
    setError('');
    if (step === 1) {
      if (!situation) { setError('Please select a disruption type'); return; }
      setStep(2);
    } else if (step === 2) {
      if (!severity) { setError('Please select severity level'); return; }
      if (!problemDescription.trim()) { setError('Please describe the problem'); return; }
      if (!damageDetails.trim()) { setError('Please provide damage or loss details'); return; }
      if (!amountRequested || parseInt(amountRequested) < 1) { setError('Please enter requested amount'); return; }
      if (!city.trim()) { setError('Please enter your city'); return; }
      setStep(3);
    }
  }

  async function handleSubmit() {
    setLoading(true);
    setError('');

    try {
      // Store claim in localStorage
      const user = getCurrentUser();
      const claimData = {
        id: `claim_${Date.now()}`,
        userId: user?.id || 'anonymous',
        userName: user?.name || 'Unknown',
        situation,
        severity,
        description: problemDescription,
        damageDetails,
        amountRequested: parseInt(amountRequested),
        city,
        zone,
        dateOccurred,
        estimatedAmount,
        status: 'pending',
        createdAt: new Date().toISOString(),
      };

      const existingClaims = JSON.parse(localStorage.getItem('gs_claims') || '[]');
      existingClaims.push(claimData);
      localStorage.setItem('gs_claims', JSON.stringify(existingClaims));

      await new Promise(r => setTimeout(r, 1000));
      setSubmitted(true);
    } catch (err) {
      setError(err.message || 'Failed to submit claim');
    } finally {
      setLoading(false);
    }
  }

  if (submitted) {
    return (
      <div className={styles.page}>
        <div className={`card ${styles.success}`}>
          <span className={styles.successIcon}>🎉</span>
          <h2 className={styles.successTitle}>Claim Submitted!</h2>
          <p className={styles.successText}>
            Your claim for ₹{estimatedAmount} has been submitted for admin review.
            You&apos;ll receive a notification once it&apos;s approved.
          </p>
          <div className={styles.successActions}>
            <Link href="/claims" className="btn btn-primary">View My Claims</Link>
            <Link href="/dashboard" className="btn btn-secondary">Go to Dashboard</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <Link href="/claims" className={styles.backLink}>← Back to Claims</Link>
        <h1 className={styles.title}>New Claim Application</h1>
        <p className={styles.subtitle}>Tell us about the disruption you faced</p>
      </div>

      {/* Step Indicator */}
      <div className={styles.stepIndicator}>
        <div className={`${styles.step} ${step >= 1 ? styles.stepActive : ''} ${step > 1 ? styles.stepCompleted : ''}`}>
          <span className={styles.stepNumber}>{step > 1 ? '✓' : '1'}</span>
          <span>Situation</span>
        </div>
        <div className={`${styles.stepLine} ${step > 1 ? styles.stepLineActive : ''}`} />
        <div className={`${styles.step} ${step >= 2 ? styles.stepActive : ''} ${step > 2 ? styles.stepCompleted : ''}`}>
          <span className={styles.stepNumber}>{step > 2 ? '✓' : '2'}</span>
          <span>Details</span>
        </div>
        <div className={`${styles.stepLine} ${step > 2 ? styles.stepLineActive : ''}`} />
        <div className={`${styles.step} ${step >= 3 ? styles.stepActive : ''}`}>
          <span className={styles.stepNumber}>3</span>
          <span>Review</span>
        </div>
      </div>

      {/* Step 1: Situation */}
      {step === 1 && (
        <div className={`card ${styles.formCard}`}>
          <h2 className={styles.formTitle}>What happened?</h2>
          <p className={styles.formSubtitle}>Select the type of disruption you experienced</p>

          <div className={styles.situationGrid}>
            {SITUATIONS.map(s => (
              <button
                key={s.id}
                className={`${styles.situationBtn} ${situation === s.id ? styles.situationBtnActive : ''}`}
                onClick={() => setSituation(s.id)}
                type="button"
              >
                <span className={styles.situationIcon}>{s.icon}</span>
                <span className={styles.situationLabel}>{s.label}</span>
              </button>
            ))}
          </div>

          {error && <p className={styles.error}>{error}</p>}

          <div className={styles.actions}>
            <Link href="/claims" className="btn btn-secondary">Cancel</Link>
            <button className="btn btn-primary" onClick={handleNextStep}>
              Continue →
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Details */}
      {step === 2 && (
        <div className={`card ${styles.formCard}`}>
          <h2 className={styles.formTitle}>Tell us more</h2>
          <p className={styles.formSubtitle}>
            Help us understand the severity and impact — this helps estimate your recovery amount
          </p>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>How severe was it?</label>
            <div className={styles.severityGrid}>
              {SEVERITY_LEVELS.map(s => (
                <button
                  key={s.id}
                  className={`${styles.severityBtn} ${severity === s.id ? styles.severityBtnActive : ''}`}
                  onClick={() => setSeverity(s.id)}
                  type="button"
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="problemDescription" className={styles.formLabel}>
              Problem Description
            </label>
            <textarea
              id="problemDescription"
              className={styles.textarea}
              placeholder="E.g., Heavy rain started at 2 PM, roads were flooded..."
              value={problemDescription}
              onChange={(e) => setProblemDescription(e.target.value)}
              rows={3}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="damageDetails" className={styles.formLabel}>
              Damage or Loss Details
            </label>
            <textarea
              id="damageDetails"
              className={styles.textarea}
              placeholder="E.g., Could not deliver 5 orders, resulting in a loss of..."
              value={damageDetails}
              onChange={(e) => setDamageDetails(e.target.value)}
              rows={3}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="amountRequested" className={styles.formLabel}>Amount Requested (₹)</label>
            <input
              id="amountRequested"
              type="number"
              className="input"
              placeholder="e.g., 500"
              value={amountRequested}
              onChange={(e) => setAmountRequested(e.target.value)}
              min="1"
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
            <div className={styles.formGroup}>
              <label htmlFor="city" className={styles.formLabel}>City</label>
              <input
                id="city"
                type="text"
                className="input"
                placeholder="e.g., Mumbai"
                value={city}
                onChange={(e) => setCity(e.target.value)}
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="zone" className={styles.formLabel}>Zone / Area</label>
              <input
                id="zone"
                type="text"
                className="input"
                placeholder="e.g., Andheri West"
                value={zone}
                onChange={(e) => setZone(e.target.value)}
              />
            </div>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="date" className={styles.formLabel}>Date of Disruption</label>
            <input
              id="date"
              type="date"
              className="input"
              value={dateOccurred}
              onChange={(e) => setDateOccurred(e.target.value)}
            />
          </div>

          {error && <p className={styles.error}>{error}</p>}

          <div className={styles.actions}>
            <button className="btn btn-secondary" onClick={() => setStep(1)}>← Back</button>
            <button className="btn btn-primary" onClick={handleNextStep}>Continue →</button>
          </div>
        </div>
      )}

      {/* Step 3: Review & Estimate */}
      {step === 3 && (
        <div className={`card ${styles.formCard}`}>
          <h2 className={styles.formTitle}>Review & Submit</h2>
          <p className={styles.formSubtitle}>Verify your details and submit for admin approval</p>

          {/* Estimate Card */}
          <div className={styles.estimateCard}>
            <p className={styles.estimateLabel}>Estimated Loss Recovery</p>
            <p className={styles.estimateAmount}>₹{estimatedAmount}</p>
            <p className={styles.estimateNote}>Final amount subject to admin review and verification</p>
          </div>

          {/* Summary */}
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Disruption Type</label>
            <p style={{ margin: 0, fontWeight: 'var(--weight-medium)' }}>
              {SITUATIONS.find(s => s.id === situation)?.icon} {SITUATIONS.find(s => s.id === situation)?.label}
            </p>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Severity</label>
            <p style={{ margin: 0 }}>
              {SEVERITY_LEVELS.find(s => s.id === severity)?.label}
            </p>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Problem Description</label>
            <p style={{ margin: 0, color: 'var(--color-text-secondary)', fontSize: 'var(--text-sm)' }}>
              {problemDescription}
            </p>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Damage/Loss Details</label>
            <p style={{ margin: 0, color: 'var(--color-text-secondary)', fontSize: 'var(--text-sm)' }}>
              {damageDetails}
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 'var(--space-3)', marginBottom: 'var(--space-4)' }}>
            <div>
              <label className={styles.formLabel}>Requested</label>
              <p style={{ margin: 0, fontWeight: 'var(--weight-medium)' }}>₹{amountRequested}</p>
            </div>
            <div>
              <label className={styles.formLabel}>Location</label>
              <p style={{ margin: 0, fontWeight: 'var(--weight-medium)' }}>{city}{zone ? `, ${zone}` : ''}</p>
            </div>
            <div>
              <label className={styles.formLabel}>Date</label>
              <p style={{ margin: 0, fontWeight: 'var(--weight-medium)' }}>{new Date(dateOccurred).toLocaleDateString('en-IN')}</p>
            </div>
          </div>

          {error && <p className={styles.error}>{error}</p>}

          <div className={styles.actions}>
            <button className="btn btn-secondary" onClick={() => setStep(2)}>← Back</button>
            <button className="btn btn-primary" onClick={handleSubmit} disabled={loading}>
              {loading ? 'Submitting...' : 'Submit Claim'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
