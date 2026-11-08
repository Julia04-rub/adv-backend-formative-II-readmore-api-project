const Author = require('../models/Author');
const Book = require('../models/Book');

// POST /authors
exports.createAuthor = async (req, res) => {
  try {
    const author = await Author.create(req.body);
    res.status(201).json(author);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// GET /authors
exports.getAuthors = async (req, res) => {
  const authors = await Author.find();
  res.json(authors);
};

// GET /authors/:id
exports.getAuthor = async (req, res) => {
  try {
    const author = await Author.findById(req.params.id);
    if (!author) return res.status(404).json({ message: 'Author not found' });
    res.json(author);
  } catch (err) {
    res.status(400).json({ message: 'Invalid author id' });
  }
};

// PUT /authors/:id
exports.updateAuthor = async (req, res) => {
  try {
    const author = await Author.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!author) return res.status(404).json({ message: 'Author not found' });
    res.json(author);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// DELETE /authors/:id — Option A: block if author still has books
exports.deleteAuthor = async (req, res) => {
  try {
    const author = await Author.findById(req.params.id);
    if (!author) return res.status(404).json({ message: 'Author not found' });

    const bookCount = await Book.countDocuments({ author: author._id });
    if (bookCount > 0) {
      return res.status(409).json({
        message: `Cannot delete author: ${bookCount} book(s) still reference them.`,
      });
    }

    await author.deleteOne();
    res.json({ message: 'Author deleted' });
  } catch (err) {
    res.status(400).json({ message: 'Invalid author id' });
  }
};

// GET /authors/:id/books
exports.getBooksByAuthor = async (req, res) => {
  try {
    const author = await Author.findById(req.params.id);
    if (!author) return res.status(404).json({ message: 'Author not found' });
    const books = await Book.find({ author: author._id });
    res.json(books);
  } catch (err) {
    res.status(400).json({ message: 'Invalid author id' });
  }
};

// GET /authors/:id/stats
exports.getAuthorStats = async (req, res) => {
  try {
    const author = await Author.findById(req.params.id);
    if (!author) return res.status(404).json({ message: 'Author not found' });

    const books = await Book.find({ author: author._id });

    if (books.length === 0) {
      return res.json({
        author: author.name,
        bookCount: 0,
        averagePrice: 0,
        cheapestBook: null,
        mostExpensiveBook: null,
      });
    }

    const prices = books.map((b) => b.price);
    const avg = prices.reduce((a, b) => a + b, 0) / prices.length;
    const cheapest = books.reduce((a, b) => (b.price < a.price ? b : a));
    const priciest = books.reduce((a, b) => (b.price > a.price ? b : a));

    res.json({
      author: author.name,
      bookCount: books.length,
      averagePrice: Math.round(avg * 100) / 100,
      cheapestBook: cheapest.title,
      mostExpensiveBook: priciest.title,
    });
  } catch (err) {
    res.status(400).json({ message: 'Invalid author id' });
  }
};