import { Schema, model, Types } from "mongoose";

export interface IJobView {
  job_id: Types.ObjectId;
  candidate_id: Types.ObjectId;
  createdAt?: Date;
}

const JobViewSchema = new Schema<IJobView>(
  {
    job_id: { type: Schema.Types.ObjectId, ref: "Job", required: true },
    candidate_id: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false }, versionKey: false },
);

JobViewSchema.index({ job_id: 1, candidate_id: 1 }, { unique: true });

export default model<IJobView>("JobView", JobViewSchema);
