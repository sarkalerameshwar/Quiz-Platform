import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { quizAPI } from '../../services/quizzes';
import { preventBackNavigation, enableBackNavigation } from '../../utils/history';
import Loader from '../common/Loader';
import Alert from '../common/Alert';
import { FaClock, FaUser, FaClipboardList, FaExclamationTriangle } from 'react-icons/fa';

const TakeQuiz = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [timeLeft, setTimeLeft] = useState(0);
  const [showConfirmSubmit, setShowConfirmSubmit] = useState(false);
  
  // Refs for stable values
  const quizStarted = useRef(false);
  const timerRef = useRef(null);
  const visibilityChangeDetected = useRef(false);

  // Initialize quiz and prevent back navigation
  useEffect(() => {
    preventBackNavigation();
    fetchQuiz();
    
    return () => {
      enableBackNavigation();
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [id]);

  // Fetch quiz data
  const fetchQuiz = async () => {
    try {
      setLoading(true);
      const response = await quizAPI.getQuiz(id);
      setQuiz(response.data);
      setAnswers(Array(response.data.questions.length).fill(null));
      
      // Initialize timer but don't start it yet
      if (response.data.timeLimit) {
        setTimeLeft(response.data.timeLimit * 60);
      }
    } catch (error) {
      setError('Failed to load quiz');
    } finally {
      setLoading(false);
    }
  };

  // Start the quiz (timer and monitoring)
  const startQuiz = () => {
    if (quizStarted.current) return;
    
    quizStarted.current = true;
    console.log('Quiz started - monitoring for tab changes');
    
    // Start timer
    startTimer();
    
    // Setup visibility change detection
    setupVisibilityMonitoring();
  };

  // Start timer function
  const startTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    timerRef.current = setInterval(() => {
      setTimeLeft(prevTime => {
        if (prevTime <= 1) {
          clearInterval(timerRef.current);
          handleAutoSubmit(false); // Time's up
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);
  };

  // Setup visibility change monitoring
  const setupVisibilityMonitoring = () => {
    const handleVisibilityChange = () => {
      if (document.hidden && !submitting && !visibilityChangeDetected.current) {
        console.log('Tab change detected - auto submitting');
        visibilityChangeDetected.current = true;
        handleAutoSubmit(true);
      }
    };

    const handleWindowBlur = () => {
      if (!submitting && !visibilityChangeDetected.current) {
        console.log('Window blur detected - auto submitting');
        visibilityChangeDetected.current = true;
        handleAutoSubmit(true);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleWindowBlur);
    
    // Cleanup function
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleWindowBlur);
    };
  };

  // Handle answer selection
  const handleAnswerSelect = (selectedOption) => {
    startQuiz(); // Start quiz on first interaction
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = selectedOption;
    setAnswers(newAnswers);
  };

  // Format time display
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Auto submit function
  const handleAutoSubmit = useCallback(async (isForced = false) => {
    if (submitting) return;
    
    setSubmitting(true);
    
    // Clear timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    try {
      const attemptData = {
        answers: answers.map((selectedOption, index) => ({
          questionIndex: index,
          selectedOption: selectedOption !== null ? selectedOption : -1
        })),
        timeSpent: (quiz.timeLimit * 60) - timeLeft,
        forcedSubmit: isForced
      };

      const response = await quizAPI.submitAttempt(id, attemptData);
      enableBackNavigation();
      navigate(`/results/${response.data._id}`);
    } catch (error) {
      setError('Failed to submit quiz attempt');
      setSubmitting(false);
      visibilityChangeDetected.current = false;
      
      // Restart timer if submission failed
      if (quizStarted.current && timeLeft > 0) {
        startTimer();
      }
    }
  }, [submitting, answers, quiz, timeLeft, id, navigate]);

  // Manual submit function
  const handleSubmit = async () => {
    startQuiz(); // Ensure quiz is marked as started
    setShowConfirmSubmit(true);
  };

  const confirmSubmit = async () => {
    if (submitting) return;
    
    setSubmitting(true);
    try {
      const attemptData = {
        answers: answers.map((selectedOption, index) => ({
          questionIndex: index,
          selectedOption: selectedOption !== null ? selectedOption : -1
        })),
        timeSpent: (quiz.timeLimit * 60) - timeLeft,
        forcedSubmit: false
      };

      const response = await quizAPI.submitAttempt(id, attemptData);
      enableBackNavigation();
      navigate(`/results/${response.data._id}`);
    } catch (error) {
      setError('Failed to submit quiz attempt');
      setSubmitting(false);
      setShowConfirmSubmit(false);
    }
  };

  const cancelSubmit = () => {
    setShowConfirmSubmit(false);
  };

  if (loading) return <Loader />;
  if (error) return <Alert type="error" message={error} />;
  if (!quiz) return <div>Quiz not found</div>;

  const currentQ = quiz.questions[currentQuestion];
  const allAnswered = answers.every(answer => answer !== null);
  const progressPercentage = (currentQuestion + 1) / quiz.questions.length * 100;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Warning Message for Tab Switch would appear here after auto-submit */}

      {/* Confirmation Modal */}
      {showConfirmSubmit && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <h3 className="text-xl font-semibold mb-4">Submit Quiz</h3>
            <p className="mb-6">
              {allAnswered 
                ? "Are you sure you want to submit your answers?" 
                : "You haven't answered all questions. Are you sure you want to submit?"}
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={cancelSubmit}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmSubmit}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                Confirm Submit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quiz Header */}
      <div className="bg-white shadow-md rounded-lg p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold text-gray-800">{quiz.title}</h1>
          <div className={`text-lg font-semibold ${timeLeft < 60 ? 'text-red-600' : 'text-gray-700'}`}>
            <FaClock className="inline mr-2" />
            {formatTime(timeLeft)}
          </div>
        </div>
        
        <p className="text-gray-600 mb-4">{quiz.description}</p>
        
        <div className="flex justify-between items-center text-sm text-gray-500">
          <span className="flex items-center">
            <FaUser className="mr-2" />
            By: {quiz.createdBy?.username}
          </span>
          <span className="flex items-center">
            <FaClipboardList className="mr-2" />
            Question {currentQuestion + 1} of {quiz.questions.length}
          </span>
        </div>

        {/* Progress Bar */}
        <div className="mt-4 w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-indigo-600 h-2 rounded-full transition-all duration-300" 
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>

      {/* Current Question */}
      <div className="bg-white shadow-md rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">{currentQ.questionText}</h2>
        
        <div className="space-y-3">
          {currentQ.options.map((option, index) => (
            <div
              key={index}
              className={`p-4 border rounded-lg cursor-pointer transition-all duration-200 ${
                answers[currentQuestion] === index
                  ? 'border-indigo-600 bg-indigo-50 shadow-md'
                  : 'border-gray-300 hover:border-indigo-400 hover:shadow-sm'
              }`}
              onClick={() => handleAnswerSelect(index)}
            >
              <div className="flex items-center">
                <div className={`w-6 h-6 rounded-full border flex items-center justify-center mr-3 ${
                  answers[currentQuestion] === index
                    ? 'border-indigo-600 bg-indigo-600 text-white'
                    : 'border-gray-400'
                }`}>
                  {answers[currentQuestion] === index && '✓'}
                </div>
                <span className="text-lg">{option}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between items-center">
        <button
          onClick={() => {
            startQuiz();
            setCurrentQuestion(prev => Math.max(0, prev - 1));
          }}
          disabled={currentQuestion === 0}
          className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 disabled:opacity-50 hover:bg-gray-50"
        >
          Previous
        </button>
        
        <div className="text-sm text-gray-600">
          {answers.filter(a => a !== null).length} of {quiz.questions.length} answered
        </div>
        
        {currentQuestion < quiz.questions.length - 1 ? (
          <button
            onClick={() => {
              startQuiz();
              setCurrentQuestion(prev => prev + 1);
            }}
            disabled={answers[currentQuestion] === null}
            className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
          >
            Next Question
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
          >
            {submitting ? 'Submitting...' : 'Submit Quiz'}
          </button>
        )}
      </div>

      {/* Question Navigation */}
      <div className="mt-8">
        <h3 className="text-lg font-semibold mb-3">Question Navigation</h3>
        <div className="grid grid-cols-5 gap-2">
          {quiz.questions.map((_, index) => (
            <button
              key={index}
              onClick={() => {
                startQuiz();
                setCurrentQuestion(index);
              }}
              className={`p-2 rounded text-sm ${
                index === currentQuestion
                  ? 'bg-indigo-600 text-white'
                  : answers[index] !== null
                  ? 'bg-green-100 text-green-800 border border-green-300'
                  : 'bg-gray-100 text-gray-700 border border-gray-300'
              } hover:shadow-md transition-all`}
            >
              {index + 1}
            </button>
          ))}
        </div>
      </div>

      {/* Instructions */}
      {!quizStarted.current && (
        <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="font-semibold text-blue-800 mb-2">
            <FaExclamationTriangle className="inline mr-2" />
            Important Instructions
          </h3>
          <ul className="text-blue-700 text-sm list-disc list-inside space-y-1">
            <li>Do not switch tabs or windows during the quiz</li>
            <li>The quiz will auto-submit if you navigate away</li>
            <li>Answer all questions before the time runs out</li>
            <li>Timer starts when you begin answering questions</li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default TakeQuiz;