import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export interface IPollResponse extends Document {
  pollId: Types.ObjectId;
  userId: Types.ObjectId;
  optionId: Types.ObjectId; // References the option._id within the poll
  createdAt: Date;
  updatedAt: Date;
}

const PollResponseSchema: Schema = new Schema(
  {
    pollId: {
      type: Schema.Types.ObjectId,
      ref: 'Poll',
      required: true,
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    optionId: {
      type: Schema.Types.ObjectId,
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound unique index - one response per user per poll
PollResponseSchema.index({ pollId: 1, userId: 1 }, { unique: true });

// Index for efficient counting of responses
PollResponseSchema.index({ pollId: 1, optionId: 1 });

const PollResponse: Model<IPollResponse> = mongoose.models.PollResponse || mongoose.model<IPollResponse>('PollResponse', PollResponseSchema);

export default PollResponse;

