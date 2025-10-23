import createError from 'http-errors';
import express from 'express';
import session from 'express-session';
import expressLayouts from 'express-ejs-layouts';
import { doubleCsrf } from "csrf-csrf";
import path from 'path';
import cookieParser from 'cookie-parser';
import logger from 'morgan';
import passport from 'passport';
import 'dotenv/config'
import methodOverride from 'method-override';
import { ConnectSessionKnexStore } from "connect-session-knex";

import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

import indexRouter from './routes/index.js';
import authRouter from './routes/auth.js';
import usersRouter from './routes/users.js';
import profileRouter from './routes/profile.js';
import whoAreYouRouter from './routes/who-are-you.js';
import waitForApproveRouter from './routes/wait-for-approve.js';
import bannedRouter from './routes/banned.js';
import adminRouter from './routes/admin.js';
import { requireAuth } from './middleware/requireAuth.js';
import { db } from './services/db.js';
import drillRouter from './routes/drills.js';

var app = express();
app.enable("trust proxy");
app.use(function (req, res, next) {
  // If CloudFront header is present, set X-Forwarded-Proto
  if (req.headers['cloudfront-forwarded-proto']) {
    req.headers['x-forwarded-proto'] = req.headers['cloudfront-forwarded-proto'];
  }
  next();
})

const {
  doubleCsrfProtection,
  generateToken,
} = doubleCsrf({
  getSecret: () => process.env.CSRF_SECRET,
  getSessionIdentifier: (req) => req.session.id,
  getCsrfTokenFromRequest: (req) => {
    return req.headers['x-csrf-token'] ||
      req.query._csrf ||
      req.body._csrf;
  },
  cookieName: process.env.NODE_ENV === 'production' ? "__Host-psifi.x-csrf-token" : "x-csrf-token",
  cookieOptions: {
    secure: process.env.NODE_ENV === 'production'
  },
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.set("layout extractScripts", true)

// ONLY for development - do not use in production!
// app.set('view cache', false);

app.use(expressLayouts);
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride(function (req, res) {
  if (req.body && typeof req.body === 'object' && '_method' in req.body) {
    // look in urlencoded POST bodies and delete it
    var method = req.body._method
    delete req.body._method
    return method
  }
}))
app.use(express.static(path.join(__dirname, 'public')));

const store = new ConnectSessionKnexStore({
  knex: db,
  cleanupInterval: 0, // disable session cleanup
});

app.use(
  session({
    store: store,
    secret: process.env.SESSION_SECRET,
    cookie: {
      maxAge: 14 * 24 * 60 * 60 * 1000, // 14 days in milliseconds
    },
    resave: false,
    saveUninitialized: false,
  }),
);
app.use(passport.authenticate('session'));
app.use(cookieParser());
app.use(doubleCsrfProtection);

// Set csrfToken into ejs template
app.use(function (req, res, next) {
  res.locals._csrfToken = req.csrfToken()
  res.locals.currentUser = req.user
  res.locals.currentPath = req.path;
  next()
})

app.use(requireAuth);
app.use('/', indexRouter);
app.use('/', authRouter);
app.use('/', usersRouter);
app.use('/', profileRouter);
app.use('/', whoAreYouRouter);
app.use('/', waitForApproveRouter);
app.use('/', bannedRouter);
app.use('/', drillRouter);
app.use('/', function (req, res, next) {
  if (req.user && req.user.admin) {
    next()
  } else {
    res.status(403).send('Forbidden')
  }
}, adminRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

export default app;
