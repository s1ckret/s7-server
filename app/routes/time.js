

import express from 'express';
import { Drill } from '../services/drills-service.js';
import { User } from '../services/users-service.js';
import { Record } from '../services/records-service.js';
const router = express.Router();



router.get('/time', async (req, res, next) => {
  try {
    // Get all drills
    const { drills } = await Drill.list();
    // Get all users who are approved and not banned
    const users = await User.list({ approved: true, banned: false });
    let success;
    if (req.session && req.session.success) {
      success = req.session.success;
      delete req.session.success;
    }
    // Get selected user and drill from query params
    const selectedUser = req.query.user || '';
    const selectedDrill = req.query.drill || '';
    res.render('time', { drills, users, success, selectedUser, selectedDrill });
  } catch (err) {
    next(err);
  }
});

router.post('/time', async (req, res, next) => {
  try {
    const { drill: drillId, user: userId, minutes, seconds, milliseconds, hit } = req.body;
    // Validate userId
    const user = await User.get(userId);
    if (!user || !user.approved || user.banned) {
      return res.status(400).render('error', { message: 'Invalid or unauthorized user', error: {} });
    }
    // Validate drillId
    const drill = await Drill.get(drillId);
    if (!drill) {
      return res.status(400).render('error', { message: 'Invalid drill', error: {} });
    }
    // Calculate total time in ms
    const min = parseInt(minutes) || 0;
    const sec = parseInt(seconds) || 0;
    const ms = parseInt(milliseconds) || 0;
    const time_ms = min * 60000 + sec * 1000 + ms;
    const hitNum = parseInt(hit) || 0;
    // Create record
    await Record.create({
      user_id: userId,
      drill_id: drillId,
      submitted_at: new Date().toISOString(),
      time_ms,
      hit: hitNum
    });
    if (req.session) {
      req.session.success = 'Результат збережено!';
    }
  res.redirect(`/time?user=${encodeURIComponent(userId)}&drill=${encodeURIComponent(drillId)}`);
  } catch (err) {
    next(err);
  }
});

export default router;
