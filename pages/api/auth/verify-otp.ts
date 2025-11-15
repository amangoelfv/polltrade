import type { NextApiRequest, NextApiResponse } from 'next';
import jwt from 'jsonwebtoken';
import type { VerifyOtpRequest, VerifyOtpResponse, JWTPayload, TempJWTPayload, User } from '../../../types/auth';
import connectDB from '../../../lib/mongodb';
import Otp from '../../../models/Otp';
import UserModel from '../../../models/User';

const MAX_ATTEMPTS = 3;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRES_IN = '7d'; // Token expires in 7 days
const TEMP_JWT_EXPIRES_IN = '10m'; // Temporary token expires in 10 minutes

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<VerifyOtpResponse>
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

    const { mobileNumber, otp }: VerifyOtpRequest = req.body;

    // Validate input
    if (!mobileNumber || !otp) {
      return res.status(400).json({ 
        success: false, 
        message: 'Mobile number and OTP are required' 
      });
    }

    const cleanMobile = mobileNumber.replace(/\s+/g, '').replace(/[^0-9]/g, '');
    const cleanOtp = otp.replace(/\s+/g, '');

    // Find OTP document
    const otpDoc = await Otp.findOne({ 
      mobileNumber: cleanMobile,
      expiresAt: { $gt: new Date() } // Not expired
    }).sort({ createdAt: -1 }); // Get the most recent one

    console.log(`Verification attempt for ${cleanMobile}, OTP exists:`, !!otpDoc);

    if (!otpDoc) {
      return res.status(400).json({ 
        success: false, 
        message: 'OTP not found or expired. Please request a new OTP.' 
      });
    }

    // Check attempts
    if (otpDoc.attempts >= MAX_ATTEMPTS) {
      await Otp.deleteOne({ _id: otpDoc._id });
      return res.status(400).json({ 
        success: false, 
        message: 'Maximum verification attempts exceeded. Please request a new OTP.' 
      });
    }

    // Verify OTP
    if (otpDoc.otp !== cleanOtp) {
      // Increment attempts
      otpDoc.attempts += 1;
      await otpDoc.save();

      return res.status(400).json({ 
        success: false, 
        message: `Invalid OTP. ${MAX_ATTEMPTS - otpDoc.attempts} attempts remaining.` 
      });
    }

    // OTP verified successfully - delete the OTP document
    await Otp.deleteOne({ _id: otpDoc._id });

    // Check if user already exists
    const existingUser = await UserModel.findOne({ mobileNumber: cleanMobile });

    if (existingUser) {
      // Existing user - log them in directly
      const user: User = {
        id: (existingUser._id as any).toString(),
        name: existingUser.name,
        mobileNumber: existingUser.mobileNumber,
        createdAt: existingUser.createdAt.toISOString()
      };

      // Generate JWT token
      const payload: JWTPayload = {
        userId: user.id,
        mobileNumber: user.mobileNumber,
        name: user.name
      };

      const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

      console.log(`Existing user logged in: ${user.name} (${cleanMobile})`);

      return res.status(200).json({
        success: true,
        message: 'Login successful',
        user,
        token
      });
    } else {
      // New user - needs to complete profile
      const tempPayload: TempJWTPayload = {
        mobileNumber: cleanMobile,
        temp: true
      };

      const tempToken = jwt.sign(tempPayload, JWT_SECRET, { expiresIn: TEMP_JWT_EXPIRES_IN });

      console.log(`New user - OTP verified for ${cleanMobile}, needs profile completion`);

      return res.status(200).json({
        success: true,
        message: 'OTP verified. Please complete your profile.',
        needsProfile: true,
        tempToken
      });
    }
  } catch (error) {
    console.error('Error in verify-otp:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error. Please try again.',
    });
  }
}
