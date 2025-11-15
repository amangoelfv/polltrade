import { ReactNode } from 'react';
import Header from './Header';
import Footer from './Footer';
import styles from '../styles/Layout.module.css';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className={styles.layoutWrapper}>
      <Header />
      <main className={styles.mainContent}>
        {children}
      </main>
      <Footer />
    </div>
  );
}

