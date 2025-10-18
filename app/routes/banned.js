import express from 'express';
const router = express.Router();

// GET banned page
router.get('/banned', (req, res) => {
  res.render('banned', { title: 'Banned' });
});

export default router;
