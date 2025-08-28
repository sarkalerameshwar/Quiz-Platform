import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { quizAPI } from '../../services/quizzes';
import { useAuth } from '../../context/AuthContext';
import Loader from '../common/Loader';
import Alert from '../common/Alert';
import { FaUsers, FaChartBar, FaClock, FaTrophy, FaEye, FaArrowLeft } from 'react-icons/fa';

const QuizAttemptsList = () => {
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
    fetchQuizAndAttempts();
  }, [id]);

  const fetchQuizAndAttempts = async () => {
    try {
      setLoading(true);
      
      // Fetch quiz details
      const quizResponse = await quizAPI.getQuiz(id);
      setQuiz(quizResponse.data);
      
      // Verify user is the creator
      if (quizResponse.data.createdBy._id !== user._id) {
        setError('You are not authorized to view these attempts');
        return;
      }
      
      // Fetch all attempts for this quiz
      const attemptsResponse = await quizAPI.getQuizAttempts(id, 1, 100); // Get first 100 attempts
      setAttempts(attemptsResponse.data.attempts);
      
      // Calculate statistics
      calculateStats(attemptsResponse.data.attempts);
      
    } catch (error) {
      setError('Failed to load quiz attempts');
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
    return `${mins}m ${secs.toString().padStart(2, '0')}s`;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getScoreColor = (percentage) => {
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (loading) return <Loader />;
  if (error) return <Alert type="error" message={error} />;
  if (!quiz) return <div>Quiz not found</div>;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <Link
          to="/dashboard"
          className="flex items-center text-indigo-600 hover:text-indigo-700 font-medium"
        >
          <FaArrowLeft className="mr-2" />
          Back to Dashboard
        </Link>
        <h1 className="text-3xl font-bold text-gray-800">Quiz Attempts</h1>
        <div className="w-6"></div> {/* Spacer for balance */}
      </div>

      {/* Quiz Info */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
        <h2 className="text-2xl font-semibold text-gray-800 mb-2">{quiz.title}</h2>
        <p className="text-gray-600 mb-4">{quiz.description}</p>
        <div className="flex flex-wrap gap-4 text-sm text-gray-500">
          <span>Category: {quiz.category || 'General'}</span>
          <span>Time Limit: {quiz.timeLimit} minutes</span>
          <span>Questions: {quiz.questions?.length}</span>
          <span>Created by: {quiz.createdBy?.username}</span>
        </div>
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
            <FaTrophy className="w-6 h-6 text-red-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-800 mb-2">{stats.forcedSubmissions}</h3>
          <p className="text-gray-600">Auto-Submissions</p>
        </div>
      </div>

      {/* Attempts Table */}
      <div className="bg-white rounded-2xl shadow-lg p-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-gray-800">Attempt Details</h2>
          <span className="text-gray-500">{attempts.length} attempts</span>
        </div>
        
        {attempts.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📊</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No attempts yet</h3>
            <p className="text-gray-500">This quiz hasn't been attempted by any users yet.</p>
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
                    Percentage
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Time Spent
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Completed At
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {attempts.map((attempt) => {
                  const percentage = ((attempt.score / attempt.totalPoints) * 100).toFixed(1);
                  return (
                    <tr key={attempt._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {attempt.userId?.username || 'Unknown User'}
                        </div>
                        <div className="text-sm text-gray-500">
                          {attempt.userId?.email || 'No email'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {attempt.score}/{attempt.totalPoints}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`text-sm font-semibold ${getScoreColor(percentage)}`}>
                          {percentage}%
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
                        {formatDate(attempt.completedAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Link
                          to={`/results/${attempt._id}`}
                          className="inline-flex items-center px-3 py-1 bg-indigo-600 text-white text-sm rounded-md hover:bg-indigo-700"
                        >
                          <FaEye className="w-3 h-3 mr-1" />
                          View
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Additional Analytics */}
      {attempts.length > 0 && (
        <div className="bg-white rounded-2xl shadow-lg p-8 mt-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">Performance Analytics</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Score Distribution */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Score Distribution</h3>
              <div className="space-y-2">
                {[90, 80, 70, 60, 0].map((threshold, index, arr) => {
                  const nextThreshold = arr[index + 1] || 0;
                  const count = attempts.filter(attempt => {
                    const percentage = (attempt.score / attempt.totalPoints) * 100;
                    return percentage >= nextThreshold && percentage <= threshold;
                  }).length;
                  
                  const percentage = (count / attempts.length) * 100;
                  
                  return (
                    <div key={threshold} className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 w-20">
                        {nextThreshold}-{threshold}%
                      </span>
                      <div className="flex-1 mx-2 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-indigo-600 h-2 rounded-full" 
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <span className="text-sm text-gray-800 w-8">{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Time Analysis */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Time Analysis</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Fastest Completion:</span>
                  <span className="text-sm font-medium">
                    {formatTime(Math.min(...attempts.map(a => a.timeSpent)))}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Slowest Completion:</span>
                  <span className="text-sm font-medium">
                    {formatTime(Math.max(...attempts.map(a => a.timeSpent)))}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Average Time:</span>
                  <span className="text-sm font-medium">
                    {formatTime(stats.avgTimeSpent)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuizAttemptsList;