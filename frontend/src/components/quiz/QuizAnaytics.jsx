import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { quizAPI } from '../../services/quizzes';
import { useAuth } from '../../context/AuthContext';
import Loader from '../common/Loader';
import Alert from '../common/Alert';
import { FaUsers, FaChartBar, FaClock, FaAward, FaExclamationTriangle } from 'react-icons/fa';

const QuizAnalytics = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [quiz, setQuiz] = useState(null);
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState({
    totalAttempts: 0,
    averageScore: 0,
    completionRate: 0,
    avgTimeSpent: 0
  });

  useEffect(() => {
    fetchQuizData();
  }, [id]);

  const fetchQuizData = async () => {
    try {
      setLoading(true);
      
      // Fetch quiz details
      const quizResponse = await quizAPI.getQuiz(id);
      setQuiz(quizResponse.data);
      
      // Verify user is the creator
      if (quizResponse.data.createdBy._id !== user._id) {
        setError('You are not authorized to view these analytics');
        return;
      }
      
      // Fetch all attempts for this quiz
      const attemptsResponse = await quizAPI.getQuizAttempts(id);
      setAttempts(attemptsResponse.data.attempts);
      
      // Calculate statistics
      calculateStats(attemptsResponse.data.attempts);
      
    } catch (error) {
      setError('Failed to load quiz analytics');
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (attemptsData) => {
    const total = attemptsData.length;
    const totalScore = attemptsData.reduce((sum, attempt) => sum + attempt.score, 0);
    const totalTime = attemptsData.reduce((sum, attempt) => sum + attempt.timeSpent, 0);
    const completedAttempts = attemptsData.filter(attempt => attempt.status === 'completed').length;
    const forcedAttempts = attemptsData.filter(attempt => attempt.status === 'forced').length;

    setStats({
      totalAttempts: total,
      averageScore: total > 0 ? (totalScore / total).toFixed(1) : 0,
      completionRate: total > 0 ? ((completedAttempts / total) * 100).toFixed(1) : 0,
      avgTimeSpent: total > 0 ? Math.round(totalTime / total) : 0,
      forcedSubmissions: forcedAttempts
    });
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  if (loading) return <Loader />;
  if (error) return <Alert type="error" message={error} />;
  if (!quiz) return <div>Quiz not found</div>;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-2">{quiz.title} - Analytics</h1>
        <p className="text-gray-600 text-lg">{quiz.description}</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-2xl shadow-lg p-6 text-center">
          <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-xl mx-auto mb-4">
            <FaUsers className="w-6 h-6 text-blue-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-800 mb-2">{stats.totalAttempts}</h3>
          <p className="text-gray-600">Total Attempts</p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 text-center">
          <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-xl mx-auto mb-4">
            <FaChartBar className="w-6 h-6 text-green-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-800 mb-2">{stats.averageScore}%</h3>
          <p className="text-gray-600">Average Score</p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 text-center">
          <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-xl mx-auto mb-4">
            <FaClock className="w-6 h-6 text-purple-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-800 mb-2">{formatTime(stats.avgTimeSpent)}</h3>
          <p className="text-gray-600">Avg Time Spent</p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 text-center">
          <div className="flex items-center justify-center w-12 h-12 bg-red-100 rounded-xl mx-auto mb-4">
            <FaExclamationTriangle className="w-6 h-6 text-red-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-800 mb-2">{stats.forcedSubmissions}</h3>
          <p className="text-gray-600">Auto-Submissions</p>
        </div>
      </div>

      {/* Attempts Table */}
      <div className="bg-white rounded-2xl shadow-lg p-8">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">Attempt Details</h2>
        
        {attempts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No attempts recorded yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full table-auto">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Score
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Time Spent
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {attempts.map((attempt) => (
                  <tr key={attempt._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {attempt.userId?.username || 'Unknown User'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 font-semibold">
                        {attempt.score}/{attempt.totalPoints}
                      </div>
                      <div className="text-sm text-gray-500">
                        {((attempt.score / attempt.totalPoints) * 100).toFixed(1)}%
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatTime(attempt.timeSpent)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        attempt.status === 'forced' 
                          ? 'bg-red-100 text-red-800' 
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {attempt.status === 'forced' ? 'Auto-Submitted' : 'Completed'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(attempt.completedAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Question Analysis */}
      <div className="bg-white rounded-2xl shadow-lg p-8 mt-8">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">Question Analysis</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {quiz.questions.map((question, index) => {
            const correctAttempts = attempts.filter(attempt => 
              attempt.answers[index]?.isCorrect
            ).length;
            const accuracy = attempts.length > 0 ? (correctAttempts / attempts.length * 100).toFixed(1) : 0;
            
            return (
              <div key={index} className="border rounded-xl p-4">
                <h3 className="font-semibold text-lg mb-2">Q{index + 1}: {question.questionText}</h3>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-gray-600">Accuracy: {accuracy}%</span>
                  <span className="text-sm text-gray-600">{correctAttempts}/{attempts.length} correct</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-indigo-600 h-2 rounded-full" 
                    style={{ width: `${accuracy}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default QuizAnalytics;