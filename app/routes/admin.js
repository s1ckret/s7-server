import express from 'express';
import { User } from '../services/users-service.js';
const router = express.Router();

// GET admin panel
router.get('/admin', (req, res) => {
  res.render('admin', { title: 'Admin Panel' });
});

// GET join requests (unapproved users)
router.get('/admin/join-requests', async (req, res) => {
  try {
    const unapprovedUsers = await User.listUnapproved();
    // Format joined_at to user-friendly date
    const formattedUsers = unapprovedUsers.map(user => ({
      ...user,
      joined_at: user.joined_at ? new Date(user.joined_at).toLocaleString('uk-UA', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : ''
    }));
    res.render('join-requests', { users: formattedUsers, title: 'Запити на приєднання' });
  } catch (error) {
    res.status(500).send('Error fetching join requests');
  }
});

// POST approve join requests
router.post('/admin/join-requests', async (req, res) => {
  try {
    let userIds = req.body.userIds;
    if (!userIds) {
      // No users selected
      return res.redirect('/admin/join-requests');
    }
    if (!Array.isArray(userIds)) {
      userIds = [userIds];
    }
    await Promise.all(userIds.map(id => User.update(id, { approved: true })));
    res.redirect('/admin/join-requests');
  } catch (error) {
    res.status(500).send('Error approving users');
  }
});

export default router;
