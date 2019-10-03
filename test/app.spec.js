const app = require('../src/app');

describe('App', () => {
  it ('GET / responds with 200 containing "Server running on port 8000! Good luck."', () => {
    return supertest(app)
      .get('/')
      .expect(200, 'Server running on port 8000! Good luck.');
  });
});

