import express from 'express';
const router = express.Router();
import { User } from '../services/users-service.js';

// GET Profile page
router.get('/profile', async (req, res) => {
  res.render('profile', {
    title: 'Profile',
    user: req.user,
  });
});

// PATCH Profile update
router.patch('/profile', async (req, res) => {
  const userId = req.user.id;
  const { callsign, joined_at } = req.body;
  try {
    const updatedUser = await User.update(userId, { callsign, joined_at });
    const success = 'Профіль успішно оновлено.';
    res.render('profile', {
      title: 'Profile',
      user: updatedUser,
      success,
    });
  } catch (error) {
    error = 'Помилка оновлення профілю: ' + (error.message || error);
    res.render('profile', {
      title: 'Profile',
      user: req.user,
      error,
    });
  }
});

export default router;
