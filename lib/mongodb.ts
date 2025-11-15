import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/polltrade';

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable');
}

/**
 * Connect to MongoDB using Mongoose
 * Mongoose maintains its own connection pool and handles reconnection automatically
 * We only need to connect once - subsequent calls will reuse the existing connection
 */
async function connectDB(): Promise<typeof mongoose> {
  // Check if already connected
  if (mongoose.connection.readyState === 1) {
    return mongoose;
  }

  // Check if connecting
  if (mongoose.connection.readyState === 2) {
    // Wait for the connection to be established
    return new Promise((resolve, reject) => {
      mongoose.connection.once('connected', () => resolve(mongoose));
      mongoose.connection.once('error', reject);
    });
  }

  // Connect to MongoDB
  try {
    await mongoose.connect(MONGODB_URI, {
      bufferCommands: false, // Disable buffering to fail fast if not connected
    });
    console.log('✅ MongoDB connected successfully');
    return mongoose;
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    throw error;
  }
}

export default connectDB;
