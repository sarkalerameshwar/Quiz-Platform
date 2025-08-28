import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Layout from "./components/layout/Layout";
import PrivateRoute from "./components/auth/PrivateRoute";
import Login from "./components/auth/Login";
import Register from "./components/auth/Register";
import QuizList from "./components/quiz/QuizList";
import CreateQuiz from "./components/quiz/CreateQuiz";
import TakeQuiz from "./components/quiz/TakeQuiz";
import EditQuiz from "./components/quiz/EditQuiz";
import QuizAttemptsList from './components/quiz/QuizAttemptsList';
import Results from "./components/quiz/Results";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/"
            element={
              <PrivateRoute>
                <Layout>
                  <QuizList />
                </Layout>
              </PrivateRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <Layout>
                  <QuizList />
                </Layout>
              </PrivateRoute>
            }
          />
          <Route
            path="/create-quiz"
            element={
              <PrivateRoute>
                <Layout>
                  <CreateQuiz />
                </Layout>
              </PrivateRoute>
            }
          />
          <Route
            path="/quiz/:id"
            element={
              <PrivateRoute>
                <Layout>
                  <TakeQuiz />
                </Layout>
              </PrivateRoute>
            }
          />
          <Route
            path="/results/:attemptId"
            element={
              <PrivateRoute>
                <Layout>
                  <Results />
                </Layout>
              </PrivateRoute>
            }
          />
          <Route
            path="/edit-quiz/:id"
            element={
              <PrivateRoute>
                <Layout>
                  <EditQuiz />
                </Layout>
              </PrivateRoute>
            }
          />
          // Add import  // Add route
          <Route
            path="/quiz-attempts/:id"
            element={
              <PrivateRoute>
                <Layout>
                  <QuizAttemptsList />
                </Layout>
              </PrivateRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
