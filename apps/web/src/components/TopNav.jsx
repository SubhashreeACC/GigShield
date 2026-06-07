'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './TopNav.module.css';

export default function TopNav() {
  const pathname = usePathname();

  // Only show TopNav on authenticated/app routes (not landing, admin, auth pages)
  const publicPaths = ['/', '/admin', '/sign-in', '/register', '/onboarding'];
  const isPublicPage = publicPaths.some((p) =>
    p === '/' ? pathname === '/' : pathname?.startsWith(p)
  );

  if (isPublicPage) {
    return null;
  }

  const links = [
    { href: '/dashboard', label: 'Dashboard', icon: '📊' },
    { href: '/pricing', label: 'Pricing', icon: '💳' },
    { href: '/coverage', label: 'Coverage', icon: '🛡️' },
    { href: '/claims', label: 'Claims', icon: '📋' },
    { href: '/insights', label: 'Insights', icon: '📈' },
    { href: '/profile', label: 'Profile', icon: '👤' },
  ];

  return (
    <nav className={styles.nav} id="top-nav">
      <div className={styles.container}>
        <Link href="/dashboard" className={styles.logo} id="nav-logo">
          <span className={styles.logoIcon}>🛡️</span>
          <span className={styles.logoText}>GigShield</span>
        </Link>

        <div className={styles.links}>
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`${styles.link} ${pathname === link.href ? styles.active : ''}`}
              id={`nav-link-${link.label.toLowerCase()}`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className={styles.actions}>
          <Link href="/sign-in" className={`${styles.actionBtn} ${styles.loginBtn}`} id="nav-login-btn">
            Sign In
          </Link>
          <Link href="/register" className="btn btn-primary" id="nav-register-btn">
            Sign Up
          </Link>
        </div>
      </div>
    </nav>
  );
}
