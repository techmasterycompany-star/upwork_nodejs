import { Schema, model, Types } from "mongoose";

//interface to represnt the type of report later
interface ICommentReport {
  user_id: Types.ObjectId;
  reason?: string;
  created_at: Date;
}
export interface IComment {
  job_id: Types.ObjectId;
  user_id: Types.ObjectId;
  content: string;
  is_approved: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date | null;
  reports?: ICommentReport[];
}

const CommentSchema = new Schema<IComment>(
  {
    job_id: {
      type: Schema.Types.ObjectId,
      ref: "Job",
      required: true,
      index: true,
    },
    user_id: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    content: { type: String, required: true, trim: true, maxlength: 1000 },
    is_approved: { type: Boolean, default: true },
    deletedAt: { type: Date, default: null },
    reports: [
      {
        user_id: {
          type: Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },

        reason: {
          type: String,
          trim: true,
        },

        created_at: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  { timestamps: true, versionKey: false },
);

export default model<IComment>("Comment", CommentSchema);
