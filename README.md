# Blogful

A very fake blog app.

## Set up
Link(https://courses.thinkful.com/ei-node-postgres-v1/checkpoint/15)

### Seeding
- To seed the database, run `psql -U dunder_mifflin -d blogful -f ./seeds/seed.blogful_articles.sql`.

### Model of Flow of Control

(from reading) The flow of control will go as follows:

- We start the server with npm start aka node ./src/server.js
- The server.js file requires the app instance from the app.js file
- The app.js file creates the express instance, app and exports it
- The server.js file creates the Knex instance
- The server.js file attaches the Knex instance to the app as a property called 'db'
- The server.js tells the app to start listening on a port number
- Any request handling middleware can now read the 'db' property on the app to get the Knex instance

The db property is set BEFORE any request handler callback functions(middleware) are called!!

### Testing Strategy

- We'll need to use a database specifically for testing, to avoid breaking our development database every time we run tests.
- We'll need to clear the database before all of the tests to be sure we are starting with clean tables.
- We'll insert some rows into the blogful_articles table before the test.
- We'll use Supertest to make requests to our Express instance's GET /articles handler.
- We'll assert that the response matches the data we inserted into the database table.
- We'll clear up the tables after each test.

## Scripts

Start the application `npm start`

Start nodemon for the application `npm run dev`

Run the tests `npm test`

## Deploying

When your new project is ready for deployment, add a new Heroku application with `heroku create`. This will make a new git remote called "heroku" and you can then `npm run deploy` which will push to this remote's master branch.

## Postmortem

Something my solution had in common with the course's was fixture containing the test data for maliciousArticle.

The 'serializeArticle' function MUST map over each part of the function to replace only a few key values - is there a better way to do this? Maybe a spread operator? Can it map the variables in question and then spread it into the array? Would it make sense to put this in fixtures?

I spent a minute trying to get the 'GET /' test to work with a different function that mapped testArticles into a new constant with expectedArticle tacked onto the end of it - maybe it would be more prudent to either do this in the fixtures or do it like the suggested solution and just pick the first inserted article (especially since only a specific part of the array needs to be tested). Either way, it works.

I am anticipating that we will pull our functions such as 'serializeArticle' into a different structure, maybe a functions.js, just to dry up the router more.
