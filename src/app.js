require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const helmet = require('helmet');
const { NODE_ENV } = require('./config');
const ArticlesService = require('./articles-service');

const app = express();

const morganOption = NODE_ENV === 'production';

app.use(morgan(morganOption));
app.use(helmet());
app.use(cors());

app.get('/articles', (req, res, next) => {
  const knexInstance = req.app.get('db');
  ArticlesService.getAllArticles(knexInstance)
    .then(articles => {
      res.json(
        articles.map(article => ({
          id: article.id,
          title: article.title,
          style: article.style,
          content: article.content,
          date_published: new Date(article.date_published)
        }))
      );
    })
    .catch(next);
  //This .catch(next) ensures error handler middleware handles errors!
});

app.get('/articles/:article_id', (req, res, next) => {
  const knexInstance = req.app.get('db');
  ArticlesService.getById(knexInstance, req.params.article_id)
    .then(article => {
      if (!article) {
        return res.status(404).json({
          error: {message: 'Article does not exist'}
        });
      }
      res.json(article);
    })
    .catch(next);
});

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

module.exports = app;
