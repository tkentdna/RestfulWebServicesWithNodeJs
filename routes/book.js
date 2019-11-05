// tell eslint to ignore reassignment of parameter values for this entire file
/* eslint-disable no-param-reassign */
const express = require('express');
const booksController = require('../controllers/booksController');

// A function that defines all routes for books, receiving the Book model to be injected
function routes(Book) {
  // create the router for Book
  const bookRouter = express.Router();

  // create the controller for this router, passing in the Book model instance
  const controller = booksController(Book);

  // Actions based upon the '/books' route (POST & GET ALL)
  bookRouter.route('/books')
    // (POST) Add a new book to the DB
    .post(controller.post)
    // (GET) Fetch a collection of books based on criteria provided in the query string
    .get(controller.get);

  bookRouter.use('/books/:bookId', async (req, res, next) => {
    let retValue = null;
    try {
      // find a book based on the ID passed in the URL
      await Book.findById(req.params.bookId, (error, book) => {
        if (error) {
          console.error(`Error enountered while finding books: ${error}`);
          retValue = res.send(error);
        } else if (book) {
          console.log(`Book.findById() succeeded, returning (${book})`);
          req.book = book;
          retValue = next();
        } else {
          console.log(`Book.findById() failed -- no book was found with the given ID: (${req.params.bookId})`);
          retValue = res.sendStatus(404);
        }
      });
    } catch (error) {
      console.error(`Error encountered while getting a book: ${error}`);
      return res.status(500).send('Error attempting to get a book');
    }
    return retValue;
  });

  // Actions based upon the '/books/:bookId route
  bookRouter.route('/books/:bookId')
    // (GET/:id) Fetch a single book based upon the Id of the book
    // The bookRouter.use('/books/:bookId'...) method above will have found the
    // requested book (by its Id) and passed it to here.  So, we merely need to
    // get the book from the 'req' (request) object and send back the book in the response.
    .get((req, res) => {
      // res.json(req.book);
      // sample of adding a reference to indicated filtering by a genre, as an application of
      // HATEOAS - Hypermedia As The Engine Of Application State
      const returnBook = req.book.toJSON();
      returnBook.links = {};
      const genre = req.book.genre.replace(' ', '%20'); // encode spaces in the URL
      returnBook.links.FilterByThisGenre = `http://${req.headers.host}/api/books/?genre=${genre}`;
      res.json(returnBook);
    })
    // (PUT/:id) Update all fields of a single book per the Id of the book.
    // The bookRouter.use('/books/:bookId'...) method above will have found the
    // requested book (by its Id) and passed it to here.  So, we merely need to
    // get the book from the 'req' (request) object, update all of its values from the
    // individual details provided in the request, and then save the revised book.
    .put(async (req, res) => {
      // use destructuring to pull the book object from the request object
      const { book } = req;
      // replace all fields for the 'book' with incoming information
      book.title = req.body.title;
      book.author = req.body.author;
      book.genre = req.body.genre;
      book.read = req.body.read;
      console.log(`Revised book: (${book})`);
      let retValue = null;
      try {
        // save the updated book info to the DB
        await book.save();
        retValue = res.json(book);
      } catch (error) {
        console.error(`Error encountered while attempting to PUT update a book: ${error}`);
        retValue = res.status(500).send(`Error attempting to get a book ${error}`);
      }
      return retValue;
    })
    // (PATCH/:id) Update specific fields of a book per the Id of the book.
    // The bookRouter.use('/books/:bookId'...) method above will have found the
    // requested book (by its Id) and passed it to here.  So, we merely need to
    // get the book from the 'req' (request) object, update ONLY the values provided
    // in the request, and then save the revised book.
    .patch(async (req, res) => {
      // use destructuring to pull the book object from the request object
      const { book } = req;
      // if the '_id' field was passed, we want to remove it from the request
      // eslint-disable-next-line no-underscore-dangle
      if (req.body._id) {
        // eslint-disable-next-line no-underscore-dangle
        delete req.body._id;
      }
      // replace only the fields of the 'book' with request information
      Object.entries(req.body).forEach((item) => {
        const key = item[0];
        const value = item[1];
        book[key] = value;
      });
      console.log(`Revised book: (${book})`);
      let retValue = null;
      try {
        // save the updated book info to the DB
        await book.save((err) => {
          if (err) {
            retValue = res.send(err);
          } else {
            retValue = res.json(book);
          }
        });
      } catch (error) {
        console.error(`Error encountered while attempting to PATCH update a book: ${error}`);
        retValue = res.status(500).send(`Error attempting to get a book ${error}`);
      }
      return retValue;
    })
    // (DELETE /:id) Delete/remove a book based upon the specific Id of the book.
    // The bookRouter.use('/books/:bookId'...) method above will have found the
    // requested book (by its Id) and passed it to here.  So, we merely need to
    // get the book from the 'req' (request) object, and then request to remove it.
    .delete(async (req, res) => {
      // use destructuring to pull the book object from the request object
      const { book } = req;
      console.log(`Book to be deleted: (${book})`);
      let retValue = null;
      try {
        // delete the book from the DB
        await book.remove((err) => {
          if (err) {
            retValue = res.send(err);
          } else {
            // return a status of 204, meaning that the item was removed/deleted
            retValue = res.sendStatus(204);
          }
        });
      } catch (error) {
        console.error(`Error encountered while getting a book: ${error}`);
        retValue = res.status(500).send(`Error attempting to get a book ${error}`);
      }
      return retValue;
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
