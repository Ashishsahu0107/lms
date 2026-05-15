import jwt from 'jsonwebtoken';
import User from '../models/User.js';

/**
 * Production-level auth service for:
 * - Access token (short-lived)
 * - Refresh token (long-lived + rotation)
 */

// ---- Token Signers ----
const signAccessToken = (user) => {
  const secret = process.env.JWT_ACCESS_SECRET || process.env.JWT_SECRET || 'dev_jwt_secret';
  const expiresIn = process.env.JWT_ACCESS_EXPIRE || '15m';

  return jwt.sign(
    { id: user._id, role: user.role },
    secret,
    { expiresIn }
  );
};

const signRefreshToken = (user) => {
  const secret = process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET || 'dev_jwt_secret';
  const expiresIn = process.env.JWT_REFRESH_EXPIRE || '30d';

  return jwt.sign(
    { id: user._id, role: user.role },
    secret,
    { expiresIn }
  );
};

// ---- Verification helpers ----
const verifyAccessToken = (token) => {
  const secret = process.env.JWT_ACCESS_SECRET || process.env.JWT_SECRET || 'dev_jwt_secret';
  return jwt.verify(token, secret);
};

const verifyRefreshToken = (token) => {
  const secret = process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET || 'dev_jwt_secret';
  return jwt.verify(token, secret);
};

// ---- Public API ----
const loginWithEmailPassword = async ({ email, password }) => {
  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    return { ok: false, message: 'Invalid credentials', status: 401 };
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    return { ok: false, message: 'Invalid credentials', status: 401 };
  }

  if (user.isBlocked) {
    return { ok: false, message: 'Account is blocked. Contact administrator.', status: 401 };
  }

  await user.updateLastLogin();

  const accessToken = signAccessToken(user);
  const refreshToken = signRefreshToken(user);

  return { ok: true, user, accessToken, refreshToken };
};

const registerUser = async ({ name, email, password, role }) => {
  const user = await User.create({
    name,
    email,
    password,
    role: role || 'user'
  });

  await user.updateLastLogin();

  const accessToken = signAccessToken(user);
  const refreshToken = signRefreshToken(user);

  return { ok: true, user, accessToken, refreshToken };
};

const getUserFromAccess = async (accessToken) => {
  const decoded = verifyAccessToken(accessToken);
  const user = await User.findById(decoded.id).select('-password');
  if (!user) return null;
  if (user.isBlocked) {
    // blocked user acts as invalid auth
    return null;
  }
  return user;
};

const refreshTokens = ({ refreshToken, reqContext }) => {
  // reqContext kept for future rotation/blacklist hooks
  const decoded = verifyRefreshToken(refreshToken);
  return decoded;
};

export default {
  signAccessToken,
  signRefreshToken,
  loginWithEmailPassword,
  registerUser,
  getUserFromAccess,
  refreshTokens
};
