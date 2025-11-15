import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IPollOption {
  _id: mongoose.Types.ObjectId;
  text: string;
  voteCount: number;
}

export interface IPoll extends Document {
  question: string;
  options: IPollOption[];
  totalVotes: number;
  category: string;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const PollOptionSchema = new Schema({
  text: {
    type: String,
    required: true,
  },
  voteCount: {
    type: Number,
    default: 0,
  },
});

const PollSchema: Schema = new Schema(
  {
    question: {
      type: String,
      required: true,
      trim: true,
    },
    options: {
      type: [PollOptionSchema],
      required: true,
      validate: {
        validator: function(options: IPollOption[]) {
          return options.length >= 2;
        },
        message: 'A poll must have at least 2 options'
      }
    },
    totalVotes: {
      type: Number,
      default: 0,
    },
    category: {
      type: String,
      required: true,
      index: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient querying
PollSchema.index({ category: 1, expiresAt: 1 });
PollSchema.index({ createdAt: -1 });

const Poll: Model<IPoll> = mongoose.models.Poll || mongoose.model<IPoll>('Poll', PollSchema);

export default Poll;

