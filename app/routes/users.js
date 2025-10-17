import express from 'express';
const router = express.Router();

router.get('/users', function (req, res, next) {
  res.send('respond with a resource');
});

router.get('/users/protected', function (req, res, next) {
  res.send('protected!\n ' + "\n\n" + JSON.stringify(req.user));
});

export default router;
