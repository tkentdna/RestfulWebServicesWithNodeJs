const express = require('express');

// A function that defines all routes for books, receiving the Book model to be injected
function routes(Book) {
  // create the router for Book
  const bookRouter = express.Router();

  // Actions based upon the '/books' route (POST & GET ALL)
  bookRouter.route('/books')
    // (POST) Add a new book to the DB
    .post(async (req, res) => {
      const book = new Book(req.body);

      console.log(`Book to be added to the DB: ${book}`);

      try {
        // save to the DB
        await book.save();

        return res.status(201).json(book);
      } catch (error) {
        console.error(`Error encountered while creating a book: ${error}`);
        return res.status(500).send('Error attempting to save book');
      }
    })
    // (GET) Fetch a collection of books based on criteria provided in the query string
    .get((req, res) => {
      // const response = { hello: 'This is my API' };
      // get the query string parms from the request
      const query = {};
      if (req.query.title != null && req.query.title !== '') {
        query.title = query.regex('title', new RegExp(req.query.title, 'i'));
      }

      if (req.query.genre != null && req.query.genre !== '') {
        query.genre = query.regex('title', new RegExp(req.query.genre, 'i'));
      }

      // find books based on the query criteria
      Book.find(query, (error, books) => {
        let retValue = null;
        if (error) {
          console.error(`Error enountered while finding books: ${error}`);
          retValue = res.send(error);
        } else {
          console.log(`Book.find() succeeded, returning (${books ? books.length : 0})`);
          retValue = res.json(books);
        }
        return retValue;
      });
    });

  // (GET/:id) Fetch a single book based upon the IDS of the book
  bookRouter.route('/books/:bookId').get((req, res) => {
    // find books based on the ID passed in the URL
    Book.findById(req.params.bookId, (error, book) => {
      let retValue = null;
      if (error) {
        console.error(`Error enountered while finding books: ${error}`);
        retValue = res.send(error);
      } else {
        console.log(`Book.findById() succeeded, returning (${book})`);
        retValue = res.json(book);
      }
      return retValue;
    });
  });

  // // (POST) Add a new book to the DB
  // bookRouter.route('/books').post(async (req, res) => {
  //   const book = new Book(req.body);

  //   console.log(`Book to be added to the DB: ${book}`);

  //   try {
  //     // save to the DB
  //     await book.save();

  //     return res.status(201).json(book);
  //   } catch (error) {
  //     console.error(`Error encountered while creating a book: ${error}`);
  //     return res.status(500).send('Error attempting to save book');
  //   }
  // });

  return bookRouter;
}

module.exports = routes;
