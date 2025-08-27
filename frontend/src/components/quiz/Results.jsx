import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { quizAPI } from '../../services/quizzes';
import { useAuth } from '../../context/AuthContext';
import Loader from '../common/Loader';
import Alert from '../common/Alert';

const Results = () => {
  const { attemptId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [attempt, setAttempt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAttempt();
  }, [attemptId]);

  const fetchAttempt = async () => {
    try {
      setLoading(true);
      const response = await quizAPI.getAttempt(attemptId);
      setAttempt(response.data);
      
      // Verify this attempt belongs to the current user
      if (response.data.userId._id !== user._id) {
        setError('You are not authorized to view these results');
      }
    } catch (error) {
      setError('Failed to load results');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loader />;
  if (error) return <Alert type="error" message={error} />;
  if (!attempt) return <div>Results not found</div>;

  const percentage = Math.round((attempt.score / attempt.totalPoints) * 100);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white shadow-md rounded-lg p-6 mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Quiz Results</h1>
        <h2 className="text-xl text-indigo-600 mb-4">{attempt.quizId.title}</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-3xl font-bold text-blue-600">{attempt.score}/{attempt.totalPoints}</div>
            <div className="text-blue-800">Score</div>
          </div>
          
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-3xl font-bold text-green-600">{percentage}%</div>
            <div className="text-green-800">Percentage</div>
          </div>
          
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="text-3xl font-bold text-purple-600">
              {Math.floor(attempt.timeSpent / 60)}:{(attempt.timeSpent % 60).toString().padStart(2, '0')}
            </div>
            <div className="text-purple-800">Time Spent</div>
          </div>
        </div>

        <div className="text-center">
          <Link
            to="/dashboard"
            className="inline-block bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700 mr-4"
          >
            Back to Dashboard
          </Link>
          <button
            onClick={() => navigate('/')}
            className="inline-block bg-gray-600 text-white px-6 py-2 rounded-md hover:bg-gray-700"
          >
            Take Another Quiz
          </button>
        </div>
      </div>

      <div className="bg-white shadow-md rounded-lg p-6">
        <h3 className="text-xl font-semibold mb-4">Question Review</h3>
        
        {attempt.quizId.questions.map((question, index) => {
          const userAnswer = attempt.answers.find(a => a.questionIndex === index);
          const isCorrect = userAnswer?.isCorrect;
          
          return (
            <div key={index} className="border-b border-gray-200 pb-4 mb-4 last:border-b-0 last:pb-0 last:mb-0">
              <div className="flex items-start mb-3">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center mr-3 mt-1 ${
                  isCorrect ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                }`}>
                  {isCorrect ? '✓' : '✗'}
                </div>
                <h4 className="text-lg font-medium">{question.questionText}</h4>
              </div>
              
              <div className="ml-9 space-y-2">
                {question.options.map((option, optIndex) => {
                  const isSelected = userAnswer?.selectedOption === optIndex;
                  const isCorrectOption = optIndex === question.correctAnswer;
                  
                  return (
                    <div
                      key={optIndex}
                      className={`p-2 rounded ${
                        isCorrectOption
                          ? 'bg-green-100 border border-green-300'
                          : isSelected
                          ? 'bg-red-100 border border-red-300'
                          : 'bg-gray-50'
                      }`}
                    >
                      {option}
                      {isCorrectOption && (
                        <span className="ml-2 text-green-600 text-sm">✓ Correct answer</span>
                      )}
                      {isSelected && !isCorrectOption && (
                        <span className="ml-2 text-red-600 text-sm">✗ Your answer</span>
                      )}
                    </div>
                  );
                })}
              </div>
              
              <div className="ml-9 mt-2 text-sm text-gray-600">
                Points: {userAnswer?.points || 0}/{question.points}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Results;