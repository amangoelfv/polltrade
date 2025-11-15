import Link from 'next/link';
import { useAuth } from '../context/AuthContext';
import styles from '../styles/Header.module.css';
import Image from 'next/image';

export default function Header() {
  const { user, isLoading } = useAuth();

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <Link href="/" className={styles.logo}>
          <Image src="/logo_wide.png" alt="PollTrade" width={120} height={24} />
        </Link>

        <nav className={styles.nav}>
          {isLoading ? (
            <div className={styles.loadingSkeleton}></div>
          ) : user ? (
            <>
              <Link href="/account" className={styles.navLink}>
                <span className={styles.desktopOnly}>My Account</span>
                <span className={styles.mobileOnly}>
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    width="24" 
                    height="24" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                  >
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                </span>
              </Link>
            </>
          ) : (
            <Link href="/login" className={styles.loginButton}>
              <span className={styles.desktopOnly}>Login</span>
              <span className={styles.mobileOnly}>
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  width="24" 
                  height="24" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                >
                  <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path>
                  <polyline points="10 17 15 12 10 7"></polyline>
                  <line x1="15" y1="12" x2="3" y2="12"></line>
                </svg>
              </span>
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}

