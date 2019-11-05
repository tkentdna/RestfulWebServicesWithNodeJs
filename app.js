const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
// if we're not running in a production environment, load and activate dotenv 
// (to utilize substitutions within .env file)
if (process.env.ENV !== 'production') {
  require('dotenv').config();
}

// access the Book model
const Book = require('./models/book');
// create Book router and inject the Book model
const bookRouter = require('./routes/book')(Book);

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

let connectionString = null;
if (process.env.ENV === 'Test') {
  console.log('Running in TEST mode');
  connectionString = process.env.DATABASE_URL_TEST;
  console.log(`process.env.DATABASE_URL_TEST: ${process.env.DATABASE_URL_TEST}`);
  // connectionString = 'mongodb+srv://tkent_dna:mongoCloudAtlas12!@cluster0-pft9s.azure.mongodb.net/RestfulWebServicesWithNodeJs_Test?retryWrites=true&w=majority';
} else {
  console.log('Running in PRODUCTION mode');
  connectionString = process.env.DATABASE_URL;
}
console.log(`DB Connection String: ${connectionString}`);

// handles any error generated when connecting to a Mongo DB
function handleError(error) {
  console.error(`Error connecting to Mongo DB: ${error}`);
}

mongoose.connect(connectionString, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).catch((error) => handleError(error));

// let's log whether we are able to connect to the MongoDB instance
const db = mongoose.connection;
// on an error connecting to the MongoDB...
db.on('error', (error) => {
  console.error(`Error connecting to Mongo DB: ${error}`);
});
// one-time only, if we succeeded in opening the MongoDB connection, log success
db.once('open', () => {
  console.log('Successfully connected to MongoDB');
});

const port = process.env.PORT || 3000;

app.use('/api', bookRouter);

app.get('/', (request, response) => {
  response.send('Welcome to my API!');
});

app.server = app.listen(port, () => {
  console.log(`Running on port: ${port}`);
});

module.exports = app;
