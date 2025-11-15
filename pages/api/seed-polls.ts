import type { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '../../lib/mongodb';
import Poll from '../../models/Poll';

interface SeedResponse {
  success: boolean;
  message: string;
  count?: number;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<SeedResponse>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false, 
      message: 'Method not allowed' 
    });
  }

  try {
    await connectDB();

    // Clear existing polls (optional - remove in production)
    await Poll.deleteMany({});

    const polls = [
      {
        question: 'Who will win the IPL 2025 Finals?',
        options: [
          { text: 'PBKS (Punjab Kings)', voteCount: 4500 },
          { text: 'RCB (Royal Challengers Bangalore)', voteCount: 5500 }
        ],
        totalVotes: 10000,
        category: 'Sports',
        expiresAt: new Date('2025-05-31T23:59:00Z')
      },
      {
        question: 'Will Gold cross ₹100,000 before June 2025?',
        options: [
          { text: 'Yes', voteCount: 7200 },
          { text: 'No', voteCount: 2800 }
        ],
        totalVotes: 10000,
        category: 'Finance',
        expiresAt: new Date('2025-05-31T23:59:00Z')
      },
      {
        question: 'Will Bitcoin reach $150,000 in 2025?',
        options: [
          { text: 'Yes', voteCount: 6000 },
          { text: 'No', voteCount: 4000 }
        ],
        totalVotes: 10000,
        category: 'Cryptocurrency',
        expiresAt: new Date('2025-12-31T23:59:00Z')
      },
      {
        question: 'Who will win the 2025 ICC Champions Trophy?',
        options: [
          { text: 'India', voteCount: 4000 },
          { text: 'Australia', voteCount: 3000 },
          { text: 'England', voteCount: 2000 },
          { text: 'Other', voteCount: 1000 }
        ],
        totalVotes: 10000,
        category: 'Sports',
        expiresAt: new Date('2025-03-15T23:59:00Z')
      },
      {
        question: 'Will Apple launch a foldable iPhone in 2025?',
        options: [
          { text: 'Yes', voteCount: 3500 },
          { text: 'No', voteCount: 6500 }
        ],
        totalVotes: 10000,
        category: 'Technology',
        expiresAt: new Date('2025-12-31T23:59:00Z')
      },
      {
        question: 'Indian Rupee vs US Dollar by end of 2025?',
        options: [
          { text: 'Below ₹80', voteCount: 2000 },
          { text: '₹80-₹85', voteCount: 4500 },
          { text: 'Above ₹85', voteCount: 3500 }
        ],
        totalVotes: 10000,
        category: 'Finance',
        expiresAt: new Date('2025-12-31T23:59:00Z')
      },
      {
        question: 'Will Tesla stock reach $500 in 2025?',
        options: [
          { text: 'Yes', voteCount: 5500 },
          { text: 'No', voteCount: 4500 }
        ],
        totalVotes: 10000,
        category: 'Stocks',
        expiresAt: new Date('2025-12-31T23:59:00Z')
      },
      {
        question: 'Will India host the Olympics before 2040?',
        options: [
          { text: 'Yes', voteCount: 7000 },
          { text: 'No', voteCount: 3000 }
        ],
        totalVotes: 10000,
        category: 'Sports',
        expiresAt: new Date('2026-12-31T23:59:00Z')
      },
      {
        question: 'Will AI replace 50% of programming jobs by 2030?',
        options: [
          { text: 'Yes', voteCount: 4000 },
          { text: 'No', voteCount: 6000 }
        ],
        totalVotes: 10000,
        category: 'Technology',
        expiresAt: new Date('2029-12-31T23:59:00Z')
      },
      {
        question: 'Who will win the 2025 FIFA Club World Cup?',
        options: [
          { text: 'Real Madrid', voteCount: 3500 },
          { text: 'Manchester City', voteCount: 3000 },
          { text: 'Bayern Munich', voteCount: 2000 },
          { text: 'Other', voteCount: 1500 }
        ],
        totalVotes: 10000,
        category: 'Sports',
        expiresAt: new Date('2025-07-31T23:59:00Z')
      },
      {
        question: 'Will Ethereum reach $10,000 in 2025?',
        options: [
          { text: 'Yes', voteCount: 5000 },
          { text: 'No', voteCount: 5000 }
        ],
        totalVotes: 10000,
        category: 'Cryptocurrency',
        expiresAt: new Date('2025-12-31T23:59:00Z')
      },
      {
        question: 'Will remote work become permanent for most tech companies?',
        options: [
          { text: 'Yes', voteCount: 6500 },
          { text: 'No', voteCount: 3500 }
        ],
        totalVotes: 10000,
        category: 'Technology',
        expiresAt: new Date('2026-12-31T23:59:00Z')
      },
      {
        question: 'Nifty 50 index by end of 2025?',
        options: [
          { text: 'Below 25,000', voteCount: 2000 },
          { text: '25,000-30,000', voteCount: 4000 },
          { text: 'Above 30,000', voteCount: 4000 }
        ],
        totalVotes: 10000,
        category: 'Stocks',
        expiresAt: new Date('2025-12-31T23:59:00Z')
      },
      {
        question: 'Will SpaceX land humans on Mars by 2030?',
        options: [
          { text: 'Yes', voteCount: 3500 },
          { text: 'No', voteCount: 6500 }
        ],
        totalVotes: 10000,
        category: 'Technology',
        expiresAt: new Date('2029-12-31T23:59:00Z')
      },
      {
        question: 'Will India win a medal in FIFA World Cup 2026?',
        options: [
          { text: 'Yes', voteCount: 2000 },
          { text: 'No', voteCount: 8000 }
        ],
        totalVotes: 10000,
        category: 'Sports',
        expiresAt: new Date('2026-07-31T23:59:00Z')
      },
      {
        question: 'Will electric vehicles be the majority of new car sales in India by 2030?',
        options: [
          { text: 'Yes', voteCount: 6000 },
          { text: 'No', voteCount: 4000 }
        ],
        totalVotes: 10000,
        category: 'Technology',
        expiresAt: new Date('2029-12-31T23:59:00Z')
      },
      {
        question: 'Will Reliance stock cross ₹4000 in 2025?',
        options: [
          { text: 'Yes', voteCount: 5500 },
          { text: 'No', voteCount: 4500 }
        ],
        totalVotes: 10000,
        category: 'Stocks',
        expiresAt: new Date('2025-12-31T23:59:00Z')
      },
      {
        question: 'Will cricket be included in the 2028 Olympics?',
        options: [
          { text: 'Yes', voteCount: 7500 },
          { text: 'No', voteCount: 2500 }
        ],
        totalVotes: 10000,
        category: 'Sports',
        expiresAt: new Date('2027-12-31T23:59:00Z')
      },
      {
        question: 'Will quantum computers solve major real-world problems by 2030?',
        options: [
          { text: 'Yes', voteCount: 5500 },
          { text: 'No', voteCount: 4500 }
        ],
        totalVotes: 10000,
        category: 'Technology',
        expiresAt: new Date('2029-12-31T23:59:00Z')
      },
      {
        question: 'Test: Expired Poll (for testing)',
        options: [
          { text: 'Option A', voteCount: 5000 },
          { text: 'Option B', voteCount: 5000 }
        ],
        totalVotes: 10000,
        category: 'Test',
        expiresAt: new Date('2024-11-05T23:59:00Z')
      }
    ];

    const createdPolls = await Poll.insertMany(polls);

    console.log(`✅ Successfully seeded ${createdPolls.length} polls`);

    return res.status(200).json({
      success: true,
      message: `Successfully seeded ${createdPolls.length} polls`,
      count: createdPolls.length
    });
  } catch (error) {
    console.error('Error seeding polls:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to seed polls',
    });
  }
}
