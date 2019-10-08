require('dotenv').config();
const express = require('express'),
  morgan = require('morgan'),
  cors = require('cors'),
  helmet = require('helmet'),
  { NODE_ENV } = require('./config');

const articlesRouter = require('./articles/articles-router'),
  usersRouter = require('./users/users-router'),
  commentsRouter = require('./comments/comments-router');

const app = express();

const morganOption = NODE_ENV === 'production';

app.use(morgan(morganOption));
app.use(helmet());
app.use(cors());

app.use('/api/articles', articlesRouter);
app.use('/api/users', usersRouter);
app.use('/api/comments', commentsRouter);

// app.get('/', (req, res) => {
//   res.send('Server running on port 8000! Good luck.');
// });

app.use(function errorHandler(error, req, res, next) {
  let response;
  if (NODE_ENV === 'production') {
    //basic error on production
    response = { error: { message: 'server error' } };
  } else {
    //more complex error for development
    console.error(error);
    response = { message: error.message, error };
  }
  res.status(500).json(response);
});

app.get('/xss', (req, res) => {
  res.cookie('secretToken', '1234567890');
  res.sendFile(__dirname + '/xss-example.html');
});

module.exports = app;
