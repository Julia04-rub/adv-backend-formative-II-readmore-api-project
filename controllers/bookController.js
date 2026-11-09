const Book = require('../models/Book');
const Author = require('../models/Author');

const MIN_YEAR = 1450;

function validatePriceAndYear(price, publishedYear) {
  if (price === undefined || publishedYear === undefined) return null;
  const currentYear = new Date().getFullYear();
  if (price <= 0) return 'Price must be greater than zero';
  if (publishedYear < MIN_YEAR) return `Published year cannot be before ${MIN_YEAR}`;
  if (publishedYear > currentYear) return 'Published year cannot be in the future';
  return null;
}

// POST /books
exports.createBook = async (req, res) => {
  try {
    const { title, genre, price, publishedYear, author } = req.body;

    // Req 3 — 422 for invalid price / year
    const fieldErr = validatePriceAndYear(price, publishedYear);
    if (fieldErr) return res.status(422).json({ message: fieldErr });

    // Req 1 — 400 for orphan book
    const authorExists = await Author.findById(author).catch(() => null);
    if (!authorExists) {
      return res.status(400).json({ message: 'Author does not exist' });
    }

    // Req 2 — 409 for duplicate title per author (case-insensitive)
    const escaped = title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const duplicate = await Book.findOne({
      author,
      title: { $regex: `^${escaped}$`, $options: 'i' },
    });
    if (duplicate) {
      return res
        .status(409)
        .json({ message: 'This author already has a book with that title' });
    }

    const book = await Book.create({ title, genre, price, publishedYear, author });
    await book.populate('author');
    res.status(201).json(book);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// GET /books — filtering, sorting, pagination
exports.getBooks = async (req, res) => {
  const { genre, minPrice, maxPrice, author, search, sort, order, page, limit } =
    req.query;

  // Build the filter dynamically — only apply what's present
  const filter = {};
  if (genre) filter.genre = genre;
  if (author) filter.author = author;

  if (minPrice || maxPrice) {
    filter.price = {};
    if (minPrice) filter.price.$gte = Number(minPrice);
    if (maxPrice) filter.price.$lte = Number(maxPrice);
  }

  if (search) {
    filter.title = { $regex: search, $options: 'i' };
  }

  // Sort
  const sortableFields = ['price', 'title', 'publishedYear'];
  const sortObj = {};
  if (sort && sortableFields.includes(sort)) {
    sortObj[sort] = order === 'desc' ? -1 : 1;
  }

  // Pagination (challenge)
  const pageNum = Math.max(1, parseInt(page) || 1);
  const limitNum = Math.max(1, parseInt(limit) || 0); // 0 = no pagination

  let query = Book.find(filter).populate('author').sort(sortObj);

  let total;
  if (limitNum > 0) {
    total = await Book.countDocuments(filter);
    query = query.skip((pageNum - 1) * limitNum).limit(limitNum);
  }

  const books = await query;

  if (limitNum > 0) {
    return res.json({ page: pageNum, limit: limitNum, total, results: books });
  }
  res.json(books);
};

// GET /books/:id
exports.getBook = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id).populate('author');
    if (!book) return res.status(404).json({ message: 'Book not found' });
    res.json(book);
  } catch (err) {
    res.status(400).json({ message: 'Invalid book id' });
  }
};

// PUT /books/:id
exports.updateBook = async (req, res) => {
  try {
    const { price, publishedYear } = req.body;

    if (price !== undefined || publishedYear !== undefined) {
      const existing = await Book.findById(req.params.id);
      if (!existing) return res.status(404).json({ message: 'Book not found' });

      const fieldErr = validatePriceAndYear(
        price ?? existing.price,
        publishedYear ?? existing.publishedYear
      );
      if (fieldErr) return res.status(422).json({ message: fieldErr });
    }

    const book = await Book.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate('author');
    if (!book) return res.status(404).json({ message: 'Book not found' });
    res.json(book);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// DELETE /books/:id
exports.deleteBook = async (req, res) => {
  try {
    const book = await Book.findByIdAndDelete(req.params.id);
    if (!book) return res.status(404).json({ message: 'Book not found' });
    res.json({ message: 'Book deleted' });
  } catch (err) {
    res.status(400).json({ message: 'Invalid book id' });
  }
};