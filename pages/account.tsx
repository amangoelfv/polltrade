import { useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useAuth } from '../context/AuthContext';
import styles from '../styles/Account.module.css';

export default function Account() {
  const router = useRouter();
  const { user, logout, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  const handleLogout = () => {
    if (confirm('Are you sure you want to logout?')) {
      logout();
      router.push('/');
    }
  };

  if (isLoading || !user) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>My Account - PollTrade</title>
        <meta name="description" content="Manage your PollTrade account" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.png" />
      </Head>

      <div className={styles.accountContainer}>
        <div className={styles.container}>
          <div className={styles.header}>
            <h1 className={styles.pageTitle}>My Account</h1>
            <p className={styles.pageSubtitle}>Manage your profile and preferences</p>
          </div>

          <div className={styles.profileCard}>
            <div className={styles.profileHeader}>
              <div className={styles.avatar}>
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className={styles.profileInfo}>
                <h2 className={styles.userName}>{user.name}</h2>
                <p className={styles.userMobile}>+91 {user.mobileNumber}</p>
              </div>
            </div>

            <div className={styles.profileDetails}>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Full Name</span>
                <span className={styles.detailValue}>{user.name}</span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Mobile Number</span>
                <span className={styles.detailValue}>+91 {user.mobileNumber}</span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Member Since</span>
                <span className={styles.detailValue}>
                  {new Date(user.createdAt || Date.now()).toLocaleDateString('en-IN', {
                    month: 'long',
                    year: 'numeric'
                  })}
                </span>
              </div>
            </div>
          </div>

          <div className={styles.menuSection}>
            <h2 className={styles.sectionTitle}>Quick Actions</h2>
            
            <div className={styles.menuGrid}>
              <Link href="/my-polls" className={styles.menuItem}>
                <div className={styles.menuIcon}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 11l3 3L22 4"></path>
                    <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
                  </svg>
                </div>
                <div className={styles.menuContent}>
                  <h3 className={styles.menuTitle}>My Polls</h3>
                  <p className={styles.menuDescription}>View your voting history and results</p>
                </div>
                <div className={styles.menuArrow}>→</div>
              </Link>

              <button 
                className={styles.menuItem}
                disabled
                title="Coming Soon"
              >
                <div className={styles.menuIcon}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"></circle>
                    <path d="M12 6v6l4 2"></path>
                  </svg>
                </div>
                <div className={styles.menuContent}>
                  <h3 className={styles.menuTitle}>My Points</h3>
                  <p className={styles.menuDescription}>View your points and rewards</p>
                </div>
                <span className={styles.comingSoonBadge}>Coming Soon</span>
              </button>

              {/* <button 
                className={styles.menuItem}
                disabled
                title="Coming Soon"
              >
                <div className={styles.menuIcon}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                    <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
                    <line x1="12" y1="22.08" x2="12" y2="12"></line>
                  </svg>
                </div>
                <div className={styles.menuContent}>
                  <h3 className={styles.menuTitle}>My Contests</h3>
                  <p className={styles.menuDescription}>Track your contest participation</p>
                </div>
                <span className={styles.comingSoonBadge}>Coming Soon</span>
              </button> */}

              <Link href="/" className={styles.menuItem}>
                <div className={styles.menuIcon}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="12" y1="5" x2="12" y2="19"></line>
                    <polyline points="19 12 12 19 5 12"></polyline>
                  </svg>
                </div>
                <div className={styles.menuContent}>
                  <h3 className={styles.menuTitle}>Browse Polls</h3>
                  <p className={styles.menuDescription}>Participate in active polls</p>
                </div>
                <div className={styles.menuArrow}>→</div>
              </Link>
            </div>
          </div>

          <div className={styles.dangerZone}>
            <h2 className={styles.sectionTitle}>Account Actions</h2>
            <button onClick={handleLogout} className={styles.logoutButton}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                <polyline points="16 17 21 12 16 7"></polyline>
                <line x1="21" y1="12" x2="9" y2="12"></line>
              </svg>
              Logout
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

