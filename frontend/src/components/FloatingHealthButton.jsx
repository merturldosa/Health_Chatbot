import { useState } from 'react';
import { Link } from 'react-router-dom';
import './FloatingHealthButton.css';

const FloatingHealthButton = () => {
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    { icon: '💬', label: '채팅', path: '/chat' },
    { icon: '🧘', label: '명상', path: '/meditation' },
    { icon: '🎵', label: '음악', path: '/music-therapy' },
    { icon: '😊', label: '기분', path: '/mood' },
    { icon: '💊', label: '복약', path: '/medications' },
  ];

  return (
    <div className="floating-health-container">
      {isOpen && (
        <div className="floating-menu">
          {menuItems.map((item, index) => (
            <Link
              key={index}
              to={item.path}
              className="floating-menu-item"
              style={{
                transitionDelay: `${index * 50}ms`,
              }}
            >
              <span className="menu-icon">{item.icon}</span>
              <span className="menu-label">{item.label}</span>
            </Link>
          ))}
        </div>
      )}
      <button
        className={`floating-health-button ${isOpen ? 'open' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        aria-label="건강 메뉴"
      >
        <span className="button-icon">{isOpen ? '✕' : '💚'}</span>
        <span className="button-label">헬시</span>
      </button>
    </div>
  );
};

export default FloatingHealthButton;
