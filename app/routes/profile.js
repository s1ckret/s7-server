import express from 'express';
const router = express.Router();

// GET Profile page
router.get('/profile', (req, res) => {
  res.render('profile', { title: 'Profile' });
});

export default router;
