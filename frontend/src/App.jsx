import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Navigation from './components/Navigation';
import AIAssistant from './components/AIAssistant';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ChatBot from './components/ChatBot';
import HealthDashboard from './components/HealthDashboard';
import MedicationTracker from './components/MedicationTracker';
import MoodTracker from './components/MoodTracker';
import './App.css';

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="loading">로딩 중...</div>;
  }

  return user ? children : <Navigate to="/login" />;
};

function AppContent() {
  const { user } = useAuth();

  return (
    <Router>
      <div className="app">
        <Navigation />
        <main className="main-content">
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route
              path="/"
              element={
                <PrivateRoute>
                  <HomePage />
                </PrivateRoute>
              }
            />
            <Route
              path="/chat"
              element={
                <PrivateRoute>
                  <ChatBot />
                </PrivateRoute>
              }
            />
            <Route
              path="/health"
              element={
                <PrivateRoute>
                  <HealthDashboard />
                </PrivateRoute>
              }
            />
            <Route
              path="/medication"
              element={
                <PrivateRoute>
                  <MedicationTracker />
                </PrivateRoute>
              }
            />
            <Route
              path="/mood"
              element={
                <PrivateRoute>
                  <MoodTracker />
                </PrivateRoute>
              }
            />
          </Routes>
        </main>

        {/* AI 건강 비서 "헬시" - 로그인 사용자만 */}
        {user && <AIAssistant />}
      </div>
    </Router>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
