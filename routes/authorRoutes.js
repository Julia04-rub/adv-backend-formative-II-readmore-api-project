const router = require('express').Router();
const ctrl = require('../controllers/authorController');

router.post('/', ctrl.createAuthor);
router.get('/', ctrl.getAuthors);
router.get('/:id/books', ctrl.getBooksByAuthor);
router.get('/:id/stats', ctrl.getAuthorStats);
router.get('/:id', ctrl.getAuthor);
router.put('/:id', ctrl.updateAuthor);
router.delete('/:id', ctrl.deleteAuthor);

module.exports = router;