export interface PollOption {
  id: string;
  text: string;
  votePercentage: number;
}

export interface Poll {
  id: string;
  question: string;
  options: PollOption[];
  totalVotes: number;
  category: string;
  expiresAt: string;
}

