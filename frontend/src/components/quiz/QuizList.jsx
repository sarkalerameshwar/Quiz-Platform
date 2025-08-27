import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { quizAPI } from '../../services/quizzes';
import { useAuth } from '../../context/AuthContext';
import QuizCard from './QuizCard';
import Loader from '../common/Loader';
import Alert from '../common/Alert';
import { FaPlus, FaSearch, FaFilter, FaSync } from 'react-icons/fa';

const QuizList = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [userQuizzes, setUserQuizzes] = useState([]);
  const [userAttempts, setUserAttempts] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('public');
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [refreshing, setRefreshing] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    totalQuizzes: 0
  });

  const { user } = useAuth();

  useEffect(() => {
    fetchQuizzes();
    fetchUserAttempts();
  }, [pagination.page, activeTab, categoryFilter]);

  const fetchQuizzes = async () => {
    try {
      setLoading(true);
      let response;
      
      if (activeTab === 'public') {
        response = await quizAPI.getQuizzes(pagination.page, 9);
        setQuizzes(response.data.quizzes);
        setPagination({
          page: response.data.currentPage,
          totalPages: response.data.totalPages,
          totalQuizzes: response.data.totalQuizzes
        });
      } else {
        response = await quizAPI.getUserQuizzes(pagination.page, 9);
        setUserQuizzes(response.data.quizzes);
        setPagination({
          page: response.data.currentPage,
          totalPages: response.data.totalPages,
          totalQuizzes: response.data.totalQuizzes
        });
      }
    } catch (error) {
      setError('Failed to fetch quizzes');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchUserAttempts = async () => {
    try {
      const attemptsMap = {};
      
      if (activeTab === 'public') {
        const response = await quizAPI.getQuizzes(1, 100);
        for (const quiz of response.data.quizzes) {
          try {
            const attemptsResponse = await quizAPI.getUserAttempts(quiz._id);
            if (attemptsResponse.data.attempts.length > 0) {
              attemptsMap[quiz._id] = attemptsResponse.data.attempts[0];
            }
          } catch (error) {
            // No attempts found
          }
        }
      }
      
      setUserAttempts(attemptsMap);
    } catch (error) {
      console.error('Failed to fetch user attempts:', error);
    }
  };

  const handleDeleteQuiz = async (quizId) => {
    if (!window.confirm('Are you sure you want to delete this quiz? This action cannot be undone.')) {
      return;
    }

    try {
      await quizAPI.deleteQuiz(quizId);
      setUserQuizzes(prev => prev.filter(quiz => quiz._id !== quizId));
      fetchQuizzes();
    } catch (error) {
      setError('Failed to delete quiz');
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchQuizzes();
    fetchUserAttempts();
  };

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setPagination(prev => ({ ...prev, page: 1 }));
    setSearchTerm('');
    setCategoryFilter('all');
  };

  // Filter quizzes based on search and category
  const filteredQuizzes = (activeTab === 'public' ? quizzes : userQuizzes).filter(quiz => {
    const matchesSearch = quiz.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         quiz.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || quiz.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  // Get unique categories for filter
  const categories = [...new Set([...quizzes, ...userQuizzes]
    .map(quiz => quiz.category)
    .filter(category => category))];

  if (loading) return <Loader />;
  if (error) return <Alert type="error" message={error} onClose={() => setError('')} />;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-lg p-6 mb-8"
        >
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div>
              <h1 className="text-4xl font-bold text-gray-800 mb-2">
                {activeTab === 'public' ? 'Discover Quizzes' : 'My Quiz Library'}
              </h1>
              <p className="text-lg text-gray-600">
                {activeTab === 'public' 
                  ? 'Explore and challenge yourself with various quizzes' 
                  : 'Manage and track your created quizzes'}
              </p>
            </div>
            
            {activeTab === 'my' && (
              <Link
                to="/create-quiz"
                className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 flex items-center space-x-2 font-semibold shadow-lg hover:shadow-xl"
              >
                <FaPlus className="text-lg" />
                <span>Create New Quiz</span>
              </Link>
            )}
          </div>
        </motion.div>

        {/* Tab Navigation */}
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl shadow-lg p-6 mb-8"
        >
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex space-x-1 bg-gray-100 p-1 rounded-xl">
              {[
                { id: 'public', label: 'Public Quizzes' },
                { id: 'my', label: 'My Quizzes' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={`px-6 py-3 rounded-xl text-sm font-medium transition-all duration-300 ${
                    activeTab === tab.id
                      ? 'bg-white text-indigo-600 shadow-md'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="p-3 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors duration-300 disabled:opacity-50"
                title="Refresh quizzes"
              >
                <FaSync className={`text-gray-600 ${refreshing ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>

          {/* Search and Filter */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaSearch className="text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search quizzes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaFilter className="text-gray-400" />
              </div>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent appearance-none bg-white"
              >
                <option value="all">All Categories</option>
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </motion.div>

        {/* Quiz Grid */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab + searchTerm + categoryFilter}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {filteredQuizzes.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-16 bg-white rounded-2xl shadow-lg"
              >
                <div className="text-6xl mb-4">📚</div>
                <h3 className="text-2xl font-semibold text-gray-700 mb-2">
                  {searchTerm || categoryFilter !== 'all' 
                    ? 'No matching quizzes found' 
                    : activeTab === 'public' 
                    ? 'No quizzes available yet' 
                    : "You haven't created any quizzes"}
                </h3>
                <p className="text-gray-500 mb-6">
                  {searchTerm || categoryFilter !== 'all' 
                    ? 'Try adjusting your search or filter criteria' 
                    : activeTab === 'public' 
                    ? 'Be the first to create a quiz!' 
                    : 'Start creating your first quiz to share with others'}
                </p>
                {activeTab === 'my' && (
                  <Link
                    to="/create-quiz"
                    className="inline-flex items-center px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors duration-300 font-semibold"
                  >
                    <FaPlus className="mr-2" />
                    Create Your First Quiz
                  </Link>
                )}
              </motion.div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 mb-8">
                  <AnimatePresence>
                    {filteredQuizzes.map((quiz, index) => (
                      <motion.div
                        key={quiz._id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                      >
                        <QuizCard
                          quiz={quiz}
                          showActions={activeTab === 'my'}
                          userAttempt={userAttempts[quiz._id]}
                          onDelete={handleDeleteQuiz}
                          isQuizCreator={user && quiz.createdBy && user._id === quiz.createdBy._id}
                        />
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="flex justify-center items-center space-x-2 mt-12"
                  >
                    <button
                      onClick={() => handlePageChange(pagination.page - 1)}
                      disabled={pagination.page === 1}
                      className="px-4 py-2 border border-gray-300 rounded-xl hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-300 font-medium"
                    >
                      Previous
                    </button>
                    
                    <div className="flex space-x-1">
                      {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                        const page = pagination.page <= 3 
                          ? i + 1 
                          : pagination.page >= pagination.totalPages - 2 
                          ? pagination.totalPages - 4 + i 
                          : pagination.page - 2 + i;
                        
                        return page > 0 && page <= pagination.totalPages ? (
                          <button
                            key={page}
                            onClick={() => handlePageChange(page)}
                            className={`w-10 h-10 rounded-xl font-medium transition-all duration-300 ${
                              pagination.page === page 
                                ? 'bg-indigo-600 text-white shadow-lg' 
                                : 'border border-gray-300 hover:bg-gray-50'
                            }`}
                          >
                            {page}
                          </button>
                        ) : null;
                      })}
                    </div>
                    
                    <button
                      onClick={() => handlePageChange(pagination.page + 1)}
                      disabled={pagination.page === pagination.totalPages}
                      className="px-4 py-2 border border-gray-300 rounded-xl hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-300 font-medium"
                    >
                      Next
                    </button>
                  </motion.div>
                )}
              </>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Stats Footer */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-12 text-center text-gray-500 text-sm"
        >
          <p>
            Showing {filteredQuizzes.length} of {pagination.totalQuizzes} quizzes • 
            Page {pagination.page} of {pagination.totalPages}
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default QuizList;