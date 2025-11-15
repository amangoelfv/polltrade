import type { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '../../../lib/mongodb';
import Poll, { IPoll } from '../../../models/Poll';
import type { Poll as PollType } from '../../../types/poll';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<PollType | { error: string }>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    await connectDB();

    const { id } = req.query;

    if (!id || typeof id !== 'string') {
      return res.status(400).json({ error: 'Invalid poll ID' });
    }

    const poll = await Poll.findById(id).lean<IPoll>();

    if (!poll) {
      return res.status(404).json({ error: 'Poll not found' });
    }

    // Transform MongoDB poll to API format
    const formattedPoll: PollType = {
      id: poll._id.toString(),
      question: poll.question,
      options: poll.options.map(opt => ({
        id: opt._id.toString(),
        text: opt.text,
        votePercentage: poll.totalVotes > 0 
          ? Math.round((opt.voteCount / poll.totalVotes) * 100) 
          : 0
      })),
      totalVotes: poll.totalVotes,
      category: poll.category,
      expiresAt: poll.expiresAt.toISOString()
    };

    return res.status(200).json(formattedPoll);
  } catch (error) {
    console.error('Error fetching poll:', error);
    return res.status(500).json({ error: 'Failed to fetch poll' });
  }
}
