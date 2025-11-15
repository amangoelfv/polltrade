import type { NextApiRequest, NextApiResponse } from 'next';
import jwt from 'jsonwebtoken';
import type { Comment, CreateCommentRequest } from '../../../../types/comment';
import type { JWTPayload } from '../../../../types/auth';
import connectDB from '../../../../lib/mongodb';
import Poll from '../../../../models/Poll';
import CommentModel from '../../../../models/Comment';
import UserModel from '../../../../models/User';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

const isPollExpired = (expiresAt: Date): boolean => {
  return expiresAt.getTime() < new Date().getTime();
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Comment[] | { error: string } | { success: boolean; comment: Comment }>
) {
  const { id: pollId } = req.query;

  if (!pollId || typeof pollId !== 'string') {
    return res.status(400).json({ error: 'Invalid poll ID' });
  }

  try {
    await connectDB();

    // Verify poll exists
    const poll = await Poll.findById(pollId);
    if (!poll) {
      return res.status(404).json({ error: 'Poll not found' });
    }

    if (req.method === 'GET') {
      // Fetch all comments for this poll
      const comments = await CommentModel.find({ pollId })
        .populate('userId', 'name')
        .sort({ createdAt: -1 })
        .lean();

      // Transform to API format
      const formattedComments: Comment[] = comments.map(comment => ({
        id: comment._id.toString(),
        pollId: pollId,
        userId: ((comment.userId as any)?._id || comment.userId).toString(),
        author: (comment.userId as any)?.name || 'Unknown User',
        content: comment.content,
        timestamp: comment.createdAt.toISOString(),
        likes: comment.likeCount
      }));

      return res.status(200).json(formattedComments);
    }

    if (req.method === 'POST') {
      // Check if poll is expired
      if (isPollExpired(poll.expiresAt)) {
        return res.status(403).json({ 
          error: 'This poll has expired. You cannot add comments to expired polls.' 
        });
      }

      // Extract token from Authorization header
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const token = authHeader.substring(7);

      // Verify token
      let decoded: JWTPayload;
      try {
        decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
      } catch (error) {
        return res.status(401).json({ error: 'Invalid or expired token' });
      }

      const { content }: CreateCommentRequest = req.body;

      if (!content || content.trim().length === 0) {
        return res.status(400).json({ error: 'Comment content is required' });
      }

      if (content.length > 1000) {
        return res.status(400).json({ error: 'Comment is too long (max 1000 characters)' });
      }

      // Verify user exists
      const user = await UserModel.findById(decoded.userId);
      if (!user) {
        return res.status(401).json({ error: 'User not found' });
      }

      // Create new comment
      const newComment = await CommentModel.create({
        pollId: poll._id,
        userId: user._id,
        content: content.trim(),
        likeCount: 0
      });

      // Populate user for response
      await newComment.populate('userId', 'name');

      const formattedComment: Comment = {
        id: (newComment._id as any).toString(),
        pollId: pollId,
        userId: (user._id as any).toString(),
        author: user.name,
        content: newComment.content,
        timestamp: newComment.createdAt.toISOString(),
        likes: newComment.likeCount
      };

      return res.status(201).json({
        success: true,
        comment: formattedComment
      });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Error handling comments:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
