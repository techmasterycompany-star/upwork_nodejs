import { Schema, model, Types } from "mongoose";

export interface IEmployerProfile {
  company_name: string;
  company_logo?: string;
  description: string;
  industry: string;
  website?: string;
}

export interface ICandidateSkill {
  skill_id: Types.ObjectId;
}

export interface ICandidateProfile {
  headline: string;
  bio: string;
  location?: string;
  portfolio_url?: string;
  resume: string;
  skills: ICandidateSkill[];
  experience_level: "entry" | "junior" | "mid" | "senior" | "lead";
}

export type UserRole = "admin" | "employer" | "candidate";

export interface IUser {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  employerProfile?: IEmployerProfile;
  candidateProfile?: ICandidateProfile;
  is_blocked: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

const EmployerProfileSchema = new Schema<IEmployerProfile>(
  {
    company_name: { type: String, required: true, trim: true },
    company_logo: String,
    description: { type: String, required: true, trim: true, maxlength: 2000 },
    industry: { type: String, required: true, trim: true },
    website: { type: String, trim: true },
  },
  { _id: false },
);

const CandidateSkillSchema = new Schema<ICandidateSkill>(
  {
    skill_id: {
      type: Schema.Types.ObjectId,
      ref: "Skill",
      required: true,
    },
  },
  { _id: false },
);

const CandidateProfileSchema = new Schema<ICandidateProfile>(
  {
    headline: { type: String, trim: true, required: true },
    bio: { type: String, trim: true, maxlength: 2000, required: true },
    location: { type: String, trim: true },
    portfolio_url: { type: String, trim: true },
    resume: { type: String, required: true },
    skills: [CandidateSkillSchema],
    experience_level: {
      type: String,
      enum: ["entry", "junior", "mid", "senior", "lead"],
      required: true,
    },
  },
  { _id: false },
);

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ["admin", "employer", "candidate"],
      required: true,
    },
    employerProfile: {
      type: EmployerProfileSchema,
      required(this: IUser) {
        return this.role === "employer";
      },
    },
    candidateProfile: {
      type: CandidateProfileSchema,
      required(this: IUser) {
        return this.role === "candidate";
      },
    },
    is_blocked: { type: Boolean, default: false },
  },
  { timestamps: true, versionKey: false },
);

UserSchema.pre("validate", function () {
  if (this.role === "employer") this.candidateProfile = undefined;
  if (this.role === "candidate") this.employerProfile = undefined;
  if (this.role === "admin") {
    this.employerProfile = undefined;
    this.candidateProfile = undefined;
  }
});

export default model<IUser>("User", UserSchema);
