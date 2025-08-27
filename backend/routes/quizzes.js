const express = require('express');
const router = express.Router();
const { 
  createQuiz, 
  getQuizzes, 
  getQuiz, 
  getUserQuizzes, 
  updateQuiz, 
  deleteQuiz 
} = require('../controllers/quizController');
const { auth } = require('../middleware/auth');
const { validateQuiz } = require('../middleware/validation');

router.post('/', auth, validateQuiz, createQuiz);
router.get('/', getQuizzes);
router.get('/user', auth, getUserQuizzes);
router.get('/:id', auth, getQuiz);
router.put('/:id', auth, validateQuiz, updateQuiz);
router.delete('/:id', auth, deleteQuiz);

module.exports = router;