import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Alert from '../common/Alert';
import { FaUser, FaEnvelope, FaLock, FaCheck, FaRocket } from 'react-icons/fa';

const Register = () => {
  const [userData, setUserData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserData({
      ...userData,
      [name]: value
    });

    // Check password strength in real-time
    if (name === 'password') {
      checkPasswordStrength(value);
    }
  };

  const checkPasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 6) strength += 25;
    if (/\d/.test(password)) strength += 25;
    if (/[!@#$%^&*]/.test(password)) strength += 25;
    if (/[A-Z]/.test(password)) strength += 25;
    setPasswordStrength(strength);
  };

  const validateForm = () => {
    const newErrors = {};

    if (!userData.username.trim()) {
      newErrors.username = 'Username is required';
    } else if (userData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    } else if (/[^a-zA-Z0-9_]/.test(userData.username)) {
      newErrors.username = 'Username can only contain letters, numbers, and _';
    }

    if (!userData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^\S+@\S+\.\S+$/.test(userData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!userData.password) {
      newErrors.password = 'Password is required';
    } else if (userData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (userData.password !== userData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setErrors({});
    const { confirmPassword, ...registrationData } = userData;

    try {
      const result = await register(registrationData);
      if (result.success) {
        navigate('/dashboard');
      } else {
        setErrors({ general: result.error || 'Registration failed. Please try again.' });
      }
    } catch (err) {
      setErrors({ general: 'Something went wrong. Please try again later.' });
    }
    setLoading(false);
  };

  const getPasswordStrengthColor = () => {
    if (passwordStrength === 0) return 'bg-gray-200';
    if (passwordStrength <= 25) return 'bg-red-500';
    if (passwordStrength <= 50) return 'bg-orange-500';
    if (passwordStrength <= 75) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getPasswordStrengthText = () => {
    if (passwordStrength === 0) return '';
    if (passwordStrength <= 25) return 'Very Weak';
    if (passwordStrength <= 50) return 'Weak';
    if (passwordStrength <= 75) return 'Good';
    return 'Strong';
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50 px-4 py-8">
      <div className="max-w-md w-full">
        {/* Header Section */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
              <FaRocket className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Quiz<span className="text-indigo-600">Platform</span>
          </h1>
          <p className="text-gray-600 text-lg">
            Join thousands of learners testing their knowledge
          </p>
        </div>

        {/* Form Container */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 space-y-6 border border-gray-100">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900">Create Your Account</h2>
            <p className="text-gray-500 mt-2">Start your learning journey today</p>
          </div>

          {errors.general && (
            <Alert type="error" message={errors.general} onClose={() => setErrors({})} />
          )}

          <form className="space-y-5" onSubmit={handleSubmit}>
            {/* Username Field */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 flex items-center">
                <FaUser className="w-4 h-4 mr-2 text-indigo-600" />
                Username
              </label>
              <input
                name="username"
                type="text"
                placeholder="Enter your username"
                value={userData.username}
                onChange={handleChange}
                className={`w-full px-4 py-3 rounded-xl border-2 ${
                  errors.username ? 'border-red-500' : 'border-gray-200 hover:border-indigo-300'
                } focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all duration-200`}
              />
              {errors.username && (
                <p className="text-red-500 text-sm mt-1 flex items-center">
                  <FaCheck className="w-3 h-3 mr-1" />
                  {errors.username}
                </p>
              )}
            </div>

            {/* Email Field */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 flex items-center">
                <FaEnvelope className="w-4 h-4 mr-2 text-indigo-600" />
                Email Address
              </label>
              <input
                name="email"
                type="email"
                placeholder="Enter your email"
                value={userData.email}
                onChange={handleChange}
                className={`w-full px-4 py-3 rounded-xl border-2 ${
                  errors.email ? 'border-red-500' : 'border-gray-200 hover:border-indigo-300'
                } focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all duration-200`}
              />
              {errors.email && (
                <p className="text-red-500 text-sm mt-1 flex items-center">
                  <FaCheck className="w-3 h-3 mr-1" />
                  {errors.email}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 flex items-center">
                <FaLock className="w-4 h-4 mr-2 text-indigo-600" />
                Password
              </label>
              <input
                name="password"
                type="password"
                placeholder="Create a strong password"
                value={userData.password}
                onChange={handleChange}
                className={`w-full px-4 py-3 rounded-xl border-2 ${
                  errors.password ? 'border-red-500' : 'border-gray-200 hover:border-indigo-300'
                } focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all duration-200`}
              />
              
              {/* Password Strength Meter */}
              {userData.password && (
                <div className="space-y-2">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${getPasswordStrengthColor()}`}
                      style={{ width: `${passwordStrength}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-gray-600">
                    <span>Password Strength: {getPasswordStrengthText()}</span>
                    <span>{passwordStrength}%</span>
                  </div>
                </div>
              )}
              
              {errors.password && (
                <p className="text-red-500 text-sm mt-1 flex items-center">
                  <FaCheck className="w-3 h-3 mr-1" />
                  {errors.password}
                </p>
              )}
            </div>

            {/* Confirm Password Field */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 flex items-center">
                <FaLock className="w-4 h-4 mr-2 text-indigo-600" />
                Confirm Password
              </label>
              <input
                name="confirmPassword"
                type="password"
                placeholder="Confirm your password"
                value={userData.confirmPassword}
                onChange={handleChange}
                className={`w-full px-4 py-3 rounded-xl border-2 ${
                  errors.confirmPassword ? 'border-red-500' : 'border-gray-200 hover:border-indigo-300'
                } focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all duration-200`}
              />
              {errors.confirmPassword && (
                <p className="text-red-500 text-sm mt-1 flex items-center">
                  <FaCheck className="w-3 h-3 mr-1" />
                  {errors.confirmPassword}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 px-6 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl shadow-lg hover:from-indigo-700 hover:to-purple-700 transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:transform-none flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Creating Account...</span>
                </>
              ) : (
                <>
                  <FaRocket className="w-5 h-5" />
                  <span>Launch Your Journey</span>
                </>
              )}
            </button>
          </form>

          {/* Login Link */}
          <div className="text-center pt-4 border-t border-gray-100">
            <p className="text-gray-600">
              Already have an account?{' '}
              <Link
                to="/login"
                className="text-indigo-600 font-semibold hover:text-indigo-700 underline transition-colors"
              >
                Sign in here
              </Link>
            </p>
          </div>
        </div>

        {/* Features Highlight */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8 text-center">
          <div className="bg-white rounded-2xl p-4 shadow-md">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-2">
              <span className="text-blue-600 font-bold">📊</span>
            </div>
            <h3 className="font-semibold text-sm">Track Progress</h3>
            <p className="text-xs text-gray-600">Monitor your learning journey</p>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-md">
            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-2">
              <span className="text-green-600 font-bold">🏆</span>
            </div>
            <h3 className="font-semibold text-sm">Earn Badges</h3>
            <p className="text-xs text-gray-600">Get rewarded for achievements</p>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-md">
            <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-2">
              <span className="text-purple-600 font-bold">🌍</span>
            </div>
            <h3 className="font-semibold text-sm">Global Community</h3>
            <p className="text-xs text-gray-600">Join learners worldwide</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;