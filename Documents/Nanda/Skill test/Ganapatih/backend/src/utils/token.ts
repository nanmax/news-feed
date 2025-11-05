import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { query } from '../database/config';
import { JWTPayload, TokenResponse } from '../types';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'fallback_refresh_secret';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1h';
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '7d';

export const generateTokens = async (payload: JWTPayload): Promise<TokenResponse> => {
  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN } as jwt.SignOptions);
  
  const refreshToken = crypto.randomBytes(64).toString('hex');
  
  const expiresAt = new Date();
  const refreshExpiresInMs = parseTimeToMs(JWT_REFRESH_EXPIRES_IN);
  expiresAt.setTime(expiresAt.getTime() + refreshExpiresInMs);
  
  await query(
    'INSERT INTO refresh_tokens (token, user_id, expires_at) VALUES ($1, $2, $3)',
    [refreshToken, payload.id, expiresAt]
  );
  
  return {
    token,
    refreshToken,
    expiresIn: JWT_EXPIRES_IN
  };
};

export const verifyAccessToken = (token: string): JWTPayload => {
  return jwt.verify(token, JWT_SECRET) as JWTPayload;
};

export const verifyRefreshToken = async (refreshToken: string): Promise<JWTPayload | null> => {
  try {
    const result = await query(
      `SELECT rt.user_id, u.username 
       FROM refresh_tokens rt
       JOIN users u ON rt.user_id = u.id
       WHERE rt.token = $1 
       AND rt.expires_at > NOW() 
       AND rt.is_revoked = FALSE`,
      [refreshToken]
    );
    
    if (result.rows.length === 0) {
      return null;
    }
    
    const user = result.rows[0];
    return {
      id: user.user_id,
      username: user.username
    };
  } catch (error) {
    console.error('Error verifying refresh token:', error);
    return null;
  }
};

export const revokeRefreshToken = async (refreshToken: string): Promise<void> => {
  await query(
    'UPDATE refresh_tokens SET is_revoked = TRUE WHERE token = $1',
    [refreshToken]
  );
};

export const revokeAllUserTokens = async (userId: number): Promise<void> => {
  await query(
    'UPDATE refresh_tokens SET is_revoked = TRUE WHERE user_id = $1 AND is_revoked = FALSE',
    [userId]
  );
};

export const cleanupExpiredTokens = async (): Promise<void> => {
  await query(
    'DELETE FROM refresh_tokens WHERE expires_at < NOW() OR is_revoked = TRUE'
  );
};

const parseTimeToMs = (timeStr: string): number => {
  const unit = timeStr.slice(-1);
  const value = parseInt(timeStr.slice(0, -1));
  
  switch (unit) {
    case 's': return value * 1000;
    case 'm': return value * 60 * 1000;
    case 'h': return value * 60 * 60 * 1000;
    case 'd': return value * 24 * 60 * 60 * 1000;
    default: return 60 * 60 * 1000; // Default 1 hour
  }
};