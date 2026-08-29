import bcrypt from "bcrypt";
import User, { IUser } from "../../models/user.model.js";
import Session from "../../models/session.model.js";

import AppError from "../../error/AppError.js";
import {
  generateAccessToken,
  generateSecurityToken,
  hashToken,
} from "../../utils/jwt.js";
import { dummyHash, TOKEN_EXPIRATION } from "./auth.constants.js";
import type { RegisterInput } from "./auth.validation.js";
import { HydratedDocument } from "mongoose";

import Plan from "../../models/plan.model.js";
import Subscription from "../../models/subscription.model.js";

const register = async ({ data }: { data: RegisterInput }) => {
  let freePlan: any = null;
  if (data.role === "employer") {
    freePlan = await Plan.findOne({ name: "Free" });
    if (!freePlan)
      throw new AppError("Default Free Plan not configured on server", 500);
  }

  const hashedPassword = await bcrypt.hash(data.password, 12);

  const userData: any = {
    name: data.name,
    email: data.email,
    password: hashedPassword,
    role: data.role,
    is_blocked: false,
  };

  if (data.role === "employer") {
    const employerProfile = data.employerProfile || {};
    userData.employerProfile = {
      company_name: employerProfile.company_name || "New Company",
      company_logo: employerProfile.company_logo || "",
      description: employerProfile.description || "No description yet",
      industry: employerProfile.industry || "Not specified",
      website: employerProfile.website || "",
    };
  }

  if (data.role === "candidate") {
    const candidateProfile = data.candidateProfile || {};
    userData.candidateProfile = {
      headline: candidateProfile.headline || "New Candidate",
      bio: candidateProfile.bio || "No bio yet",
      location: candidateProfile.location || "",
      portfolio_url: candidateProfile.portfolio_url || "",
      resume: candidateProfile.resume || "pending",
      skills: candidateProfile.skills || [],
      experience_level: candidateProfile.experience_level || "entry",
    };
  }

  let newUser: any;
  try {
    newUser = await User.create(userData);
  } catch (error: any) {
    if (error?.code === 11000) throw new AppError("Email already exists", 409);
    throw error;
  }

  if (data.role === "employer") {
    try {
      const existingSub = await Subscription.findOne({
        employer_id: newUser._id,
      });
      if (!existingSub) {
        const now = new Date();
        const currentPeriodEnd = new Date(
          now.getTime() + 30 * 24 * 60 * 60 * 1000,
        );
        await Subscription.create({
          employer_id: newUser._id,
          plan_id: freePlan._id,
          billing_cycle: "monthly",
          status: "active",
          current_period_start: now,
          current_period_end: currentPeriodEnd,
        });
      }
    } catch (subError) {
      await User.deleteOne({ _id: newUser._id });
      throw subError;
    }
  }

  return {
    message: "User registered successfully.",
  };
};

interface LoginInput {
  email: string;
  password: string;
}

const login = async ({ data }: { data: LoginInput }) => {
  const { email, password } = data;

  const user = await User.findOne({ email }).lean();

  const isMatch = await bcrypt.compare(password, user?.password || dummyHash);

  if (!user || !isMatch) throw new AppError("Invalid email or password", 401);

  if (user.is_blocked)
    throw new AppError("Your account has been blocked.", 403);

  const { rawToken, hashedToken } = generateSecurityToken();
  const session = await Session.create({
    user_id: user._id,
    refresh_token: hashedToken,
    expires_at: new Date(Date.now() + TOKEN_EXPIRATION.refresh_token),
  });
  const accessToken = generateAccessToken({
    userId: user._id.toString(),
    role: user.role,
    sessionId: session._id.toString(),
  });

  const profile =
    user.role === "employer" ? user.employerProfile : user.candidateProfile;

  return {
    accessToken,
    accessTokenExpiresIn: TOKEN_EXPIRATION.access_token / 1000,
    refreshToken: rawToken,
    user: {
      id: user._id,
      name: user.name,
      role: user.role,
      profile,
    },
  };
};

const logout = async ({ sessionId }: { sessionId: string }) => {
  const result = await Session.updateOne(
    { _id: sessionId, revoked_at: null },
    { revoked_at: new Date() },
  );

  if (!result.matchedCount) throw new AppError("Unauthorized", 401);

  return true;
};

const refreshToken = async ({ refreshToken }: { refreshToken: string }) => {
  const hashedToken = hashToken(refreshToken);

  const session = await Session.findOne({
    refresh_token: hashedToken,
    revoked_at: null,
    expires_at: {
      $gt: new Date(),
    },
  }).populate<{ user_id: any }>("user_id");

  if (!session) throw new AppError("Invalid or expired refresh token", 401);

  const user = session.user_id;

  if (!user) throw new AppError("User not found", 404);

  if (user.is_blocked)
    throw new AppError("Your account has been blocked.", 403);

  const { rawToken, hashedToken: newHashedToken } = generateSecurityToken();

  session.refresh_token = newHashedToken;
  session.expires_at = new Date(Date.now() + TOKEN_EXPIRATION.refresh_token);
  session.last_used_at = new Date();

  await session.save();

  return {
    accessToken: generateAccessToken({
      userId: user._id.toString(),
      role: user.role,
      sessionId: session._id.toString(),
    }),
    accessTokenExpiresIn: TOKEN_EXPIRATION.access_token / 1000,
    refreshToken: rawToken,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      profile:
        user.role === "employer" ? user.employerProfile : user.candidateProfile,
    },
  };
};

export const me = ({ user }: { user: HydratedDocument<IUser> }) => {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    profile:
      user.role === "employer" ? user.employerProfile : user.candidateProfile,
  };
};

export { register, login, logout, refreshToken };
