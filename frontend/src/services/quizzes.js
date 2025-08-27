import api from './api';

export const quizAPI = {
  getQuizzes: (page = 1, limit = 10) => 
    api.get(`/quizzes?page=${page}&limit=${limit}`),
  
  getQuiz: (id) => api.get(`/quizzes/${id}`),
  
  getUserQuizzes: (page = 1, limit = 10) => 
    api.get(`/quizzes/user?page=${page}&limit=${limit}`),
  
  createQuiz: (quizData) => api.post('/quizzes', quizData),
  
  updateQuiz: (id, quizData) => api.put(`/quizzes/${id}`, quizData),
  
  deleteQuiz: (id) => api.delete(`/quizzes/${id}`),
  
  submitAttempt: (quizId, attemptData) => 
    api.post(`/attempts/${quizId}`, attemptData),
  
  getUserAttempts: (quizId, page = 1, limit = 10) => 
    api.get(`/attempts/user/${quizId}?page=${page}&limit=${limit}`),
  
  getQuizAttempts: (quizId, page = 1, limit = 10) => 
    api.get(`/attempts/quiz/${quizId}?page=${page}&limit=${limit}`),
  
  getAttempt: (attemptId) => api.get(`/attempts/${attemptId}`),
};