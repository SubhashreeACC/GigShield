'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import styles from './page.module.css';

export default function HomePage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={styles.landing}>
      {/* Landing Top Bar */}
      <header className={styles.landingHeader}>
        <div className={styles.landingHeaderInner}>
          <Link href="/" className={styles.landingLogo} id="landing-logo">
            <span className={styles.landingLogoIcon}>🛡️</span>
            <span className={styles.landingLogoText}>GigShield</span>
          </Link>

          <div className={styles.headerRight}>
            <Link href="/sign-in" className={styles.headerSignIn} id="landing-signin-btn">
              Sign In
            </Link>
            <Link href="/register" className={`btn btn-primary ${styles.headerSignUp}`} id="landing-signup-btn">
              Sign Up
            </Link>

            {/* Dropdown Menu */}
            <div className={styles.dropdownWrapper} ref={menuRef}>
              <button
                className={styles.menuToggle}
                onClick={() => setMenuOpen((prev) => !prev)}
                aria-label="Menu"
                aria-expanded={menuOpen}
                id="landing-menu-toggle"
              >
                <span className={styles.menuDots}>⋮</span>
              </button>
              {menuOpen && (
                <div className={styles.dropdownMenu} id="landing-dropdown-menu">
                  <Link href="#contact" className={styles.dropdownItem} onClick={() => setMenuOpen(false)}>
                    <span className={styles.dropdownIcon}>📧</span>
                    Contact Us
                  </Link>
                  <Link href="#ai-helpline" className={styles.dropdownItem} onClick={() => setMenuOpen(false)}>
                    <span className={styles.dropdownIcon}>🤖</span>
                    AI Helpline
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className={styles.hero}>
        <div className="container">
          <div className={styles.heroContent}>
            <div className={styles.heroBadge}>
              <span className={styles.heroBadgeIcon}>⚡</span>
              AI-Powered Protection
            </div>
            <h1 className={styles.heroTitle}>
              Shield Your Gig Earnings <br />
              <span className={styles.heroAccent}>Against All Odds</span>
            </h1>
            <p className={styles.heroSubtitle}>
              GigShield is the ultimate safety net for your gig delivery hustle. 
              We automatically detect weather and environmental disruptions to ensure you never lose out on your hard-earned money. 
            </p>

          </div>

          {/* Hero Stats */}
          <div className={styles.heroStats}>
            <div className={styles.stat}>
              <span className={styles.statValue}>₹500–₹2000</span>
              <span className={styles.statLabel}>Weekly Coverage</span>
            </div>
            <div className={styles.stat}>
              <span className={styles.statValue}>&lt;15 min</span>
              <span className={styles.statLabel}>Payout Speed</span>
            </div>
            <div className={styles.stat}>
              <span className={styles.statValue}>0 Claims</span>
              <span className={styles.statLabel}>To File</span>
            </div>
            <div className={styles.stat}>
              <span className={styles.statValue}>24/7</span>
              <span className={styles.statLabel}>AI Monitoring</span>
            </div>
          </div>
        </div>
      </section>

      {/* What We Are Section */}
      <section className={styles.aboutSection} id="about">
        <div className="container">
          <div className={styles.sectionHeader}>
            <span className={styles.sectionTag}>Who We Are</span>
            <h2 className={styles.sectionTitle}>
              Built for the Backbone of India&apos;s Delivery Economy
            </h2>
            <p className={styles.sectionSubtitle}>
              GigShield understands the unique challenges faced by gig workers. 
              We use cutting-edge AI to monitor weather conditions and automatically protect your earnings.
            </p>
          </div>

          <div className={styles.aboutGrid}>
            <div className={styles.aboutCard}>
              <span className={styles.aboutIcon}>🤖</span>
              <h3 className={styles.aboutTitle}>AI-Powered Detection</h3>
              <p className={styles.aboutDesc}>
                Our AI continuously monitors weather, air quality, and disruption events in your delivery zone — so you don&apos;t have to.
              </p>
            </div>
            <div className={styles.aboutCard}>
              <span className={styles.aboutIcon}>⚡</span>
              <h3 className={styles.aboutTitle}>Instant Payouts</h3>
              <p className={styles.aboutDesc}>
                When disruptions hit, claims are auto-generated and payouts land in your wallet within minutes. Zero paperwork.
              </p>
            </div>
            <div className={styles.aboutCard}>
              <span className={styles.aboutIcon}>🛡️</span>
              <h3 className={styles.aboutTitle}>Parametric Insurance</h3>
              <p className={styles.aboutDesc}>
                No complex claims process. If the weather triggers a threshold breach, you get paid automatically. Period.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* What We Provide Section */}
      <section className={styles.featuresSection} id="features">
        <div className="container">
          <div className={styles.sectionHeader}>
            <span className={styles.sectionTag}>What We Provide</span>
            <h2 className={styles.sectionTitle}>
              Everything You Need to Stay Protected
            </h2>
          </div>

          <div className={styles.featuresGrid}>
            <div className={`card ${styles.featureCard}`}>
              <div className={styles.featureIconWrapper} style={{ background: 'rgba(0, 208, 132, 0.1)' }}>
                <span className={styles.featureIcon}>🌧️</span>
              </div>
              <h3 className={styles.featureTitle}>Rain Protection</h3>
              <p className={styles.featureDesc}>
                Get covered when heavy rainfall makes deliveries unsafe or impossible. Automatic detection via weather APIs.
              </p>
              <span className={styles.featureTag}>Threshold: &gt;10mm/hr</span>
            </div>

            <div className={`card ${styles.featureCard}`}>
              <div className={styles.featureIconWrapper} style={{ background: 'rgba(255, 138, 0, 0.1)' }}>
                <span className={styles.featureIcon}>🌡️</span>
              </div>
              <h3 className={styles.featureTitle}>Heat Protection</h3>
              <p className={styles.featureDesc}>
                Extreme heat above 42°C triggers automatic coverage. Your health and earnings are both protected.
              </p>
              <span className={styles.featureTag}>Threshold: &gt;42°C</span>
            </div>

            <div className={`card ${styles.featureCard}`}>
              <div className={styles.featureIconWrapper} style={{ background: 'rgba(77, 166, 255, 0.1)' }}>
                <span className={styles.featureIcon}>💨</span>
              </div>
              <h3 className={styles.featureTitle}>AQI Protection</h3>
              <p className={styles.featureDesc}>
                Poor air quality (AQI &gt; 300) can be dangerous. We cover your income loss during hazardous air days.
              </p>
              <span className={styles.featureTag}>Threshold: AQI &gt;300</span>
            </div>

            <div className={`card ${styles.featureCard}`}>
              <div className={styles.featureIconWrapper} style={{ background: 'rgba(139, 92, 246, 0.1)' }}>
                <span className={styles.featureIcon}>📊</span>
              </div>
              <h3 className={styles.featureTitle}>Risk Insights</h3>
              <p className={styles.featureDesc}>
                Get personalized risk scores, zone-based analytics, and weekly protection reports delivered to your dashboard.
              </p>
              <span className={styles.featureTag}>ML-powered</span>
            </div>
          </div>
        </div>
      </section>


      {/* CTA Section */}
      <section className={styles.ctaSection}>
        <div className="container">
          <div className={styles.ctaCard}>
            <h2 className={styles.ctaTitle}>
              Don&apos;t let weather steal your earnings 🌦️
            </h2>
            <p className={styles.ctaSubtitle}>
              Join thousands of gig workers who trust GigShield to protect their income. 
              Sign up today — it takes less than 2 minutes.
            </p>
            <div className={styles.ctaButtons}>
              <Link href="/register" className="btn btn-primary" id="cta-signup-btn">
                Sign Up
              </Link>
              <Link href="/sign-in" className="btn btn-secondary" id="cta-signin-btn">
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className={styles.footer}>
        <div className="container">
          <div className={styles.footerGrid}>
            <div className={styles.footerBrand}>
              <div className={styles.footerLogo}>
                <span>🛡️</span>
                <span className={styles.footerLogoText}>GigShield</span>
              </div>
              <p className={styles.footerDesc}>
                AI-powered parametric income protection for India&apos;s gig delivery workforce.
              </p>
            </div>

            <div className={styles.footerLinks}>
              <h4 className={styles.footerHeading}>Product</h4>
              <Link href="/coverage">Coverage Plans</Link>
              <Link href="/claims">Claims</Link>
              <Link href="/insights">Insights</Link>
            </div>

            <div className={styles.footerLinks}>
              <h4 className={styles.footerHeading}>Company</h4>
              <Link href="#">About Us</Link>
              <Link href="#">Careers</Link>
              <Link href="#">Contact</Link>
            </div>

            <div className={styles.footerLinks}>
              <h4 className={styles.footerHeading}>Legal</h4>
              <Link href="#">Terms of Service</Link>
              <Link href="#">Privacy Policy</Link>
              <Link href="#">Refund Policy</Link>
            </div>
          </div>

          <div className={styles.footerBottom}>
            <p>© 2026 GigShield. All rights reserved.</p>
            <p>Made with ❤️ in India</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
