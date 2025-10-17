import express from 'express';
const router = express.Router();

// GET wait-for-approve page
router.get('/wait-for-approve', (req, res) => {
  res.render('wait-for-approve', { title: 'Wait for Approval' });
});

export default router;
