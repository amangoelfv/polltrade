import type { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '../../../../lib/mongodb';
import User, { IUser } from '../../../../models/User';
import Poll, { IPoll } from '../../../../models/Poll';
import PollResponse from '../../../../models/PollResponse';
import mongoose from 'mongoose';

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

interface UserProfileResponse {
  success: boolean;
  user: {
    id: string;
    name: string;
    memberSince: string;
  };
  stats: UserStats;
  polls: UserPollVote[];
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<UserProfileResponse | { error: string }>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { userId } = req.query;

  if (!userId || typeof userId !== 'string' || !mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).json({ error: 'Invalid user ID' });
  }

  try {
    await connectDB();

    // Get user info
    const user = await User.findById(userId).lean<IUser>();
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get all poll responses by this user
    const userResponses = await PollResponse.find({ userId })
      .sort({ createdAt: -1 })
      .lean();

    // Get all polls that the user voted on
    const pollIds = userResponses.map(r => r.pollId);
    const polls = await Poll.find({ _id: { $in: pollIds } }).lean<IPoll[]>();

    // Create a map for quick lookup
    const pollMap = new Map(polls.map(p => [p._id.toString(), p]));

    // Build response with vote results and calculate stats
    let pollsWon = 0;
    let pollsLost = 0;
    let activePollsVoted = 0;

    const userPolls: UserPollVote[] = userResponses
      .map(response => {
        const poll = pollMap.get(response.pollId.toString());
        if (!poll) return null;

        const isExpired = poll.expiresAt.getTime() < new Date().getTime();
        if (!isExpired) activePollsVoted++;

        // Find user's voted option
        const userVotedOption = poll.options.find(
          opt => opt._id.toString() === response.optionId.toString()
        );

        if (!userVotedOption) return null;

        // Find winning option (highest vote percentage)
        let winningOption = poll.options[0];
        let maxVotes = 0;
        
        poll.options.forEach(opt => {
          const percentage = poll.totalVotes > 0 
            ? (opt.voteCount / poll.totalVotes) * 100 
            : 0;
          if (percentage > maxVotes) {
            maxVotes = percentage;
            winningOption = opt;
          }
        });

        const userVotePercentage = poll.totalVotes > 0
          ? Math.round((userVotedOption.voteCount / poll.totalVotes) * 100)
          : 0;

        const winningVotePercentage = poll.totalVotes > 0
          ? Math.round((winningOption.voteCount / poll.totalVotes) * 100)
          : 0;

        const isCorrect = userVotedOption._id.toString() === winningOption._id.toString();

        // Count wins/losses only for expired polls
        if (isExpired) {
          if (isCorrect) {
            pollsWon++;
          } else {
            pollsLost++;
          }
        }

        return {
          pollId: poll._id.toString(),
          question: poll.question,
          category: poll.category,
          expiresAt: poll.expiresAt.toISOString(),
          isExpired,
          userVotedOptionId: userVotedOption._id.toString(),
          userVotedOptionText: userVotedOption.text,
          winningOptionId: winningOption._id.toString(),
          winningOptionText: winningOption.text,
          userVotePercentage,
          winningVotePercentage,
          isCorrect,
          votedAt: response.createdAt.toISOString()
        };
      })
      .filter((poll): poll is UserPollVote => poll !== null);

    const totalVotes = userPolls.length;
    const expiredPolls = pollsWon + pollsLost;
    const winRate = expiredPolls > 0 ? Math.round((pollsWon / expiredPolls) * 100) : 0;

    const stats: UserStats = {
      totalVotes,
      pollsWon,
      pollsLost,
      activePollsVoted,
      winRate
    };

    return res.status(200).json({
      success: true,
      user: {
        id: user._id.toString(),
        name: user.name,
        memberSince: user.createdAt.toISOString()
      },
      stats,
      polls: userPolls
    });

  } catch (error) {
    console.error('Error fetching user profile:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

