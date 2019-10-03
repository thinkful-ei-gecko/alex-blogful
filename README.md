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

## Scripts

Start the application `npm start`

Start nodemon for the application `npm run dev`

Run the tests `npm test`

## Deploying

When your new project is ready for deployment, add a new Heroku application with `heroku create`. This will make a new git remote called "heroku" and you can then `npm run deploy` which will push to this remote's master branch.
