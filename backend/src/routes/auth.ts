import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { query } from '../database/config';
import { registerSchema, loginSchema, refreshTokenSchema } from '../validation/schemas';
import { UserRegistration, UserLogin, UserResponse, TokenResponse, RefreshTokenRequest, RefreshTokenResponse } from '../types';
import { generateTokens, verifyRefreshToken, revokeRefreshToken, revokeAllUserTokens } from '../utils/token';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = Router();

router.post('/register', async (req: Request, res: Response): Promise<void> => {
  try {
    const { error, value } = registerSchema.validate(req.body);
    if (error) {
      res.status(400).json({ error: error.details[0].message });
      return;
    }

    const { username, password }: UserRegistration = value;

    const existingUser = await query('SELECT id FROM users WHERE username = $1', [username]);
    if (existingUser.rows.length > 0) {
      res.status(409).json({ error: 'Username already exists' });
      return;
    }

    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    const result = await query(
      'INSERT INTO users (username, password_hash) VALUES ($1, $2) RETURNING id, username',
      [username, passwordHash]
    );

    const newUser: UserResponse = {
      id: result.rows[0].id,
      username: result.rows[0].username
    };

    res.status(201).json(newUser);
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/login', async (req: Request, res: Response): Promise<void> => {
  try {
    const { error, value } = loginSchema.validate(req.body);
    if (error) {
      res.status(400).json({ error: error.details[0].message });
      return;
    }

    const { username, password }: UserLogin = value;

    const result = await query('SELECT id, username, password_hash FROM users WHERE username = $1', [username]);
    
    if (result.rows.length === 0) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    const user = result.rows[0];

    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    await revokeAllUserTokens(user.id);

    const tokens = await generateTokens({
      id: user.id,
      username: user.username
    });

    res.status(200).json(tokens);
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/refresh-token', async (req: Request, res: Response): Promise<void> => {
  try {
    const { error, value } = refreshTokenSchema.validate(req.body);
    if (error) {
      res.status(400).json({ error: error.details[0].message });
      return;
    }

    const { refreshToken }: RefreshTokenRequest = value;

    const userData = await verifyRefreshToken(refreshToken);
    if (!userData) {
      res.status(401).json({ error: 'Invalid or expired refresh token' });
      return;
    }

    await revokeRefreshToken(refreshToken);

    const tokens = await generateTokens(userData);

    const response: RefreshTokenResponse = {
      token: tokens.token,
      expiresIn: tokens.expiresIn
    };

    res.status(200).json(response);
  } catch (error) {
    console.error('Refresh token error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/logout', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    
    await revokeAllUserTokens(userId);
    
    res.status(200).json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;