import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";

import {
  findUserByEmail,
  findUserByPhone,
  createUser,
  updateLastLogin,
  findRefreshToken,
  revokeRefreshToken,
  createRefreshToken,
} from "./auth.repository.js";

const CUSTOMER_USER_TYPE_ID = 1;

export const customerSignupService = async ({
  name,
  email,
  phone,
  password,
}) => {
  const normalizedEmail = email.trim().toLowerCase();

  const existingEmail = await findUserByEmail(normalizedEmail);

  if (existingEmail) {
    throw new Error("EMAIL_ALREADY_EXISTS");
  }

  if (phone) {
    const existingPhone = await findUserByPhone(phone);

    if (existingPhone) {
      throw new Error("PHONE_ALREADY_EXISTS");
    }
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const user = await createUser({
    name: name.trim(),
    email: normalizedEmail,
    phone: phone || null,
    passwordHash,
    userTypeId: CUSTOMER_USER_TYPE_ID,
  });

  const tokens = await createAuthTokens(user);

  return {
    message: "Customer account created successfully",
    user,
    ...tokens,
  };
};

export const customerLoginService = async ({ email, password }) => {
  const normalizedEmail = email.trim().toLowerCase();

  const user = await findUserByEmail(normalizedEmail);

  if (!user) {
    throw new Error("INVALID_CREDENTIALS");
  }

  if (!user.isActive) {
    throw new Error("ACCOUNT_INACTIVE");
  }

  if (user.userTypeId !== CUSTOMER_USER_TYPE_ID) {
    throw new Error("INVALID_CREDENTIALS");
  }

  if (!user.passwordHash) {
    throw new Error("INVALID_CREDENTIALS");
  }

  const passwordMatch = await bcrypt.compare(password, user.passwordHash);

  if (!passwordMatch) {
    throw new Error("INVALID_CREDENTIALS");
  }

  await updateLastLogin(user.id);

  const tokens = await createAuthTokens(user);

  const { passwordHash, ...safeUser } = user;

  return {
    message: "Login successful",
    user: safeUser,
    ...tokens,
  };
};

export const refreshAccessTokenService = async (refreshToken) => {
  if (!refreshToken) {
    throw new Error("REFRESH_TOKEN_REQUIRED");
  }

  let payload;

  try {
    payload = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
  } catch {
    throw new Error("INVALID_REFRESH_TOKEN");
  }

  const tokenHash = hashToken(refreshToken);

  const storedToken = await findRefreshToken(tokenHash);

  if (!storedToken) {
    throw new Error("INVALID_REFRESH_TOKEN");
  }

  const accessToken = generateAccessToken({
    id: payload.userId,
    userTypeId: payload.userTypeId,
  });

  return {
    accessToken,
  };
};

export const logoutService = async (refreshToken) => {
  if (!refreshToken) {
    throw new Error("REFRESH_TOKEN_REQUIRED");
  }

  const tokenHash = hashToken(refreshToken);

  const storedToken = await findRefreshToken(tokenHash);

  if (storedToken) {
    await revokeRefreshToken(storedToken.id);
  }

  return {
    message: "Logout successful",
  };
};

const createAuthTokens = async (user) => {
  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  const tokenHash = hashToken(refreshToken);

  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

  await createRefreshToken({
    userId: user.id,
    tokenHash,
    expiresAt,
  });

  return {
    accessToken,
    refreshToken,
  };
};

const generateAccessToken = (user) => {
  return jwt.sign(
    {
      userId: user.id,
      userTypeId: user.userTypeId,
    },
    process.env.JWT_ACCESS_SECRET,
    {
      expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || "15m",
    }
  );
};

const generateRefreshToken = (user) => {
  return jwt.sign(
    {
      userId: user.id,
      userTypeId: user.userTypeId,
    },
    process.env.JWT_REFRESH_SECRET,
    {
      expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "30d",
    }
  );
};

const hashToken = (token) => {
  return crypto.createHash("sha256").update(token).digest("hex");
};
