import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showNavItems, setShowNavItems] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const isQuizPage = location.pathname.startsWith("/quiz/");
    const isResultsPage = location.pathname.startsWith("/results/");
    setShowNavItems(!isQuizPage || isResultsPage);
  }, [location]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="bg-gray-900 border-b border-gray-800 shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link
            to="/dashboard"
            className="text-2xl font-bold tracking-tight text-white hover:text-indigo-400 transition-colors"
          >
            Quiz<span className="text-indigo-500">Platform</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-8">
            {isAuthenticated && showNavItems ? (
              <>
                <Link
                  to="/dashboard"
                  className="text-gray-300 hover:text-indigo-400 transition-colors font-medium"
                >
                  Dashboard
                </Link>
                <Link
                  to="/create-quiz"
                  className="text-gray-300 hover:text-indigo-400 transition-colors font-medium"
                >
                  Create Quiz
                </Link>
                <span className="text-gray-400 italic">
                  Hi, {user?.username}
                </span>
              </>
            ) : isAuthenticated ? (
              <span className="text-gray-400 font-medium">Quiz in Progress</span>
            ) : null}

            {isAuthenticated && (
              <button
                onClick={handleLogout}
                className="ml-4 bg-indigo-600 text-white font-semibold px-4 py-2 rounded-lg shadow hover:bg-indigo-700 transition-all"
              >
                Logout
              </button>
            )}
          </div>

          {/* Mobile Hamburger */}
          <div className="md:hidden">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="focus:outline-none"
            >
              {menuOpen ? (
                <X className="w-7 h-7 text-gray-300 hover:text-indigo-400 transition" />
              ) : (
                <Menu className="w-7 h-7 text-gray-300 hover:text-indigo-400 transition" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Dropdown */}
      {menuOpen && (
        <div className="md:hidden bg-gray-900 border-t border-gray-800 shadow-lg">
          <div className="px-4 py-4 space-y-3">
            {isAuthenticated && showNavItems ? (
              <>
                <Link
                  to="/dashboard"
                  className="block text-gray-300 hover:bg-gray-800 hover:text-indigo-400 px-3 py-2 rounded-lg font-medium transition"
                  onClick={() => setMenuOpen(false)}
                >
                  Dashboard
                </Link>
                <Link
                  to="/create-quiz"
                  className="block text-gray-300 hover:bg-gray-800 hover:text-indigo-400 px-3 py-2 rounded-lg font-medium transition"
                  onClick={() => setMenuOpen(false)}
                >
                  Create Quiz
                </Link>
                <span className="block text-gray-400 italic">
                  Hi, {user?.username}
                </span>
              </>
            ) : isAuthenticated ? (
              <span className="block text-gray-400">Quiz in Progress</span>
            ) : null}

            {isAuthenticated && (
              <button
                onClick={() => {
                  handleLogout();
                  setMenuOpen(false);
                }}
                className="w-full text-center bg-indigo-600 text-white font-semibold px-4 py-2 rounded-lg shadow hover:bg-indigo-700 transition-all"
              >
                Logout
              </button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
