const Attempt = require('../models/Attempt');
const Quiz = require('../models/Quiz');

// Submit a quiz attempt
exports.submitAttempt = async (req, res) => {
  try {
    let quizId = req.params.id;
    quizId = quizId.replace(/^:/, ''); // Remove leading colon if present

    // Validate if quizId is a valid ObjectId
    if (!quizId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: 'Invalid quiz ID format' });
    }

    const { answers, timeSpent } = req.body;
    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    // Prevent quiz creator from taking their own quiz
    if (quiz.createdBy.toString() === req.user._id.toString()) {
      return res.status(403).json({ message: 'You cannot take your own quiz' });
    }

    // Calculate score
    let score = 0;
    let totalPoints = 0;
    const answerResults = [];

    answers.forEach((answer, index) => {
      const question = quiz.questions[index];
      totalPoints += question.points;

      const isCorrect = answer.selectedOption === question.correctAnswer;
      if (isCorrect) {
        score += question.points;
      }

      answerResults.push({
        questionIndex: index,
        selectedOption: answer.selectedOption,
        isCorrect,
        points: isCorrect ? question.points : 0
      });
    });

    // Save attempt
    const attempt = await Attempt.create({
      userId: req.user._id,
      quizId,
      answers: answerResults,
      score,
      totalPoints,
      timeSpent
    });

    // Populate quiz details
    await attempt.populate('quizId', 'title');

    res.status(201).json(attempt);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get user's attempts for a quiz
exports.getUserAttempts = async (req, res) => {
  try {
    let quizId = req.params.id;
    quizId = quizId.replace(/^:/, '');

    // Validate if quizId is a valid ObjectId
    if (!quizId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: 'Invalid quiz ID format' });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const attempts = await Attempt.find({
      userId: req.user._id,
      quizId
    })
      .populate('quizId', 'title')
      .sort({ completedAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Attempt.countDocuments({
      userId: req.user._id,
      quizId
    });

    res.json({
      attempts,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalAttempts: total
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get all attempts for a quiz (for quiz creator)
exports.getQuizAttempts = async (req, res) => {
  try {
    let quizId = req.params.id;
    quizId = quizId.replace(/^:/, '');

    // Validate if quizId is a valid ObjectId
    if (!quizId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: 'Invalid quiz ID format' });
    }

    // Check if user is the quiz creator
    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    if (quiz.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const attempts = await Attempt.find({ quizId })
      .populate('userId', 'username')
      .sort({ completedAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Attempt.countDocuments({ quizId });

    res.json({
      attempts,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalAttempts: total
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get a specific attempt
exports.getAttempt = async (req, res) => {
  try {
    let attemptId = req.params.attemptId;
    attemptId = attemptId.replace(/^:/, '');

    // Validate if attemptId is a valid ObjectId
    if (!attemptId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: 'Invalid attempt ID format' });
    }

    const attempt = await Attempt.findById(attemptId)
      .populate('userId', 'username')
      .populate('quizId');

    if (!attempt) {
      return res.status(404).json({ message: 'Attempt not found' });
    }

    // Check if user is the attempt owner or quiz creator
    if (
      attempt.userId._id.toString() !== req.user._id.toString() &&
      attempt.quizId.createdBy.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(attempt);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};