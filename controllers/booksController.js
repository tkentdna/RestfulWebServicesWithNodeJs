
function booksController(Book) {
  // (POST) Add a new book to the DB
  async function post(req, res) {
    const book = new Book(req.body);
    console.log(`Book to be added to the DB: ${book}`);
    if (!req.body.title) {
      res.status(400);
      return res.send('Title is required');
    }
    try {
      // save to the DB
      await book.save();
      res.status(201);
      return res.json(book);
    } catch (error) {
      console.error(`Error encountered while creating a book: ${error}`);
      return res.status(500).send('Error attempting to save book');
    }
  }

  // (GET) Fetch a collection of books based on criteria provided in the query string
  async function get(req, res) {
    // const response = { hello: 'This is my API' };
    // get the query string parms from the request
    const query = {};
    if (req.query.title != null && req.query.title !== '') {
      query.title = query.regex('title', new RegExp(req.query.title, 'i'));
    }

    if (req.query.genre != null && req.query.genre !== '') {
      query.genre = query.regex('title', new RegExp(req.query.genre, 'i'));
    }

    let retValue = null;
    try {
      // find books based on the query criteria
      await Book.find(query, (error, books) => {
        if (error) {
          console.error(`Error enountered while finding books: ${error}`);
          retValue = res.send(error);
        } else {
          console.log(`Book.find() succeeded, returning (${books ? books.length : 0})`);
          // retValue = res.json(books);

          // add a hyperlink to each book's return object, providing a hyperlink directly to
          // the individual book, as an application of
          // HATEOAS - Hypermedia As The Engine Of Application State
          const returnBooks = books.map((book) => {
            const newBook = book.toJSON();
            newBook.links = {};
            newBook.links.self = `http://${req.headers.host}/api/books/${book._id}`;
            return newBook;
          });

          retValue = res.json(returnBooks);
        }
      });
    } catch (error) {
      console.error(`Error encountered while getting books: ${error}`);
      res.status(500);
      retValue = res.send('Error attempting to get books');
    }
    return retValue;
  }
  // return an object exposing the post & get functions above
  return { post, get };
}

module.exports = booksController;
