import type { NextApiRequest, NextApiResponse } from 'next';
import type { SendOtpRequest, SendOtpResponse } from '../../../types/auth';
import connectDB from '../../../lib/mongodb';
import Otp from '../../../models/Otp';

const generateOtp = (): string => {
  return Math.floor(1000 + Math.random() * 9000).toString();
};

const isValidMobileNumber = (mobile: string): boolean => {
  // Validates 10-digit mobile number
  const mobileRegex = /^[6-9]\d{9}$/;
  return mobileRegex.test(mobile);
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<SendOtpResponse>
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

    const { mobileNumber }: SendOtpRequest = req.body;

    // Validate inputs
    if (!mobileNumber) {
      return res.status(400).json({ 
        success: false, 
        message: 'Mobile number is required' 
      });
    }

    const cleanMobile = mobileNumber.replace(/\s+/g, '').replace(/[^0-9]/g, '');

    if (!isValidMobileNumber(cleanMobile)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please enter a valid 10-digit mobile number' 
      });
    }

    // Generate OTP
    const otp = generateOtp();
    console.log(`OTP for ${cleanMobile}: ${otp}`);

    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    // Delete any existing OTP for this mobile number
    await Otp.deleteMany({ mobileNumber: cleanMobile });

    // Create new OTP document
    await Otp.create({
      mobileNumber: cleanMobile,
      otp,
      attempts: 0,
      expiresAt,
    });

    // In production, send OTP via SMS service (Twilio, AWS SNS, etc.)
    console.log(`OTP sent to ${cleanMobile}: ${otp}`);

    // For development/testing, include OTP in response
    // In production, remove this!
    const isDevelopment = true;
    // process.env.NODE_ENV === 'development';

    return res.status(200).json({
      success: true,
      message: `OTP sent successfully to ${cleanMobile}`,
      expiresIn: 300,
      ...(isDevelopment && { 
        // Only for development - remove in production!
        otp 
      } as any)
    });
  } catch (error) {
    console.error('Error in send-otp:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error. Please try again.',
    });
  }
}
