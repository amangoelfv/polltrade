import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import type { Poll } from '../types/poll';
import styles from '../styles/Home.module.css';

export default function Home() {
  const [polls, setPolls] = useState<Poll[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  useEffect(() => {
    fetchPolls();
  }, []);

  const fetchPolls = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/polls');
      
      if (!response.ok) {
        throw new Error('Failed to fetch polls');
      }
      
      const data: Poll[] = await response.json();
      setPolls(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const isPollExpired = (expiresAt: string): boolean => {
    return new Date(expiresAt).getTime() < new Date().getTime();
  };

  const categories = ['All', ...Array.from(new Set(polls.map(poll => poll.category)))];
  
  const filteredPolls = (selectedCategory === 'All' 
    ? polls 
    : polls.filter(poll => poll.category === selectedCategory))
    .sort((a, b) => {
      const aExpired = isPollExpired(a.expiresAt);
      const bExpired = isPollExpired(b.expiresAt);
      
      // Active polls first (false < true, so !aExpired will be 1 for active, 0 for expired)
      if (aExpired !== bExpired) {
        return aExpired ? 1 : -1;
      }
      
      // Within same status, sort by ID (or you could sort by expiry date)
      return a.id.localeCompare(b.id);
    });

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return 'Expired';
    if (diffDays === 0) return 'Ends today';
    if (diffDays === 1) return 'Ends tomorrow';
    if (diffDays < 30) return `${diffDays} days left`;
    
    const diffMonths = Math.floor(diffDays / 30);
    if (diffMonths === 1) return '1 month left';
    if (diffMonths < 12) return `${diffMonths} months left`;
    
    const diffYears = Math.floor(diffMonths / 12);
    return `${diffYears} year${diffYears > 1 ? 's' : ''} left`;
  };

  return (
    <>
      <Head>
        <title>PollTrade - Predict & Trade on Real-World Events</title>
        <meta name="description" content="Participate in polls and predict outcomes of real-world events" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.png" />
      </Head>
      
      <div className={styles.main}>
        <div className={styles.container}>
          <div className={styles.pageHeader}>
            <h1 className={styles.pageTitle}>Explore Polls</h1>
            <p className={styles.pageSubtitle}>Vote on trending polls and share your predictions</p>
          </div>

          <div className={styles.filterSection}>
            <div className={styles.categoryFilters}>
              {categories.map(category => (
                <button
                  key={category}
                  className={`${styles.filterButton} ${selectedCategory === category ? styles.filterButtonActive : ''}`}
                  onClick={() => setSelectedCategory(category)}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          {loading && (
            <div className={styles.loading}>
              <div className={styles.spinner}></div>
              <p>Loading polls...</p>
            </div>
          )}

          {error && (
            <div className={styles.error}>
              <p>⚠️ {error}</p>
              <button onClick={fetchPolls} className={styles.retryButton}>
                Retry
              </button>
            </div>
          )}

          {!loading && !error && (
            <div className={styles.pollsGrid}>
              {filteredPolls.map(poll => (
                <Link key={poll.id} href={`/polls/${poll.id}`} className={styles.pollCardLink}>
                  <div className={`${styles.pollCard} ${isPollExpired(poll.expiresAt) ? styles.expiredPoll : ''}`}>
                    <div className={styles.pollHeader}>
                      <span className={styles.categoryBadge}>{poll.category}</span>
                      <span className={`${styles.expiryBadge} ${isPollExpired(poll.expiresAt) ? styles.expiredBadge : ''}`}>
                        {formatDate(poll.expiresAt)}
                      </span>
                    </div>
                    
                    <h3 className={styles.pollQuestion}>{poll.question}</h3>
                    
                    <div className={styles.optionsContainer}>
                      {poll.options.map(option => (
                        <div key={option.id} className={styles.optionWrapper}>
                          <div className={styles.optionContent}>
                            <span className={styles.optionText}>{option.text}</span>
                            <span className={styles.optionPercentage}>{option.votePercentage}%</span>
                          </div>
                          <div className={styles.progressBar}>
                            <div 
                              className={styles.progressFill}
                              style={{ width: `${option.votePercentage}%` }}
                            ></div>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <div className={styles.pollFooter}>
                      <span className={styles.totalVotes}>
                        {formatNumber(poll.totalVotes)} votes
                      </span>
                      <span className={styles.viewDetails}>View Details →</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {!loading && !error && filteredPolls.length === 0 && (
            <div className={styles.noPolls}>
              <p>No polls found in this category</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
