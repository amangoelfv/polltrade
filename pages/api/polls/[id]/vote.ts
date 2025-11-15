import type { NextApiRequest, NextApiResponse } from 'next';
import jwt from 'jsonwebtoken';
import type { JWTPayload } from '../../../../types/auth';
import connectDB from '../../../../lib/mongodb';
import Poll from '../../../../models/Poll';
import PollResponse from '../../../../models/PollResponse';
import UserModel from '../../../../models/User';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

interface VoteRequest {
  optionId: string;
}

interface VoteResponse {
  success: boolean;
  message: string;
  userVote?: {
    pollId: string;
    optionId: string;
  };
}

interface GetVoteResponse {
  hasVoted: boolean;
  optionId?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<VoteResponse | GetVoteResponse | { error: string }>
) {
  const { id: pollId } = req.query;

  if (!pollId || typeof pollId !== 'string') {
    return res.status(400).json({ error: 'Invalid poll ID' });
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

    // Verify user exists
    const user = await UserModel.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    // Verify poll exists
    const poll = await Poll.findById(pollId);
    if (!poll) {
      return res.status(404).json({ error: 'Poll not found' });
    }

    if (req.method === 'GET') {
      // Check if user has already voted (allowed even for expired polls)
      const existingVote = await PollResponse.findOne({
        pollId: poll._id,
        userId: user._id
      });

      if (existingVote) {
        return res.status(200).json({
          hasVoted: true,
          optionId: existingVote.optionId.toString()
        });
      }

      return res.status(200).json({
        hasVoted: false
      });
    }

    if (req.method === 'POST') {
      // Check if poll is expired (only block POST requests for voting)
      if (poll.expiresAt.getTime() < new Date().getTime()) {
        return res.status(403).json({ error: 'This poll has expired. Voting is now closed.' });
      }
      const { optionId }: VoteRequest = req.body;

      if (!optionId) {
        return res.status(400).json({ error: 'Option ID is required' });
      }

      // Verify option exists in poll
      const optionExists = poll.options.some(opt => opt._id.toString() === optionId);
      if (!optionExists) {
        return res.status(400).json({ error: 'Invalid option ID' });
      }

      // Check if user has already voted
      const existingVote = await PollResponse.findOne({
        pollId: poll._id,
        userId: user._id
      });

      if (existingVote) {
        return res.status(400).json({ error: 'You have already voted on this poll' });
      }

      // Create vote record
      await PollResponse.create({
        pollId: poll._id,
        userId: user._id,
        optionId: optionId
      });

      // Update vote counts in poll
      const optionIndex = poll.options.findIndex(opt => opt._id.toString() === optionId);
      if (optionIndex !== -1) {
        poll.options[optionIndex].voteCount += 1;
        poll.totalVotes += 1;
        await poll.save();
      }

      console.log(`Vote recorded: User ${user.name} voted on poll ${pollId}`);

      return res.status(200).json({
        success: true,
        message: 'Vote recorded successfully',
        userVote: {
          pollId: pollId,
          optionId: optionId
        }
      });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Error handling vote:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

