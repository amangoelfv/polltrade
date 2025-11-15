import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import styles from '../../styles/UserProfile.module.css';

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

interface UserStats {
  totalVotes: number;
  pollsWon: number;
  pollsLost: number;
  activePollsVoted: number;
  winRate: number;
}

interface UserProfile {
  id: string;
  name: string;
  memberSince: string;
}

export default function UserProfile() {
  const router = useRouter();
  const { userId } = router.query;
  const [user, setUser] = useState<UserProfile | null>(null);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [polls, setPolls] = useState<UserPollVote[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (userId && typeof userId === 'string') {
      fetchUserProfile(userId);
    }
  }, [userId]);

  const fetchUserProfile = async (id: string) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/users/${id}/profile`);

      if (!response.ok) {
        throw new Error('Failed to fetch user profile');
      }

      const data = await response.json();
      setUser(data.user);
      setStats(data.stats);
      setPolls(data.polls);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'long',
      year: 'numeric'
    });
  };

  const formatVotedDate = (dateString: string): string => {
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

  if (loading) {
    return (
      <>
        <Head>
          <title>User Profile - PollTrade</title>
          <meta name="description" content="View user profile" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <link rel="icon" href="/favicon.ico" />
        </Head>
        <div className={styles.loadingContainer}>
          <div className={styles.spinner}></div>
          <p>Loading profile...</p>
        </div>
      </>
    );
  }

  if (error || !user || !stats) {
    return (
      <>
        <Head>
          <title>User Not Found - PollTrade</title>
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <link rel="icon" href="/favicon.ico" />
        </Head>
        <div className={styles.errorContainer}>
          <h2>⚠️ {error || 'User not found'}</h2>
          <Link href="/" className={styles.backLink}>
            Go back to home
          </Link>
        </div>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>{user.name} - PollTrade</title>
        <meta name="description" content={`View ${user.name}'s profile and poll history`} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className={styles.main}>
        <div className={styles.container}>
          <Link href="/" className={styles.backButton}>
            ← Back to Home
          </Link>

          {/* Profile Header */}
          <div className={styles.profileCard}>
            <div className={styles.avatarLarge}>
              {user.name.charAt(0).toUpperCase()}
            </div>
            <h1 className={styles.userName}>{user.name}</h1>
            <p className={styles.memberSince}>
              Member since {formatDate(user.memberSince)}
            </p>
          </div>

          {/* Stats Grid */}
          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <div className={styles.statIcon}>📊</div>
              <div className={styles.statValue}>{stats.totalVotes}</div>
              <div className={styles.statLabel}>Total Votes</div>
            </div>

            <div className={styles.statCard}>
              <div className={styles.statIcon}>🎉</div>
              <div className={styles.statValue}>{stats.pollsWon}</div>
              <div className={styles.statLabel}>Polls Won</div>
            </div>

            <div className={styles.statCard}>
              <div className={styles.statIcon}>❌</div>
              <div className={styles.statValue}>{stats.pollsLost}</div>
              <div className={styles.statLabel}>Polls Lost</div>
            </div>

            <div className={styles.statCard}>
              <div className={styles.statIcon}>⏳</div>
              <div className={styles.statValue}>{stats.activePollsVoted}</div>
              <div className={styles.statLabel}>Active Votes</div>
            </div>

            <div className={`${styles.statCard} ${styles.statCardHighlight}`}>
              <div className={styles.statIcon}>🏆</div>
              <div className={styles.statValue}>{stats.winRate}%</div>
              <div className={styles.statLabel}>Win Rate</div>
            </div>
          </div>

          {/* Polls Section */}
          <div className={styles.pollsSection}>
            <h2 className={styles.sectionTitle}>Voting History</h2>

            {polls.length === 0 ? (
              <div className={styles.emptyState}>
                <p>No voting history yet</p>
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
                          <span className={styles.voteLabel}>Voted:</span>
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
                        {formatVotedDate(poll.votedAt)}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

