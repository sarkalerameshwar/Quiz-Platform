const express = require('express');
const router = express.Router();
const { 
  submitAttempt, 
  getUserAttempts, 
  getQuizAttempts, 
  getAttempt 
} = require('../controllers/attemptController.js');
const { auth } = require('../middleware/auth');

router.post('/:id', auth, submitAttempt);
router.get('/user/:id', auth, getUserAttempts);
router.get('/quiz/:id', auth, getQuizAttempts);
router.get('/:attemptId', auth, getAttempt);

module.exports = router;
// module.exports = router;