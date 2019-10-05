const { expect } = require('chai');
const knex = require('knex');
const app = require('../src/app');
const { makeArticlesArray, addMaliciousArticle, dateParse } = require('./articles.fixtures');

let testDate = makeArticlesArray();

// dateParse fixes the windows date issue.

describe('Articles Endpoints', function() {
  let db;

  before('make knex instance', () => {
    db = knex({
      client: 'pg',
      connection: process.env.TEST_DB_URL
    });
    app.set('db', db);
  });

  after('disconnect from db', () => db.destroy());

  before('clean the table', () => db('blogful_articles').truncate());

  afterEach('clean the table', () => db('blogful_articles').truncate());

  describe('GET /api/articles', () => {
    context('Given no articles', () => {
      it('responds with 200 and an empty list', () => {
        return supertest(app)
          .get('/api/articles')
          .expect(200, []);
      });
    });

    context('Given there are articles in the database', () => {
      const testArticles = makeArticlesArray();

      beforeEach('insert articles', () => {
        return db.into('blogful_articles').insert(testArticles);
      });

      it('GET /api/articles responds with 200 and all the articles.', () => {

        return supertest(app)
          .get('/api/articles')
          .expect(200)
          .then(res => {
            expect(res.body.map(dateParse)).to.eql(testArticles);
          });
      });

      context('Given an xss attack article', () => {
        let { maliciousArticle, expectedArticle } = addMaliciousArticle();

        beforeEach('inject malicious article', () => {
          return db.into('blogful_articles').insert([ maliciousArticle ]);
        });

        it('removes xss attack content', () => {
          let expectedArticles = testArticles;
          expectedArticles.splice(4, 1, expectedArticle);
          return supertest(app)
            .get('/api/articles')
            .expect( res => {              
              expect(res.status).to.eql(200);
              expect(res.body.map(dateParse)).to.eql(expectedArticles);
            });
        });
      });
    });
  });

  describe('GET /api/articles/:article_id', () => {
    context('Given an xss attack article', () => {
      const { maliciousArticle, expectedArticle } = addMaliciousArticle();

      beforeEach('insert malicious article', () => {
        return db.into('blogful_articles').insert([maliciousArticle]);
      });

      it('removes xss attack content', () => {
        return supertest(app)
          .get(`/api/articles/${maliciousArticle.id}`)
          .expect(200)
          .expect(res => {
            expect(res.body.title).to.eql(expectedArticle.title);
            expect(res.body.content).to.eql(expectedArticle.content);
          });
      });
    });
    context('Given no articles', () => {
      it('responds with a 404', () => {
        const articleId = 123456;
        return supertest(app)
          .get(`/api/articles/${articleId}`)
          .expect(404, { error: { message: 'Article does not exist' } });
      });
    });
    context('Given there are articles in the database', () => {
      const testArticles = makeArticlesArray();

      beforeEach('insert articles', () => {
        return db.into('blogful_articles').insert(testArticles);
      });

      it('responds with 200 and the specified article', () => {
        const articleId = 2;
        const expectedArticle = testArticles[articleId - 1];

        return supertest(app)
          .get(`/api/articles/${articleId}`)
          .expect(200)
          .then(res => {
            expect(dateParse(res.body)).to.eql(expectedArticle);
          });
      });
    });
  });

  describe('POST /api/articles', () => {
    context('Given an xss attack article', () => {
      const { maliciousArticle, expectedArticle } = addMaliciousArticle();

      it('removes xss attack content', () => {
        return supertest(app)
          .post('/api/articles/')
          .send(maliciousArticle)
          .expect(201)
          .expect(res => {
            expect(res.body.title).to.eql(expectedArticle.title);
            expect(res.body.style).to.eql(expectedArticle.style);
            expect(res.body.content).to.eql(expectedArticle.content);
            expect(res.body).to.have.property('id');
            expect(res.headers.location).to.eql(`/articles/${res.body.id}`);
          });
      });
    });

    it('creates an article, responding with 201 and the new article', function() {
      this.retries(3);
      const newArticle = {
        title: 'Test new article',
        style: 'Listicle',
        content: 'Test new article content...'
      };
      return supertest(app)
        .post('/api/articles')
        .send(newArticle)
        .expect(201)
        .expect(res => {
          expect(res.body.title).to.eql(newArticle.title);
          expect(res.body.style).to.eql(newArticle.style);
          expect(res.body.content).to.eql(newArticle.content);
          expect(res.body).to.have.property('id');
          expect(res.headers.location).to.eql(`/articles/${res.body.id}`);

          const expected = new Date().toLocaleString('en', { timeZone: 'UTC' });
          const actual = new Date(res.body.date_published).toLocaleString();
          expect(actual).to.eql(expected);
        })
        .then(postRes =>
          supertest(app)
            .get(`/api/articles/${postRes.body.id}`)
            .expect(postRes.body)
        );
    });

    const requiredFields = ['title', 'style', 'content'];

    requiredFields.forEach(field => {
      const newArticle = {
        title: 'Test new article',
        style: 'Listicle',
        content: 'Test new article content...'
      };

      it(`responds with 400 and an error message when the ${field} is missing`, () => {
        delete newArticle[field];

        return supertest(app)
          .post('/api/articles')
          .send(newArticle)
          .expect(400, {
            error: { message: `Missing ${field} in request body` }
          });
      });
    });
  });
});
