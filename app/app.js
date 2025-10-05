import createError from 'http-errors';
import express from 'express';
import session from 'express-session';
import expressLayouts from 'express-ejs-layouts';
import path from 'path';
import cookieParser from 'cookie-parser';
import logger from 'morgan';
import 'dotenv/config'

import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

import { DynamoDBStore } from '@pwrdrvr/dynamodb-session-store';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';

import indexRouter from './routes/index.js';
import usersRouter from './routes/users.js';

var app = express();
const dynamoDBClient = new DynamoDBClient({});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.set("layout extractScripts", true)

// ONLY for development - do not use in production!
// app.set('view cache', false);

app.use(
  session({
    store: new DynamoDBStore({
      tableName: process.env.DYNAMODB_SESSION_TABLE_NAME,
      dynamoDBClient,
      touchAfter: 60 * 60, // 60 minutes in seconds
    }),
    secret: process.env.SESSION_SECRET,
    cookie: {
      maxAge: 14 * 24 * 60 * 60 * 1000, // 14 days in milliseconds
    },
    resave: false,
    saveUninitialized: false,
  }),
);

app.use(expressLayouts);
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

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
