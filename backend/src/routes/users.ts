import { Router, Response } from 'express';
import { query } from '../database/config';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = Router();

router.get('/users', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const currentUserId = req.user!.id;
    
    const result = await query(`
      SELECT 
        u.id,
        u.username,
        u.created_at,
        CASE 
          WHEN f.follower_id IS NOT NULL THEN true 
          ELSE false 
        END as is_following
      FROM users u
      LEFT JOIN follows f ON u.id = f.followee_id AND f.follower_id = $1
      WHERE u.id != $1
      ORDER BY u.created_at DESC
    `, [currentUserId]);

    const users = result.rows.map(row => ({
      id: row.id,
      username: row.username,
      isFollowing: row.is_following,
      joinedAt: row.created_at.toISOString()
    }));

    res.status(200).json({ users });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/users/following', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    
    const result = await query(`
      SELECT u.id, u.username, u.created_at
      FROM users u
      INNER JOIN follows f ON u.id = f.followee_id
      WHERE f.follower_id = $1
      ORDER BY f.created_at DESC
    `, [userId]);

    const following = result.rows.map(row => ({
      id: row.id,
      username: row.username,
      followedAt: row.created_at.toISOString()
    }));

    res.status(200).json({ following });
  } catch (error) {
    console.error('Get following error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;