export interface Comment {
  id: string;
  pollId: string;
  userId: string;
  author: string;
  content: string;
  timestamp: string;
  likes: number;
}

export interface CreateCommentRequest {
  content: string;
}

