import express from 'express';
import { User } from '../services/users-service.js';

const router = express.Router();

// GET who-are-you page
router.get('/', (req, res) => {
  res.render('who-are-you', { title: 'Who Are You' });
});

// POST who-are-you: save callsign to user and redirect home
router.post('/', async (req, res, next) => {
  try {
    const { callsign } = req.body;
    if (!callsign) {
      return res.render('who-are-you', { title: 'Who Are You', error: 'Callsign is required' });
    }
    // Save callsign to user (persist in DB)
  await User.update(req.user.id, { callsign });
    req.user.callsign = callsign; // update session user
    res.redirect('/');
  } catch (err) {
    next(err);
  }
});

export default router;
