import type { NextApiRequest, NextApiResponse } from 'next';
import jwt from 'jsonwebtoken';
import type { CompleteProfileRequest, CompleteProfileResponse, TempJWTPayload, JWTPayload, User } from '../../../types/auth';
import connectDB from '../../../lib/mongodb';
import UserModel from '../../../models/User';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRES_IN = '7d'; // Token expires in 7 days

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<CompleteProfileResponse>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false, 
      message: 'Method not allowed' 
    });
  }

  try {
    // Connect to MongoDB
    await connectDB();

    const { name, tempToken }: CompleteProfileRequest = req.body;

    // Validate input
    if (!name || !tempToken) {
      return res.status(400).json({ 
        success: false, 
        message: 'Name and token are required' 
      });
    }

    if (name.trim().length < 2) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please enter a valid name (minimum 2 characters)' 
      });
    }

    // Verify temporary token
    let decoded: TempJWTPayload;
    try {
      decoded = jwt.verify(tempToken, JWT_SECRET) as TempJWTPayload;
    } catch (error) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid or expired token. Please start again.' 
      });
    }

    // Validate that it's a temporary token
    if (!decoded.temp || !decoded.mobileNumber) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid token. Please start again.' 
      });
    }

    // Check if user already exists (shouldn't happen, but safeguard)
    const existingUser = await UserModel.findOne({ mobileNumber: decoded.mobileNumber });
    
    if (existingUser) {
      return res.status(400).json({ 
        success: false, 
        message: 'User already exists. Please login.' 
      });
    }

    // Create new user
    const newUser = await UserModel.create({
      name: name.trim(),
      mobileNumber: decoded.mobileNumber,
    });

    // Create user object for response
    const user: User = {
      id: (newUser._id as any).toString(),
      name: newUser.name,
      mobileNumber: newUser.mobileNumber,
      createdAt: newUser.createdAt.toISOString()
    };

    // Generate permanent JWT token
    const payload: JWTPayload = {
      userId: user.id,
      mobileNumber: user.mobileNumber,
      name: user.name
    };

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

    console.log(`New user profile created: ${user.name} (${user.mobileNumber})`);

    return res.status(200).json({
      success: true,
      message: 'Profile created successfully',
      user,
      token
    });
  } catch (error) {
    console.error('Error in complete-profile:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error. Please try again.',
    });
  }
}

