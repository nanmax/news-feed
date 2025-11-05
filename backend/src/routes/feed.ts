import { Router, Response } from 'express';
import { query } from '../database/config';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { paginationSchema } from '../validation/schemas';
import { FeedResponse, PostResponse } from '../types';

const router = Router();

router.get('/feed', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { error, value } = paginationSchema.validate(req.query);
    if (error) {
      res.status(400).json({ error: error.details[0].message });
      return;
    }

    const { page, limit } = value;
    const offset = (page - 1) * limit;
    const userId = req.user!.id;

    const result = await query(
      `SELECT p.id, p.user_id, u.username, p.content, p.created_at
       FROM posts p
       INNER JOIN follows f ON p.user_id = f.followee_id
       INNER JOIN users u ON p.user_id = u.id
       WHERE f.follower_id = $1
       ORDER BY p.created_at DESC
       LIMIT $2 OFFSET $3`,
      [userId, limit, offset]
    );

    const posts: PostResponse[] = result.rows.map(row => ({
      id: row.id,
      userid: row.user_id,
      username: row.username,
      content: row.content,
      createdat: row.created_at.toISOString()
    }));

    const response: FeedResponse = {
      page,
      posts
    };

    res.status(200).json(response);
  } catch (error) {
    console.error('Feed error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;