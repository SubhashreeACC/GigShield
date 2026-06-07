'use client';

import Link from 'next/link';
import styles from './page.module.css';

export default function PricingPage() {
  return (
    <div className={styles.landing}>
      {/* Plans Preview */}
      <section className={styles.plansSection} id="plans">
        <div className="container">
          <div className={styles.sectionHeader}>
            <span className={styles.sectionTag}>Affordable Plans</span>
            <h1 className={styles.sectionTitle}>Choose Your Protection Level</h1>
            <p className={styles.sectionSubtitle}>
              Starting at just ₹29 per week — less than a cup of chai per day.
            </p>
          </div>

          <div className={styles.plansGrid}>
            <div className={`card ${styles.planCard}`}>
              <h3 className={styles.planName}>Basic</h3>
              <div className={styles.planPrice}>
                <span className={styles.planAmount}>₹29</span>
                <span className={styles.planPeriod}>/week</span>
              </div>
              <p className={styles.planCoverage}>₹500 coverage</p>
              <ul className={styles.planFeatures}>
                <li>Rain protection</li>
                <li>Basic alerts</li>
                <li>Weekly payouts</li>
              </ul>
              <Link href="/register" className="btn btn-secondary" style={{width: '100%', marginTop: 'var(--space-4)'}}>Select Basic</Link>
            </div>

            <div className={`card ${styles.planCard} ${styles.planCardPopular}`}>
              <span className={styles.popularBadge}>Most Popular</span>
              <h3 className={styles.planName}>Standard</h3>
              <div className={styles.planPrice}>
                <span className={styles.planAmount}>₹59</span>
                <span className={styles.planPeriod}>/week</span>
              </div>
              <p className={styles.planCoverage}>₹1000 coverage</p>
              <ul className={styles.planFeatures}>
                <li>Rain + Heat protection</li>
                <li>Real-time alerts</li>
                <li>Priority payouts</li>
                <li>Risk insights</li>
              </ul>
              <Link href="/register" className="btn btn-primary" style={{width: '100%', marginTop: 'var(--space-4)'}}>Select Standard</Link>
            </div>

            <div className={`card ${styles.planCard}`}>
              <h3 className={styles.planName}>Pro</h3>
              <div className={styles.planPrice}>
                <span className={styles.planAmount}>₹99</span>
                <span className={styles.planPeriod}>/week</span>
              </div>
              <p className={styles.planCoverage}>₹2000 coverage</p>
              <ul className={styles.planFeatures}>
                <li>All disruption types</li>
                <li>Instant payouts</li>
                <li>Advanced analytics</li>
                <li>Priority support</li>
              </ul>
              <Link href="/register" className="btn btn-secondary" style={{width: '100%', marginTop: 'var(--space-4)'}}>Select Pro</Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
