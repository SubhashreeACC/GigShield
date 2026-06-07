'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { getAdminSession, adminLogout } from '@/lib/auth';
import styles from './layout.module.css';

export default function AdminLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Skip auth check on the login page itself
    if (pathname === '/admin/login') {
      setLoading(false);
      return;
    }

    const session = getAdminSession();
    if (!session) {
      router.push('/admin/login');
      return;
    }
    setAdmin(session);
    setLoading(false);
  }, [pathname, router]);

  // Show login page without sidebar
  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  if (loading) {
    return (
      <div className={styles.adminLayout}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', minHeight: '100vh' }}>
          <div className="skeleton" style={{ width: '200px', height: '24px', borderRadius: 'var(--radius-md)' }} />
        </div>
      </div>
    );
  }

  if (!admin) {
    return null; // Will redirect
  }

  function handleLogout() {
    adminLogout();
    router.push('/admin/login');
  }

  return (
    <div className={styles.adminLayout}>
      <aside className={styles.sidebar} id="admin-sidebar">
        <div className={styles.sidebarHeader}>
          <span className={styles.sidebarLogo}>🛡️</span>
          <span className={styles.sidebarTitle}>Admin</span>
        </div>
        <nav className={styles.sidebarNav}>
          <Link href="/admin" className={`${styles.navItem} ${pathname === '/admin' ? styles.navItemActive : ''}`} id="admin-nav-overview">📊 Overview</Link>
          <Link href="/admin/users" className={`${styles.navItem} ${pathname === '/admin/users' ? styles.navItemActive : ''}`} id="admin-nav-users">👥 Users</Link>
          <Link href="/admin/claims" className={`${styles.navItem} ${pathname === '/admin/claims' ? styles.navItemActive : ''}`} id="admin-nav-claims">📋 Claims</Link>
          <Link href="/admin/fraud" className={`${styles.navItem} ${pathname === '/admin/fraud' ? styles.navItemActive : ''}`} id="admin-nav-fraud">🚨 Fraud Alerts</Link>
          <Link href="/admin/triggers" className={`${styles.navItem} ${pathname === '/admin/triggers' ? styles.navItemActive : ''}`} id="admin-nav-triggers">⚡ Trigger Events</Link>
        </nav>
        <div className={styles.sidebarFooter}>
          <div className={styles.adminInfo}>
            <span className={styles.adminName}>{admin.name}</span>
            <span className={styles.adminEmail}>{admin.email}</span>
          </div>
          <button className={styles.logoutBtn} onClick={handleLogout} id="admin-logout-btn">
            🚪 Logout
          </button>
          <Link href="/" className={styles.navItem}>← Back to App</Link>
        </div>
      </aside>
      <main className={styles.content}>
        {children}
      </main>
    </div>
  );
}
