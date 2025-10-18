import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navigation.css';

const Navigation = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="navigation">
      <div className="nav-container">
        <div className="nav-brand">
          <Link to="/">🏥 AI 건강 챗봇</Link>
        </div>
        {user && (
          <>
            <div className="nav-links">
              <Link to="/chat" className={isActive('/chat') ? 'active' : ''}>
                💬 채팅
              </Link>
              <Link to="/health" className={isActive('/health') ? 'active' : ''}>
                📊 건강 기록
              </Link>
              <Link to="/medication" className={isActive('/medication') ? 'active' : ''}>
                💊 복약 관리
              </Link>
            </div>
            <div className="nav-user">
              <span>안녕하세요, {user.username}님</span>
              <button onClick={handleLogout} className="logout-btn">
                로그아웃
              </button>
            </div>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navigation;
