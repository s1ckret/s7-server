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

// GET ban management page
router.get('/admin/users/ban', async (req, res) => {
  try {
    // Fetch banned and unbanned users (approved only, with callsign)
    const bannedUsers = await User.list({ banned: true, approved: true });
    const unbannedUsers = await User.list({ banned: false, approved: true });
    res.render('admin-ban', {
      bannedUsers,
      unbannedUsers,
      title: 'Бан користувачів'
    });
  } catch (error) {
    res.status(500).send('Error fetching banned/unbanned users');
  }
});

// POST ban/unban users
router.post('/admin/users/ban', async (req, res) => {
  try {
    let banIds = req.body.banIds || [];
    let unbanIds = req.body.unbanIds || [];
    if (!Array.isArray(banIds)) banIds = [banIds];
    if (!Array.isArray(unbanIds)) unbanIds = [unbanIds];
    // Ban selected users
    await Promise.all(banIds.map(id => User.update(id, { banned: true })));
    // Unban selected users
    await Promise.all(unbanIds.map(id => User.update(id, { banned: false })));
    res.redirect('/admin/users/ban');
  } catch (error) {
    res.status(500).send('Error updating ban status');
  }
});

// GET promote/demote admin rights page
router.get('/admin/users/admin', async (req, res) => {
  try {
    // Fetch admin and non-admin users (approved only, with callsign)
    const adminUsers = await User.list({ admin: true, approved: true });
    const nonAdminUsers = await User.list({ admin: false, approved: true });
    res.render('admin-promote', {
      adminUsers,
      nonAdminUsers,
      title: 'Адмін права'
    });
  } catch (error) {
    res.status(500).send('Error fetching admin/non-admin users');
  }
});

// POST promote/demote admin rights
router.post('/admin/users/admin', async (req, res) => {
  try {
    let promoteIds = req.body.promoteIds || [];
    let demoteIds = req.body.demoteIds || [];
    if (!Array.isArray(promoteIds)) promoteIds = [promoteIds];
    if (!Array.isArray(demoteIds)) demoteIds = [demoteIds];
    // Promote selected users
    await Promise.all(promoteIds.map(id => User.update(id, { admin: true })));
    // Demote selected users
    await Promise.all(demoteIds.map(id => User.update(id, { admin: false })));
    res.redirect('/admin/users/admin');
  } catch (error) {
    res.status(500).send('Error updating admin rights');
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
