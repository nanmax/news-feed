import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { JWTPayload } from '../types';

export interface AuthRequest extends Request {
  user?: {
    id: number;
    username: string;
  };
}

export const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction): void => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    res.status(401).json({ error: 'Access token required' });
    return;
  }

  const jwtSecret = process.env.JWT_SECRET || 'fallback-secret-key';

  jwt.verify(token, jwtSecret, (err: any, decoded: any) => {
    if (err) {
      res.status(401).json({ error: 'Invalid or expired token' });
      return;
    }

    const payload = decoded as JWTPayload;
    req.user = {
      id: payload.id,
      username: payload.username
    };
    
    next();
  });
};