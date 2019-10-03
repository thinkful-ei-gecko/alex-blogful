const knex = require('knex');
const app = require('./app');

const { PORT, DB_URL } = require('./config');

const db = knex({
  client: 'pg',
  connection: DB_URL
});

//This sets out knex instance - because we can't require './server.js' in the app due to dependency cycle like in Services exercise. Utilitizes express feature 'set'.
app.set('db', db);

app.listen(PORT, () => {
  console.log(`Server listening at http://localhost:${PORT}`);
});
