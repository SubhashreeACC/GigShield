'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import styles from './page.module.css';

const PLATFORMS = [
  { id: 'Swiggy', label: 'Swiggy', emoji: '🍔', color: '#FC8019' },
  { id: 'Zomato', label: 'Zomato', emoji: '🍕', color: '#E23744' },
  { id: 'Amazon', label: 'Amazon', emoji: '📦', color: '#FF9900' },
];

const PLANS = [
  { name: 'Basic', premium: 29, coverage: 500, features: ['Rain & heat protection', 'UPI payouts', 'Basic support'] },
  { name: 'Standard', premium: 59, coverage: 1000, recommended: true, features: ['All Basic features', 'AQI protection', 'Priority payouts', 'Weekly insights'] },
  { name: 'Pro', premium: 99, coverage: 2000, features: ['All Standard features', 'Traffic protection', 'Instant payouts', 'Premium support', 'Risk analytics'] },
];

export default function OnboardingPage() {
  const [step, setStep] = useState(1);
  const [platform, setPlatform] = useState('');
  const [city, setCity] = useState('');
  const [zone, setZone] = useState('');
  const [name, setName] = useState('');
  const [lat, setLat] = useState(null);
  const [lng, setLng] = useState(null);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [plans, setPlans] = useState([]);
  const router = useRouter();

  // Auto-detect location
  function detectLocation() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLat(pos.coords.latitude);
          setLng(pos.coords.longitude);
        },
        () => console.log('Location permission denied')
      );
    }
  }

  // Load plans from API on step 3
  async function loadPlans() {
    try {
      const res = await api.getPlans();
      if (res.data?.length) setPlans(res.data);
    } catch {}
  }

  async function handleComplete() {
    setLoading(true);
    setError('');
    try {
      // Step 1: Onboard user
      await api.onboard({ name, platform, city, zone, lat, lng });

      // Step 2: Create subscription
      const planData = plans.find(p => p.name === selectedPlan) || {};
      if (planData.id) {
        await api.createSubscription(planData.id);
      }

      router.push('/');
    } catch (err) {
      setError(err.message || 'Failed to complete onboarding');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={`container ${styles.page}`}>
      {/* Progress bar */}
      <div className={styles.progress}>
        {[1, 2, 3].map(s => (
          <div key={s} className={`${styles.progressStep} ${step >= s ? styles.progressActive : ''}`}>
            <div className={styles.progressDot}>{step > s ? '✓' : s}</div>
            <span className={styles.progressLabel}>
              {s === 1 ? 'Platform' : s === 2 ? 'Location' : 'Plan'}
            </span>
          </div>
        ))}
      </div>

      {/* Step 1: Platform Select (Task 65) */}
      {step === 1 && (
        <div className={styles.stepCard}>
          <h1 className={styles.stepTitle}>Which platform do you deliver for?</h1>
          <p className={styles.stepSubtitle}>We&apos;ll customize your protection based on your platform</p>

          <div className={styles.platformGrid}>
            {PLATFORMS.map(p => (
              <button
                key={p.id}
                className={`card card-interactive ${styles.platformCard} ${platform === p.id ? styles.platformSelected : ''}`}
                onClick={() => setPlatform(p.id)}
                id={`platform-${p.id.toLowerCase()}`}
                style={platform === p.id ? { borderColor: p.color } : {}}
              >
                <span className={styles.platformEmoji}>{p.emoji}</span>
                <span className={styles.platformLabel}>{p.label}</span>
              </button>
            ))}
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="name" className={styles.label}>Your Name</label>
            <input
              id="name"
              className="input"
              placeholder="Enter your name"
              value={name}
              onChange={e => setName(e.target.value)}
            />
          </div>

          <button
            className="btn btn-primary"
            onClick={() => { setStep(2); detectLocation(); }}
            disabled={!platform || !name}
            style={{ width: '100%' }}
            id="onboard-step1-next"
          >
            Continue
          </button>
        </div>
      )}

      {/* Step 2: Location (Task 66) */}
      {step === 2 && (
        <div className={styles.stepCard}>
          <h1 className={styles.stepTitle}>Where do you work?</h1>
          <p className={styles.stepSubtitle}>We need your city and zone to check for disruptions</p>

          {lat && lng && (
            <div className={`badge badge-success ${styles.locationDetected}`}>
              📍 Location detected
            </div>
          )}

          <div className={styles.inputGroup}>
            <label htmlFor="city" className={styles.label}>City</label>
            <select
              id="city"
              className="input"
              value={city}
              onChange={e => setCity(e.target.value)}
            >
              <option value="">Select your city</option>
              <option value="Mumbai">Mumbai</option>
              <option value="Delhi">Delhi</option>
              <option value="Bangalore">Bangalore</option>
              <option value="Chennai">Chennai</option>
              <option value="Hyderabad">Hyderabad</option>
            </select>
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="zone" className={styles.label}>Zone / Area</label>
            <input
              id="zone"
              className="input"
              placeholder="e.g., Koramangala, Andheri West"
              value={zone}
              onChange={e => setZone(e.target.value)}
            />
          </div>

          <div className={styles.buttonGroup}>
            <button className="btn btn-secondary" onClick={() => setStep(1)} id="onboard-step2-back">
              Back
            </button>
            <button
              className="btn btn-primary"
              onClick={() => { setStep(3); loadPlans(); }}
              disabled={!city || !zone}
              id="onboard-step2-next"
            >
              Continue
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Plan Selection (Task 67) */}
      {step === 3 && (
        <div className={styles.stepCard}>
          <h1 className={styles.stepTitle}>Choose your protection plan</h1>
          <p className={styles.stepSubtitle}>All plans include automatic payouts — no claims to file</p>

          <div className={styles.planGrid}>
            {PLANS.map(plan => (
              <button
                key={plan.name}
                className={`card card-plan card-interactive ${styles.planCard} ${
                  selectedPlan === plan.name ? styles.planSelected : ''
                } ${plan.recommended ? styles.planRecommended : ''}`}
                onClick={() => setSelectedPlan(plan.name)}
                id={`plan-${plan.name.toLowerCase()}`}
              >
                {plan.recommended && <span className={styles.planBadge}>⭐ Recommended</span>}
                <h3 className={styles.planName}>{plan.name}</h3>
                <div className={styles.planPrice}>
                  <span className={styles.planAmount}>₹{plan.premium}</span>
                  <span className={styles.planPeriod}>/week</span>
                </div>
                <div className={styles.planCoverage}>₹{plan.coverage} coverage</div>
                <ul className={styles.planFeatures}>
                  {plan.features.map((f, i) => (
                    <li key={i} className={styles.planFeature}>✓ {f}</li>
                  ))}
                </ul>
              </button>
            ))}
          </div>

          {error && <p className={styles.error} role="alert">{error}</p>}

          <div className={styles.buttonGroup}>
            <button className="btn btn-secondary" onClick={() => setStep(2)} id="onboard-step3-back">
              Back
            </button>
            <button
              className="btn btn-primary"
              onClick={handleComplete}
              disabled={!selectedPlan || loading}
              id="onboard-subscribe"
            >
              {loading ? 'Setting up...' : 'Subscribe Now'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
