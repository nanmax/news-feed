import { Router, Response } from 'express';
import { query } from '../database/config';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { postSchema } from '../validation/schemas';
import { PostRequest, PostResponse } from '../types';

const router = Router();

router.post('/posts', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { error, value } = postSchema.validate(req.body);
    if (error) {
      res.status(422).json({ error: error.details[0].message });
      return;
    }

    const { content }: PostRequest = value;
    const userId = req.user!.id;

    const result = await query(
      `INSERT INTO posts (user_id, content) VALUES ($1, $2) 
       RETURNING id, user_id, content, created_at`,
      [userId, content]
    );

    const userResult = await query(
      'SELECT username FROM users WHERE id = $1',
      [userId]
    );

    const post = result.rows[0];
    const response: PostResponse = {
      id: post.id,
      userid: post.user_id,
      username: userResult.rows[0].username,
      content: post.content,
      createdat: post.created_at.toISOString()
    };

    res.status(201).json(response);
  } catch (error) {
    console.error('Create post error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;