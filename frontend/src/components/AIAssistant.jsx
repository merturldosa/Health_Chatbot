import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import aiAssistant from '../services/aiAssistant';
import './AIAssistant.css';

/**
 * AI 건강 비서 "헬시" 컴포넌트
 * - 플로팅 버튼으로 항상 접근 가능
 * - 시간대별 맞춤 인사 및 팁
 * - 음성 안내 (TTS)
 * - 프로액티브 알림
 */
const AIAssistant = () => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isTTSEnabled, setIsTTSEnabled] = useState(false);
  const [currentTip, setCurrentTip] = useState(null);
  const [greeting, setGreeting] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [showWelcome, setShowWelcome] = useState(false);

  useEffect(() => {
    // 사용자 설정
    if (user) {
      aiAssistant.setUser(user);
    }

    // TTS 초기 상태
    const ttsEnabled = aiAssistant.getTTSEnabled();
    setIsTTSEnabled(ttsEnabled);
    aiAssistant.setTTS(ttsEnabled);

    // 첫 방문 확인
    const isFirstVisit = !localStorage.getItem('visited_before');
    if (isFirstVisit) {
      setShowWelcome(true);
      localStorage.setItem('visited_before', 'true');
    }

    // 인사말 및 팁 설정
    const greetingData = aiAssistant.getGreeting();
    setGreeting(greetingData);
    setCurrentTip(aiAssistant.getHealthTip());

    // 프로액티브 알림 생성
    const proactiveNotifications = aiAssistant.generateProactiveNotifications();
    setNotifications(proactiveNotifications);

    // 매 시간마다 알림 업데이트
    const interval = setInterval(() => {
      const newNotifications = aiAssistant.generateProactiveNotifications();
      setNotifications(newNotifications);
      setCurrentTip(aiAssistant.getHealthTip());
    }, 3600000); // 1시간

    return () => clearInterval(interval);
  }, [user]);

  const toggleAssistant = () => {
    setIsOpen(!isOpen);
    if (!isOpen && greeting && isTTSEnabled) {
      aiAssistant.speak(greeting.greeting);
    }
  };

  const toggleTTS = () => {
    const newState = !isTTSEnabled;
    setIsTTSEnabled(newState);
    aiAssistant.setTTS(newState);

    if (newState) {
      aiAssistant.speak('음성 안내가 켜졌습니다!');
    }
  };

  const speakTip = (text) => {
    if (isTTSEnabled) {
      aiAssistant.speak(text);
    }
  };

  const refreshTip = () => {
    const newTip = aiAssistant.getHealthTip();
    setCurrentTip(newTip);
    if (isTTSEnabled) {
      aiAssistant.speak(newTip.message);
    }
  };

  const dismissWelcome = () => {
    setShowWelcome(false);
  };

  const dismissNotification = (notificationId) => {
    setNotifications(notifications.filter(n => n.id !== notificationId));
  };

  return (
    <>
      {/* 환영 메시지 모달 */}
      {showWelcome && (
        <div className="ai-welcome-overlay" onClick={dismissWelcome}>
          <div className="ai-welcome-modal" onClick={(e) => e.stopPropagation()}>
            <div className="ai-welcome-header">
              <span className="ai-welcome-avatar">🤖</span>
              <h2>안녕하세요! 저는 헬시입니다</h2>
            </div>
            <div className="ai-welcome-content">
              <p>저는 당신의 건강 비서예요!</p>
              <p>언제든지 건강 상담이 필요하면 저를 찾아주세요.</p>

              <div className="ai-welcome-features">
                <div className="ai-welcome-feature">
                  <span className="feature-icon">💬</span>
                  <span>증상 체크</span>
                </div>
                <div className="ai-welcome-feature">
                  <span className="feature-icon">📊</span>
                  <span>건강 기록</span>
                </div>
                <div className="ai-welcome-feature">
                  <span className="feature-icon">💊</span>
                  <span>복약 관리</span>
                </div>
                <div className="ai-welcome-feature">
                  <span className="feature-icon">🧠</span>
                  <span>정신 건강</span>
                </div>
              </div>

              <p className="ai-welcome-footer">함께 건강한 삶을 만들어가요! 💪</p>
            </div>
            <button className="ai-welcome-close" onClick={dismissWelcome}>
              시작하기
            </button>
          </div>
        </div>
      )}

      {/* 프로액티브 알림 (토스트) */}
      {notifications.length > 0 && (
        <div className="ai-notifications">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className={`ai-notification ai-notification-${notification.priority}`}
            >
              <span className="notification-icon">{notification.icon}</span>
              <div className="notification-content">
                <strong>{notification.title}</strong>
                <p>{notification.message}</p>
              </div>
              <button
                className="notification-close"
                onClick={() => dismissNotification(notification.id)}
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

      {/* 플로팅 버튼 */}
      <button
        className={`ai-floating-btn ${isOpen ? 'active' : ''}`}
        onClick={toggleAssistant}
        aria-label="AI 건강 비서"
      >
        <span className="ai-avatar">🤖</span>
        {!isOpen && <span className="ai-pulse"></span>}
      </button>

      {/* AI 비서 패널 */}
      {isOpen && (
        <div className="ai-assistant-panel">
          <div className="ai-panel-header">
            <div className="ai-header-info">
              <span className="ai-header-avatar">🤖</span>
              <div>
                <h3>헬시</h3>
                <p className="ai-status">온라인</p>
              </div>
            </div>
            <div className="ai-header-actions">
              <button
                className={`ai-tts-btn ${isTTSEnabled ? 'active' : ''}`}
                onClick={toggleTTS}
                title={isTTSEnabled ? '음성 끄기' : '음성 켜기'}
              >
                {isTTSEnabled ? '🔊' : '🔇'}
              </button>
              <button className="ai-close-btn" onClick={toggleAssistant}>
                ✕
              </button>
            </div>
          </div>

          <div className="ai-panel-body">
            {/* 인사말 */}
            {greeting && (
              <div className="ai-greeting-card">
                <div className="greeting-header">
                  <span className="greeting-emoji">{greeting.emoji}</span>
                  <h4>{greeting.greeting}</h4>
                </div>
                <p className="greeting-tip">{greeting.tip}</p>
                <button
                  className="greeting-speak-btn"
                  onClick={() => speakTip(greeting.tip)}
                  disabled={!isTTSEnabled}
                >
                  🔊 듣기
                </button>
              </div>
            )}

            {/* 오늘의 건강 팁 */}
            {currentTip && (
              <div className="ai-tip-card">
                <div className="tip-header">
                  <span className="tip-icon">{currentTip.icon}</span>
                  <h4>{currentTip.title}</h4>
                </div>
                <p className="tip-message">{currentTip.message}</p>
                <div className="tip-actions">
                  <button
                    className="tip-speak-btn"
                    onClick={() => speakTip(currentTip.message)}
                    disabled={!isTTSEnabled}
                  >
                    🔊 듣기
                  </button>
                  <button className="tip-refresh-btn" onClick={refreshTip}>
                    🔄 다른 팁
                  </button>
                </div>
              </div>
            )}

            {/* 빠른 액션 */}
            <div className="ai-quick-actions">
              <h4>빠른 기능</h4>
              <div className="quick-actions-grid">
                <a href="/chat" className="quick-action-btn">
                  <span className="quick-action-icon">💬</span>
                  <span>증상 체크</span>
                </a>
                <a href="/health" className="quick-action-btn">
                  <span className="quick-action-icon">📊</span>
                  <span>건강 기록</span>
                </a>
                <a href="/medication" className="quick-action-btn">
                  <span className="quick-action-icon">💊</span>
                  <span>복약 관리</span>
                </a>
                <button className="quick-action-btn" onClick={refreshTip}>
                  <span className="quick-action-icon">💡</span>
                  <span>건강 팁</span>
                </button>
              </div>
            </div>
          </div>

          <div className="ai-panel-footer">
            <p className="ai-disclaimer">
              ⚠️ AI 조언은 참고용이며 의료 진단을 대체하지 않습니다
            </p>
          </div>
        </div>
      )}
    </>
  );
};

export default AIAssistant;
