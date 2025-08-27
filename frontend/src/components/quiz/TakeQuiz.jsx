import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { quizAPI } from '../../services/quizzes';
import { preventBackNavigation, enableBackNavigation } from '../../utils/history';
import Loader from '../common/Loader';
import Alert from '../common/Alert';

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
  const [visibilityChange, setVisibilityChange] = useState(false);

  // Handle tab visibility change
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && !submitting && quiz) {
        // User switched tabs or minimized window
        setVisibilityChange(true);
        handleAutoSubmit();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [submitting, quiz]);

  // Handle window blur (switching apps)
  useEffect(() => {
    const handleWindowBlur = () => {
      if (!submitting && quiz) {
        setVisibilityChange(true);
        handleAutoSubmit();
      }
    };

    window.addEventListener('blur', handleWindowBlur);
    
    return () => {
      window.removeEventListener('blur', handleWindowBlur);
    };
  }, [submitting, quiz]);

  useEffect(() => {
    preventBackNavigation();
    fetchQuiz();
    
    return () => {
      enableBackNavigation();
    };
  }, [id]);

  useEffect(() => {
    if (quiz && quiz.timeLimit) {
      setTimeLeft(quiz.timeLimit * 60);
    }
  }, [quiz]);

  useEffect(() => {
    if (timeLeft > 0 && !showConfirmSubmit && !visibilityChange) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && quiz && !showConfirmSubmit && !visibilityChange) {
      handleAutoSubmit();
    }
  }, [timeLeft, showConfirmSubmit, visibilityChange]);

  const fetchQuiz = async () => {
    try {
      setLoading(true);
      const response = await quizAPI.getQuiz(id);
      setQuiz(response.data);
      setAnswers(Array(response.data.questions.length).fill(null));
    } catch (error) {
      setError('Failed to load quiz');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerSelect = (selectedOption) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = selectedOption;
    setAnswers(newAnswers);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAutoSubmit = useCallback(async () => {
    if (submitting) return;
    
    setSubmitting(true);
    try {
      const attemptData = {
        answers: answers.map((selectedOption, index) => ({
          questionIndex: index,
          selectedOption: selectedOption !== null ? selectedOption : -1
        })),
        timeSpent: (quiz.timeLimit * 60) - timeLeft,
        forcedSubmit: visibilityChange
      };

      const response = await quizAPI.submitAttempt(id, attemptData);
      enableBackNavigation();
      navigate(`/results/${response.data._id}`);
    } catch (error) {
      setError('Failed to submit quiz attempt');
      setSubmitting(false);
    }
  }, [submitting, answers, quiz, timeLeft, visibilityChange, id, navigate]);

  const handleSubmit = async () => {
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
    <div className="max-w-4xl mx-auto">
      {/* Warning Message for Tab Switch */}
      {visibilityChange && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6">
          <p className="font-semibold">Quiz Auto-Submitted</p>
          <p>Your quiz was automatically submitted because you switched tabs or windows.</p>
        </div>
      )}

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
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={confirmSubmit}
                className="px-4 py-2 bg-green-600 text-white rounded-md"
              >
                Confirm Submit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rest of the component remains the same */}
      {/* ... (previous JSX content) ... */}
    </div>
  );
};

export default TakeQuiz;