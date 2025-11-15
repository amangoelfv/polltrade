import Link from 'next/link';
import styles from '../styles/Footer.module.css';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.footerContent}>
          <div className={styles.footerSection}>
            <h3 className={styles.footerTitle}>PollTrade</h3>
            <p className={styles.footerDescription}>
              Predict & Trade on Real-World Events
            </p>
          </div>

          <div className={styles.footerSection}>
            <h4 className={styles.sectionTitle}>Legal</h4>
            <ul className={styles.linkList}>
              <li>
                <Link href="/terms" className={styles.footerLink}>
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/privacy" className={styles.footerLink}>
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/cookies" className={styles.footerLink}>
                  Cookie Policy
                </Link>
              </li>
              <li>
                <Link href="/disclaimer" className={styles.footerLink}>
                  Disclaimer
                </Link>
              </li>
            </ul>
          </div>

          <div className={styles.footerSection}>
            <h4 className={styles.sectionTitle}>Company</h4>
            <ul className={styles.linkList}>
              <li>
                <Link href="/about" className={styles.footerLink}>
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/contact" className={styles.footerLink}>
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/careers" className={styles.footerLink}>
                  Careers
                </Link>
              </li>
              <li>
                <Link href="/blog" className={styles.footerLink}>
                  Blog
                </Link>
              </li>
            </ul>
          </div>

          <div className={styles.footerSection}>
            <h4 className={styles.sectionTitle}>Support</h4>
            <ul className={styles.linkList}>
              <li>
                <Link href="/help" className={styles.footerLink}>
                  Help Center
                </Link>
              </li>
              <li>
                <Link href="/faq" className={styles.footerLink}>
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="/community" className={styles.footerLink}>
                  Community Guidelines
                </Link>
              </li>
              <li>
                <Link href="/report" className={styles.footerLink}>
                  Report Issue
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className={styles.footerBottom}>
          <div className={styles.copyright}>
            <p>&copy; {currentYear} PollTrade. All rights reserved.</p>
          </div>
          <div className={styles.socialLinks}>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className={styles.socialLink} aria-label="Twitter">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z"></path>
              </svg>
            </a>
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className={styles.socialLink} aria-label="Facebook">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"></path>
              </svg>
            </a>
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className={styles.socialLink} aria-label="LinkedIn">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z"></path>
                <circle cx="4" cy="4" r="2"></circle>
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

