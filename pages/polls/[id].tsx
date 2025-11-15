import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import type { Poll } from '../../types/poll';
import type { Comment } from '../../types/comment';
import { api } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import styles from '../../styles/PollDetail.module.css';

export default function PollDetail() {
  const router = useRouter();
  const { id } = router.query;
  const { user } = useAuth();

  const [poll, setPoll] = useState<Poll | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [commentsLoading, setCommentsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  const [newComment, setNewComment] = useState({ content: '' });
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Voting state
  const [selectedOption, setSelectedOption] = useState<string>('');
  const [userVote, setUserVote] = useState<string | null>(null);
  const [hasVoted, setHasVoted] = useState<boolean>(false);
  const [voting, setVoting] = useState<boolean>(false);
  const [voteError, setVoteError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      fetchPoll();
      fetchComments();
      if (user) {
        checkUserVote();
      }
    }
  }, [id, user]);

  const fetchPoll = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/polls/${id}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch poll');
      }
      
      const data: Poll = await response.json();
      setPoll(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async () => {
    try {
      setCommentsLoading(true);
      const response = await fetch(`/api/polls/${id}/comments`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch comments');
      }
      
      const data: Comment[] = await response.json();
      setComments(data);
    } catch (err) {
      console.error('Error fetching comments:', err);
    } finally {
      setCommentsLoading(false);
    }
  };

  const checkUserVote = async () => {
    try {
      const response = await api.get(`/api/polls/${id}/vote`);
      
      if (response.ok) {
        const data = await response.json();
        if (data.hasVoted && data.optionId) {
          setHasVoted(true);
          setUserVote(data.optionId);
          setSelectedOption(data.optionId);
        }
      }
    } catch (err) {
      console.error('Error checking user vote:', err);
    }
  };

  const handleVote = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedOption) {
      setVoteError('Please select an option');
      return;
    }

    try {
      setVoting(true);
      setVoteError(null);

      const response = await api.post(`/api/polls/${id}/vote`, {
        optionId: selectedOption,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to cast vote');
      }

      // Mark as voted and refresh poll data
      setHasVoted(true);
      setUserVote(selectedOption);
      await fetchPoll(); // Refresh to get updated vote counts
    } catch (err) {
      setVoteError(err instanceof Error ? err.message : 'Failed to cast vote');
    } finally {
      setVoting(false);
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newComment.content.trim()) {
      setSubmitError('Please enter a comment');
      return;
    }

    if (newComment.content.trim().length < 3) {
      setSubmitError('Comment must be at least 3 characters');
      return;
    }

    try {
      setSubmitting(true);
      setSubmitError(null);

      const response = await api.post(`/api/polls/${id}/comments`, {
        content: newComment.content,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to post comment');
      }

      const data = await response.json();
      setComments([data.comment, ...comments]);
      setNewComment({ content: '' });
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Failed to post comment');
    } finally {
      setSubmitting(false);
    }
  };

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

  const formatCommentDate = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const isPollExpired = (expiresAt: string): boolean => {
    return new Date(expiresAt).getTime() < new Date().getTime();
  };

  const getWinningOption = () => {
    if (!poll) return null;
    let maxVotes = 0;
    let winningOption = poll.options[0];
    
    poll.options.forEach(option => {
      if (option.votePercentage > maxVotes) {
        maxVotes = option.votePercentage;
        winningOption = option;
      }
    });
    
    return winningOption;
  };

  const getUserVoteResult = () => {
    if (!poll || !isPollExpired(poll.expiresAt)) return null;
    
    const winningOption = getWinningOption();
    if (!winningOption) return null;

    if (!user) {
      return {
        type: 'missed',
        message: '⏰ You missed this poll!',
        subtext: 'Log in to participate in active polls'
      };
    }

    if (!hasVoted || !userVote) {
      return {
        type: 'missed',
        message: '⏰ You missed this poll!',
        subtext: 'You didn\'t vote before it expired'
      };
    }

    const userVotedOption = poll.options.find(opt => opt.id === userVote);
    if (!userVotedOption) return null;

    const isCorrect = userVote === winningOption.id;
    
    if (isCorrect) {
      return {
        type: 'correct',
        message: '🎉 You were right!',
        subtext: `You voted for "${userVotedOption.text}" which won with ${winningOption.votePercentage}%`
      };
    } else {
      return {
        type: 'wrong',
        message: '❌ You were wrong',
        subtext: `You voted for "${userVotedOption.text}" (${userVotedOption.votePercentage}%), but "${winningOption.text}" won with ${winningOption.votePercentage}%`
      };
    }
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Loading poll...</p>
      </div>
    );
  }

  if (error || !poll) {
    return (
      <div className={styles.errorContainer}>
        <h2>⚠️ {error || 'Poll not found'}</h2>
        <Link href="/" className={styles.backLink}>
          Go back to home
        </Link>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>{poll.question} - PollTrade</title>
        <meta name="description" content={poll.question} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      
      <div className={styles.main}>
        <div className={styles.container}>
          <Link href="/" className={styles.backButton}>
            ← Back to Polls
          </Link>

          <div className={styles.pollSection}>
            <div className={styles.pollCard}>
              {isPollExpired(poll.expiresAt) && (() => {
                const result = getUserVoteResult();
                if (result) {
                  return (
                    <div className={`${styles.pollResult} ${styles[`result${result.type.charAt(0).toUpperCase() + result.type.slice(1)}`]}`}>
                      <p className={styles.resultMessage}>{result.message}</p>
                      <p className={styles.resultSubtext}>{result.subtext}</p>
                    </div>
                  );
                }
                return null;
              })()}

              <div className={styles.pollHeader}>
                <span className={styles.categoryBadge}>{poll.category}</span>
                <span className={styles.expiryBadge}>{formatDate(poll.expiresAt)}</span>
              </div>

              <h1 className={styles.pollQuestion}>{poll.question}</h1>

              <form onSubmit={handleVote}>
                <div className={styles.optionsContainer}>
                  {poll.options.map(option => (
                    <div key={option.id} className={styles.optionWrapper}>
                      <label 
                        className={`${styles.optionLabel} ${selectedOption === option.id ? styles.optionSelected : ''}`}
                        htmlFor={`option-${option.id}`}
                      >
                        <input
                          type="radio"
                          id={`option-${option.id}`}
                          name="poll-option"
                          value={option.id}
                          checked={selectedOption === option.id}
                          onChange={() => !hasVoted && setSelectedOption(option.id)}
                          disabled={hasVoted || !user || isPollExpired(poll.expiresAt)}
                          className={styles.radioInput}
                        />
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
                      </label>
                    </div>
                  ))}
                </div>

              <div className={styles.pollStats}>
                <div className={styles.statItem}>
                  <span className={styles.statLabel}>Total Votes</span>
                  <span className={styles.statValue}>{formatNumber(poll.totalVotes)}</span>
                </div>
                <div className={styles.statItem}>
                  <span className={styles.statLabel}>Comments</span>
                  <span className={styles.statValue}>{comments.length}</span>
                </div>
              </div>

                {voteError && (
                  <div className={styles.voteError}>
                    {voteError}
                  </div>
                )}

                {isPollExpired(poll.expiresAt) ? (
                  <div className={styles.expiredNotice}>
                    <p>⏱️ This poll has expired. Voting is now closed.</p>
                  </div>
                ) : user ? (
                  hasVoted ? (
                    <div className={styles.votedNotice}>
                      <p>✅ You have already voted on this poll</p>
                      <p className={styles.votedSubtext}>Your vote has been recorded</p>
                    </div>
                  ) : (
                    <button 
                      type="submit"
                      className={styles.voteButton}
                      disabled={voting || !selectedOption}
                    >
                      {voting ? 'Casting Vote...' : 'Cast Your Vote'}
                    </button>
                  )
                ) : (
                  <div className={styles.loginPrompt}>
                    <p>🔐 Please log in to vote on this poll</p>
                    <Link href={`/login?returnUrl=/polls/${id}`} className={styles.loginLink}>
                      Login to Vote
                    </Link>
                  </div>
                )}
              </form>
            </div>
          </div>

          <div className={styles.commentsSection}>
            <h2 className={styles.commentsTitle}>
              Comments ({comments.length})
            </h2>

            {isPollExpired(poll.expiresAt) ? (
              <div className={styles.expiredCommentNotice}>
                <p>💬 This poll has expired. Comments are now disabled.</p>
                <p className={styles.expiredSubtext}>You can still view existing discussions below.</p>
              </div>
            ) : user ? (
              <div className={styles.commentForm}>
                <h3 className={styles.formTitle}>Share Your Thoughts</h3>
                <form onSubmit={handleSubmitComment}>
                  <textarea
                    placeholder="Write your comment... (3-1000 characters)"
                    className={styles.textarea}
                    value={newComment.content}
                    onChange={(e) => setNewComment({ content: e.target.value })}
                    disabled={submitting}
                    maxLength={1000}
                    rows={4}
                  />
                  {submitError && <p className={styles.submitError}>{submitError}</p>}
                  <button 
                    type="submit" 
                    className={styles.submitButton}
                    disabled={submitting}
                  >
                    {submitting ? 'Posting...' : 'Post Comment'}
                  </button>
                </form>
              </div>
            ) : (
              <div className={styles.loginPromptComment}>
                <p>🔐 Please log in to comment on this poll</p>
                <Link href={`/login?returnUrl=/polls/${id}`} className={styles.loginLink}>
                  Login to Comment
                </Link>
              </div>
            )}

            {commentsLoading ? (
              <div className={styles.commentsLoading}>
                <div className={styles.spinner}></div>
                <p>Loading comments...</p>
              </div>
            ) : comments.length === 0 ? (
              <div className={styles.noComments}>
                <p>No comments yet. Be the first to share your thoughts!</p>
              </div>
            ) : (
              <div className={styles.commentsList}>
                {comments.map(comment => (
                  <div key={comment.id} className={styles.commentCard}>
                    <div className={styles.commentHeader}>
                      <Link href={`/users/${comment.userId}`} className={styles.commentAuthor}>
                        <div className={styles.authorAvatar}>
                          {comment.author.charAt(0).toUpperCase()}
                        </div>
                        <div className={styles.authorInfo}>
                          <span className={styles.authorName}>{comment.author}</span>
                          <span className={styles.commentTime}>
                            {formatCommentDate(comment.timestamp)}
                          </span>
                        </div>
                      </Link>
                      <div className={styles.commentLikes}>
                        <span className={styles.likeIcon}>♥</span>
                        <span className={styles.likeCount}>{comment.likes}</span>
                      </div>
                    </div>
                    <p className={styles.commentContent}>{comment.content}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

