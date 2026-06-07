'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './BottomNav.module.css';

export default function BottomNav() {
  const pathname = usePathname();

  const tabs = [
    { href: '/dashboard', label: 'Dashboard', icon: '📊' },
    { href: '/coverage', label: 'Coverage', icon: '🛡️' },
    { href: '/claims', label: 'Claims', icon: '📋' },
    { href: '/profile', label: 'Profile', icon: '👤' },
  ];

  // Hide on landing page, admin pages, auth pages, and registration
  const hiddenPaths = ['/', '/admin', '/sign-in', '/onboarding', '/register'];
  const isHidden = hiddenPaths.some((p) =>
    p === '/' ? pathname === '/' : pathname?.startsWith(p)
  );

  if (isHidden) {
    return null;
  }

  return (
    <nav className={styles.bottomNav} id="bottom-nav">
      {tabs.map((tab) => (
        <Link
          key={tab.href}
          href={tab.href}
          className={`${styles.tab} ${pathname === tab.href ? styles.active : ''}`}
          id={`bottom-nav-${tab.label.toLowerCase()}`}
        >
          <span className={styles.icon}>{tab.icon}</span>
          <span className={styles.label}>{tab.label}</span>
          {pathname === tab.href && <span className={styles.indicator} />}
        </Link>
      ))}
    </nav>
  );
}
