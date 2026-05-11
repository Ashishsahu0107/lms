import jwt from 'jsonwebtoken';

const generateToken = (payload) => {
  // Prefer JWT_SECRET from env. For local development, use a safe fallback
  // so the app doesn't crash on startup.
  const secret = process.env.JWT_SECRET || 'dev_jwt_secret';

  // eslint-disable-next-line no-console
  if (!process.env.JWT_SECRET) console.warn('Warning: JWT_SECRET is not set. Using development fallback (dev_jwt_secret).');

  if (!secret) {
    throw new Error('JWT_SECRET environment variable is not set.');
  }


  return jwt.sign(payload, secret, {
    expiresIn: process.env.JWT_EXPIRE || '30d',
  });
};

export default generateToken;
