import jwt from 'jsonwebtoken';
import env from '../config/env.js';

function getCookieOptions() {
  return {
    httpOnly: true,
    secure: env.nodeEnv === 'production',
    sameSite: env.nodeEnv === 'production' ? 'none' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  };
}

export function signAuthToken(user) {
  return jwt.sign(
    {
      sub: user.id,
      role: user.role,
    },
    env.jwtSecret,
    { expiresIn: env.jwtExpiresIn }
  );
}

export function verifyAuthToken(token) {
  return jwt.verify(token, env.jwtSecret);
}

export function setAuthCookie(res, token) {
  res.cookie(env.jwtCookieName, token, getCookieOptions());
}

export function clearAuthCookie(res) {
  res.clearCookie(env.jwtCookieName, getCookieOptions());
}
