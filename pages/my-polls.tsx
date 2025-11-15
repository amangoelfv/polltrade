import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthContext';
import { api } from '../utils/api';
import styles from '../styles/MyPolls.module.css';

interface UserPollVote {
  pollId: string;
  question: string;
  category: string;
  expiresAt: string;
  isExpired: boolean;
  userVotedOptionId: string;
  userVotedOptionText: string;
  winningOptionId: string;
  winningOptionText: string;
  userVotePercentage: number;
  winningVotePercentage: number;
  isCorrect: boolean;
  votedAt: string;
}

export default function MyPolls() {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const [polls, setPolls] = useState<UserPollVote[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Wait for auth to finish loading before checking user
    if (isLoading) {
      return;
    }

    if (!user) {
      router.push('/login?returnUrl=/my-polls');
      return;
    }

    fetchMyPolls();
  }, [user, isLoading, router]);

  const fetchMyPolls = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/user/my-polls');

      if (!response.ok) {
        throw new Error('Failed to fetch polls');
      }

      const data = await response.json();
      setPolls(data.polls);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load polls');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const getStatusBadge = (poll: UserPollVote) => {
    if (!poll.isExpired) {
      return <span className={styles.statusActive}>Active</span>;
    }
    if (poll.isCorrect) {
      return <span className={styles.statusWon}>Won</span>;
    }
    return <span className={styles.statusLost}>Lost</span>;
  };

  const getResultIcon = (poll: UserPollVote) => {
    if (!poll.isExpired) return '⏳';
    if (poll.isCorrect) return '🎉';
    return '❌';
  };

  if (isLoading || loading) {
    return (
      <>
        <Head>
          <title>My Polls - PollTrade</title>
          <meta name="description" content="View your poll voting history" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <link rel="icon" href="/favicon.png" />
        </Head>
        <div className={styles.loadingContainer}>
          <div className={styles.spinner}></div>
          <p>Loading your polls...</p>
        </div>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>My Polls - PollTrade</title>
        <meta name="description" content="View your poll voting history" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.png" />
      </Head>

      <div className={styles.main}>
        <div className={styles.container}>
          <Link href="/account" className={styles.backButton}>
            ← Back to Account
          </Link>
          
          <div className={styles.header}>
            <h1 className={styles.title}>My Polls</h1>
            <p className={styles.subtitle}>Your voting history and results</p>
          </div>

          {error && (
            <div className={styles.errorBanner}>
              <p>{error}</p>
            </div>
          )}

          {polls.length === 0 ? (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>📊</div>
              <h2>No Polls Yet</h2>
              <p>You haven't voted on any polls yet.</p>
              <Link href="/" className={styles.browseButton}>
                Browse Polls
              </Link>
            </div>
          ) : (
            <div className={styles.pollsGrid}>
              {polls.map((poll) => (
                <Link 
                  href={`/polls/${poll.pollId}`} 
                  key={poll.pollId}
                  className={styles.pollCard}
                >
                  <div className={styles.pollCardHeader}>
                    <span className={styles.categoryBadge}>{poll.category}</span>
                    {getStatusBadge(poll)}
                  </div>

                  <h3 className={styles.pollQuestion}>{poll.question}</h3>

                  <div className={styles.voteInfo}>
                    <div className={styles.resultIcon}>{getResultIcon(poll)}</div>
                    <div className={styles.voteDetails}>
                      <div className={styles.yourVote}>
                        <span className={styles.voteLabel}>Your Vote:</span>
                        <span className={styles.voteText}>
                          {poll.userVotedOptionText}
                          <span className={styles.votePercentage}>
                            ({poll.userVotePercentage}%)
                          </span>
                        </span>
                      </div>
                      
                      {poll.isExpired && !poll.isCorrect && (
                        <div className={styles.winningVote}>
                          <span className={styles.voteLabel}>Winner:</span>
                          <span className={styles.voteText}>
                            {poll.winningOptionText}
                            <span className={styles.votePercentage}>
                              ({poll.winningVotePercentage}%)
                            </span>
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className={styles.pollFooter}>
                    <span className={styles.votedDate}>
                      Voted on {formatDate(poll.votedAt)}
                    </span>
                    {poll.isExpired && (
                      <span className={styles.expiredDate}>
                        Ended {formatDate(poll.expiresAt)}
                      </span>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

