import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { quizAPI } from '../../services/quizzes';
import Loader from '../common/Loader';
import { motion, AnimatePresence } from 'framer-motion';
import Alert from '../common/Alert';
import { FaClock, FaGlobe, FaPlus, FaTrash, FaSave } from 'react-icons/fa';

// ...imports remain the same

const CreateQuiz = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [quizData, setQuizData] = useState({
    title: '',
    description: '',
    timeLimit: 15,
    category: '',
    isPublic: true,
    questions: [
      { questionText: '', options: ['', '', '', ''], correctAnswer: 0, points: 1 }
    ]
  });

  const handleQuizChange = (e) => {
    const { name, value, type, checked } = e.target;
    setQuizData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleQuestionChange = (index, field, value) => {
    const updatedQuestions = [...quizData.questions];
    updatedQuestions[index] = { ...updatedQuestions[index], [field]: value };
    setQuizData(prev => ({ ...prev, questions: updatedQuestions }));
  };

  const handleOptionChange = (qIndex, optIndex, value) => {
    const updatedQuestions = [...quizData.questions];
    updatedQuestions[qIndex].options[optIndex] = value;
    setQuizData(prev => ({ ...prev, questions: updatedQuestions }));
  };

  const addQuestion = () => {
    setQuizData(prev => ({
      ...prev,
      questions: [...prev.questions, { questionText: '', options: ['', '', '', ''], correctAnswer: 0, points: 1 }]
    }));
  };

  const removeQuestion = (index) => {
    if (quizData.questions.length > 1) {
      setQuizData(prev => ({
        ...prev,
        questions: prev.questions.filter((_, i) => i !== index)
      }));
    }
  };

  const validateForm = () => {
    if (!quizData.title.trim()) {
      setError('Quiz title is required');
      return false;
    }
    if (quizData.timeLimit < 1) {
      setError('Time limit must be at least 1 minute');
      return false;
    }
    for (let i = 0; i < quizData.questions.length; i++) {
      const q = quizData.questions[i];
      if (!q.questionText.trim()) {
        setError(`Question ${i + 1} text is required`);
        return false;
      }
      if (q.options.some(opt => !opt.trim())) {
        setError(`All options for question ${i + 1} are required`);
        return false;
      }
      if (q.points < 1) {
        setError(`Points for question ${i + 1} must be at least 1`);
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!validateForm()) return;

    setLoading(true);
    try {
      await quizAPI.createQuiz(quizData);
      setSuccess('Quiz created successfully! Redirecting...');
      setTimeout(() => navigate('/dashboard'), 1200);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create quiz');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Create New Quiz</h1>
        <p className="text-gray-600">Design engaging quizzes with multiple choice questions</p>
      </motion.div>

      {/* Alerts */}
      <AnimatePresence>
        {error && <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="mb-4">
          <Alert type="error" message={error} onClose={() => setError('')} />
        </motion.div>}
        {success && <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="mb-4">
          <Alert type="success" message={success} />
        </motion.div>}
      </AnimatePresence>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Quiz Details */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-xl shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Quiz Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <input
              type="text" name="title" value={quizData.title} onChange={handleQuizChange}
              placeholder="Title *" className="col-span-1 md:col-span-3 px-3 py-2 border rounded text-gray-700 focus:ring-1 focus:ring-indigo-500"
            />
            <input
              type="text" name="category" value={quizData.category} onChange={handleQuizChange}
              placeholder="Category" className="px-3 py-2 border rounded text-gray-700 focus:ring-1 focus:ring-indigo-500"
            />
            <input
              type="number" name="timeLimit" value={quizData.timeLimit} onChange={handleQuizChange}
              placeholder="Time Limit (min)" min={1} className="px-3 py-2 border rounded text-gray-700 focus:ring-1 focus:ring-indigo-500"
            />
          </div>
          <textarea
            name="description" value={quizData.description} onChange={handleQuizChange}
            rows={3} placeholder="Description" className="w-full px-3 py-2 border rounded text-gray-700 focus:ring-1 focus:ring-indigo-500"
          />
        </motion.div>

        {/* Questions */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-xl shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Questions</h2>
            <span className="text-gray-600">{quizData.questions.length} question{quizData.questions.length > 1 ? 's' : ''}</span>
          </div>

          <div className="space-y-4">
            {quizData.questions.map((q, qi) => (
              <div key={qi} className="border p-4 rounded relative bg-gray-50">
                {quizData.questions.length > 1 && (
                  <button type="button" onClick={() => removeQuestion(qi)} className="absolute top-2 right-2 text-red-500 hover:text-red-700">✕</button>
                )}
                <input
                  type="text" value={q.questionText} onChange={(e) => handleQuestionChange(qi, 'questionText', e.target.value)}
                  placeholder={`Question ${qi + 1}`} className="w-full px-3 py-2 border rounded mb-2 focus:ring-1 focus:ring-indigo-500"
                />
                {q.options.map((opt, oi) => (
                  <div key={oi} className="flex items-center space-x-2 mb-2">
                    <input type="radio" name={`correct-${qi}`} checked={q.correctAnswer === oi} onChange={() => handleQuestionChange(qi, 'correctAnswer', oi)} />
                    <input type="text" value={opt} onChange={(e) => handleOptionChange(qi, oi, e.target.value)} placeholder={`Option ${oi + 1}`} className="flex-1 px-2 py-1 border rounded focus:ring-1 focus:ring-indigo-500" />
                  </div>
                ))}
                <input type="number" value={q.points} onChange={(e) => handleQuestionChange(qi, 'points', parseInt(e.target.value) || 1)} min={1} placeholder="Points" className="w-20 px-2 py-1 border rounded focus:ring-1 focus:ring-indigo-500" />
              </div>
            ))}
          </div>

          <button type="button" onClick={addQuestion} className="mt-4 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 text-sm">Add Question</button>
        </motion.div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3">
          <button type="button" onClick={() => navigate('/dashboard')} className="px-4 py-2 border rounded text-gray-700 hover:bg-gray-100 text-sm">Cancel</button>
          <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 text-sm">Create Quiz</button>
        </div>
      </form>
    </div>
  );
};

export default CreateQuiz;
