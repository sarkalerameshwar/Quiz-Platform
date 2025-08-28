import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {FaChartBar} from 'react-icons/fa';
import {
  FaUser,
  FaClock,
  FaClipboardList,
  FaTag,
  FaEdit,
  FaTrash,
} from "react-icons/fa";

const QuizCard = ({
  quiz,
  showActions = false,
  userAttempt,
  onDelete,
  isQuizCreator = false,
}) => {
  const handleDelete = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onDelete(quiz._id);
  };

  const hasAttempt = userAttempt && userAttempt._id;

  return (
    <motion.div
      className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 cursor-pointer border border-gray-100 flex flex-col"
      whileHover={{ scale: 1.02, y: -5 }}
      whileTap={{ scale: 0.98 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.3 }}
      style={{ minHeight: "480px" }} // fixed height for uniformity
    >
      <div className="p-8 flex flex-col justify-between h-full">
        {/* Quiz Title and Description */}
        <div className="mb-6 flex-1">
          <h3 className="text-3xl font-bold text-gray-800 mb-4 hover:text-indigo-700 transition-colors duration-200 line-clamp-2">
            {quiz.title}
          </h3>
          <p className="text-lg text-gray-600 line-clamp-3 leading-relaxed">
            {quiz.description || "Test your knowledge with this engaging quiz."}
          </p>
        </div>
        {/* Info Section */}
        <div className="grid grid-cols-2 gap-4 mb-6 text-base">
          <div className="flex items-center space-x-3 text-gray-700">
            <FaUser className="text-indigo-500 text-lg" />
            <span className="font-medium">
              {quiz.createdBy?.username || "Unknown"}
            </span>
          </div>
          <div className="flex items-center space-x-3 text-gray-700">
            <FaClock className="text-indigo-500 text-lg" />
            <span className="font-medium">{quiz.timeLimit} min</span>
          </div>
          <div className="flex items-center space-x-3 text-gray-700">
            <FaClipboardList className="text-indigo-500 text-lg" />
            <span className="font-medium">
              {quiz.questions?.length || 0} questions
            </span>
          </div>
          <div className="flex items-center space-x-3 text-gray-700">
            <FaTag className="text-indigo-500 text-lg" />
            <span className="font-medium capitalize">
              {quiz.category || "General"}
            </span>
          </div>
        </div>
        {/* Attempt Status */}
        {hasAttempt && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2 }}
            className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-xl"
          >
            <div className="font-semibold text-blue-800 text-lg mb-2">
              Quiz Completed
            </div>
            <div className="text-blue-600 text-base">
              Score:{" "}
              <span className="font-bold">
                {userAttempt.score}/{userAttempt.totalPoints}
              </span>{" "}
              • {new Date(userAttempt.completedAt).toLocaleDateString()}
            </div>
          </motion.div>
        )}
        {/* Action Buttons */}
        {showActions && (
          <div className="flex space-x-3 mb-6">
            <Link
              to={`/edit-quiz/${quiz._id}`}
              className="flex-1 bg-blue-600 text-white text-center py-3 px-4 rounded-lg text-base font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
            >
              <FaEdit className="text-lg" />
              <span>Edit</span>
            </Link>
            <button
              onClick={handleDelete}
              className="flex-1 bg-red-600 text-white py-3 px-4 rounded-lg text-base font-semibold hover:bg-red-700 transition-colors flex items-center justify-center space-x-2"
            >
              <FaTrash className="text-lg" />
              <span>Delete</span>
            </button>
          </div>
        )}
        {/* // Add this import  // Add
        this button in the showActions section */}
        {showActions && (
          <div className="flex space-x-2 mb-4">
            <Link
              to={`/quiz-attempts/${quiz._id}`}
              className="flex-1 bg-purple-600 text-white text-center py-2 px-3 rounded text-sm hover:bg-purple-700 transition-colors flex items-center justify-center"
            >
              <FaChartBar className="mr-1" />
              View Attempts
            </Link>
            {/* ... other buttons ... */}
          </div>
        )}
        {/* Take/View Quiz Button */}
        {!isQuizCreator && (
          <Link
            to={
              hasAttempt ? `/results/${userAttempt._id}` : `/quiz/${quiz._id}`
            }
            className={`w-full py-3 rounded-xl text-white text-center transition-colors text-base font-semibold ${
              hasAttempt
                ? "bg-green-600 hover:bg-green-700 shadow-green"
                : "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-indigo"
            } shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200`}
          >
            {hasAttempt ? "View Results" : "Start Quiz"}
          </Link>
        )}
      </div>
    </motion.div>
  );
};

export default QuizCard;
