require('should');

const request = require('supertest');
const mongoose = require('mongoose');

// set environment variable to indicate that we are in the 'Test' environment
process.env.ENV = 'Test';

const app = require('../app.js');

const Book = mongoose.model('Book');
const agent = request.agent(app);

describe('Book Crud Test', () => {
  it('should allow a book to be posted and return a read property with value of "false" and property named "_id"', (done) => {
    // create a Book object to be posted to the api
    const bookPost = {
      title: 'My Book',
      author: 'My Author',
      genre: 'Fiction'
    };

    agent.post('/api/books')
    // send the book as our payload
      .send(bookPost)
    // indicate what we expect the return status code to be
      .expect(201)
    // end our post request so that we can trigger the call and process results
      .end((err, results) => {
        console.log(`results.body from posting new book: ${JSON.stringify(results.body)}`);
        // indicate what value the 'read' property of the results should hold
        results.body.read.should.equal(false);
        // indicate that there should be a specific property named '_id' in results.body
        results.body.should.have.property('_id');
        // call our 'done()' callback method that was passed into the 'it' call
        done();
      });
  });

  // Run after each test...
  // clean up the data that was created
  afterEach((done) => {
    Book.deleteMany({}).exec();
    done();
  });

  // Run after all tests are done
  after((done) => {
    // close the mongoose (MongoDB) connection
    mongoose.connection.close();
    // shut down the app server
    app.server.close(done());
  });
});
