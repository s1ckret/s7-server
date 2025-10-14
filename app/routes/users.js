import express from 'express';
const router = express.Router();

const isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({
    message: "Access denied. Please log in.",
  });
};

/* GET users listing. */
router.get('/', function (req, res, next) {
  res.send('respond with a resource');
});

router.get('/protected', isAuthenticated, function (req, res, next) {
  res.send('protected!\n ' + JSON.stringify(req.session) + "\n\n" + JSON.stringify(req.user));
});

export default router;
