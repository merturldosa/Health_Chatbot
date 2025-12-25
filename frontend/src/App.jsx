import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Navigation from './components/Navigation';
import AIAssistant from './components/AIAssistant';
import HomePage from './pages/HomePage';
import DashboardPage from './pages/DashboardPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ChatBot from './components/ChatBot';
import HealthDashboard from './components/HealthDashboard';
import MedicationTracker from './components/MedicationTracker';
import MoodTracker from './components/MoodTracker';
import SleepTracker from './components/SleepTracker';
import DiseaseManagement from './components/DiseaseManagement';
import PregnancyChildcare from './components/PregnancyChildcare';
import NutritionManagement from './components/NutritionManagement';
import MeditationPage from './pages/MeditationPage';
import MusicTherapyPage from './pages/MusicTherapyPage';
import ChatPage from './pages/ChatPage';
import HealthSyncPreviewPage from './pages/HealthSyncPreviewPage';
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
                  <DashboardPage />
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
            <Route
              path="/sleep"
              element={
                <PrivateRoute>
                  <SleepTracker />
                </PrivateRoute>
              }
            />
            <Route
              path="/disease"
              element={
                <PrivateRoute>
                  <DiseaseManagement />
                </PrivateRoute>
              }
            />
            <Route
              path="/pregnancy"
              element={
                <PrivateRoute>
                  <PregnancyChildcare />
                </PrivateRoute>
              }
            />
            <Route
              path="/nutrition"
              element={
                <PrivateRoute>
                  <NutritionManagement />
                </PrivateRoute>
              }
            />
            <Route
              path="/meditation"
              element={
                <PrivateRoute>
                  <MeditationPage />
                </PrivateRoute>
              }
            />
            <Route
              path="/music"
              element={
                <PrivateRoute>
                  <MusicTherapyPage />
                </PrivateRoute>
              }
            />
            <Route
              path="/messages"
              element={
                <PrivateRoute>
                  <ChatPage />
                </PrivateRoute>
              }
            />
            <Route
              path="/health-sync"
              element={
                <PrivateRoute>
                  <HealthSyncPreviewPage />
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
