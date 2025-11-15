import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IOtp extends Document {
  mobileNumber: string;
  otp: string;
  attempts: number;
  expiresAt: Date;
  createdAt: Date;
}

const OtpSchema: Schema = new Schema({
  mobileNumber: {
    type: String,
    required: true,
    index: true,
  },
  otp: {
    type: String,
    required: true,
  },
  attempts: {
    type: Number,
    default: 0,
  },
  expiresAt: {
    type: Date,
    required: true,
    index: { expires: 0 }, // TTL index - MongoDB will auto-delete expired documents
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Create compound index for efficient querying
OtpSchema.index({ mobileNumber: 1, expiresAt: 1 });

const Otp: Model<IOtp> = mongoose.models.Otp || mongoose.model<IOtp>('Otp', OtpSchema);

export default Otp;

