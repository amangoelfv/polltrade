import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export interface IComment extends Document {
  pollId: Types.ObjectId;
  userId: Types.ObjectId;
  content: string;
  likeCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const CommentSchema: Schema = new Schema(
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
    content: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000,
    },
    likeCount: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for efficient querying of poll comments
CommentSchema.index({ pollId: 1, createdAt: -1 });

const Comment: Model<IComment> = mongoose.models.Comment || mongoose.model<IComment>('Comment', CommentSchema);

export default Comment;

