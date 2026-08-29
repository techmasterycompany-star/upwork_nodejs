import { Schema, model, Types } from "mongoose";

export interface ISavedSearch {
  user_id: Types.ObjectId;
  name: string;
  filters: Record<string, any>;
  createdAt?: Date;
  updatedAt?: Date;
}

const SavedSearchSchema = new Schema<ISavedSearch>(
  {
    user_id: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    filters: {
      type: Schema.Types.Mixed,
      required: true,
    },
  },
  { timestamps: true, versionKey: false },
);

export default model<ISavedSearch>("SavedSearch", SavedSearchSchema);