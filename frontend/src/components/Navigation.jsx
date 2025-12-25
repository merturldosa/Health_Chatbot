import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import './Navigation.css';

const Navigation = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="navigation-modern">
      <div className="nav-container">
        <div className="nav-brand">
          <Link to="/" className="brand-logo">
            <span className="logo-icon">✨</span>
            <span className="logo-text">VITALITY <span className="text-primary-color">TECH</span></span>
          </Link>
        </div>
        
        {user && (
          <>
            <div className="nav-links">
              {[
                { path: '/chat', label: 'AI 상담', icon: '💬' },
                { path: '/health', label: '대시보드', icon: '📊' },
                { path: '/medication', label: '복약', icon: '💊' },
                { path: '/mood', label: '정신건강', icon: '🧠' },
                { path: '/health-sync', label: '연동', icon: '🔄' },
              ].map((link) => (
                <Link 
                  key={link.path}
                  to={link.path} 
                  className={`nav-item ${isActive(link.path) ? 'active' : ''}`}
                >
                  <span className="icon">{link.icon}</span>
                  <span className="label">{link.label}</span>
                </Link>
              ))}
            </div>
            
            <div className="nav-actions">
              <button onClick={toggleTheme} className="icon-btn">
                {theme === 'dark' ? '☀️' : '🌙'}
              </button>
              <div className="user-profile">
                <div className="avatar">{user.username[0].toUpperCase()}</div>
                <div className="user-info">
                  <span className="user-name">{user.username}님</span>
                  <button onClick={handleLogout} className="logout-link">로그아웃</button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navigation;