import express from 'express';
const router = express.Router();

// GET admin panel
router.get('/', (req, res) => {
  // You may want to add admin check here
  res.render('admin', { title: 'Admin Panel' });
});

// Placeholder for future exercise actions
// router.post('/exercise', ...)
// router.put('/exercise/:id', ...)
// router.delete('/exercise/:id', ...)

export default router;
