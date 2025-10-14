import express from 'express';
const router = express.Router();

router.get('/', function (req, res, next) {
  res.send('respond with a resource');
});

router.get('/protected', function (req, res, next) {
  res.send('protected!\n ' + JSON.stringify(req.session) + "\n\n" + JSON.stringify(req.user));
});

export default router;
