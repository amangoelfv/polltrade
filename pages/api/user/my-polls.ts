import type { NextApiRequest, NextApiResponse } from 'next';
import jwt from 'jsonwebtoken';
import type { JWTPayload } from '../../../types/auth';
import connectDB from '../../../lib/mongodb';
import Poll, { IPoll } from '../../../models/Poll';
import PollResponse from '../../../models/PollResponse';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

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

interface MyPollsResponse {
  success: boolean;
  polls: UserPollVote[];
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<MyPollsResponse | { error: string }>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    await connectDB();

    // Verify authentication
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const token = authHeader.substring(7);

    let decoded: JWTPayload;
    try {
      decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
    } catch (error) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    // Get all poll responses by this user
    const userResponses = await PollResponse.find({ userId: decoded.userId })
      .sort({ createdAt: -1 })
      .lean();

    if (userResponses.length === 0) {
      return res.status(200).json({
        success: true,
        polls: []
      });
    }

    // Get all polls that the user voted on
    const pollIds = userResponses.map(r => r.pollId);
    const polls = await Poll.find({ _id: { $in: pollIds } }).lean<IPoll[]>();

    // Create a map for quick lookup
    const pollMap = new Map(polls.map(p => [p._id.toString(), p]));

    // Build response with vote results
    const userPolls: UserPollVote[] = userResponses
      .map(response => {
        const poll = pollMap.get(response.pollId.toString());
        if (!poll) return null;

        const isExpired = poll.expiresAt.getTime() < new Date().getTime();

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

    return res.status(200).json({
      success: true,
      polls: userPolls
    });

  } catch (error) {
    console.error('Error fetching user polls:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

