import { Router, Response } from 'express';
import { query } from '../database/config';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = Router();

router.post('/follow/:userid', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const followerId = req.user!.id;
    const followeeId = parseInt(req.params.userid);

    if (isNaN(followeeId)) {
      res.status(400).json({ error: 'Invalid user ID' });
      return;
    }

    if (followerId === followeeId) {
      res.status(400).json({ error: 'Cannot follow yourself' });
      return;
    }

    const userExists = await query('SELECT id FROM users WHERE id = $1', [followeeId]);
    if (userExists.rows.length === 0) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const existingFollow = await query(
      'SELECT 1 FROM follows WHERE follower_id = $1 AND followee_id = $2',
      [followerId, followeeId]
    );

    if (existingFollow.rows.length > 0) {
      res.status(409).json({ error: 'Already following this user' });
      return;
    }

    await query(
      'INSERT INTO follows (follower_id, followee_id) VALUES ($1, $2)',
      [followerId, followeeId]
    );

    res.status(200).json({ message: `you are now following user ${followeeId}` });
  } catch (error) {
    console.error('Follow error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.delete('/follow/:userid', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const followerId = req.user!.id;
    const followeeId = parseInt(req.params.userid);

    if (isNaN(followeeId)) {
      res.status(400).json({ error: 'Invalid user ID' });
      return;
    }

    const existingFollow = await query(
      'SELECT 1 FROM follows WHERE follower_id = $1 AND followee_id = $2',
      [followerId, followeeId]
    );

    if (existingFollow.rows.length === 0) {
      res.status(404).json({ error: 'Not following this user' });
      return;
    }

    await query(
      'DELETE FROM follows WHERE follower_id = $1 AND followee_id = $2',
      [followerId, followeeId]
    );

    res.status(200).json({ message: `you unfollowed user ${followeeId}` });
  } catch (error) {
    console.error('Unfollow error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;