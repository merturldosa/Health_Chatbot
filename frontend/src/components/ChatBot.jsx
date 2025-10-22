import { useState, useRef, useEffect } from 'react';
import { chatAPI } from '../services/api';
import { format } from 'date-fns';
import ReactMarkdown from 'react-markdown';
import './ChatBot.css';

const ChatBot = () => {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      message: '안녕하세요! 건강 상담 챗봇입니다. 어떤 증상이 있으신가요?',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [showSessions, setShowSessions] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      const response = await chatAPI.getChatSessions();
      setSessions(response.data);
    } catch (error) {
      console.error('세션 목록 조회 실패:', error);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage = input;
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', message: userMessage }]);
    setLoading(true);

    try {
      const response = await chatAPI.symptomCheck({
        message: userMessage,
        chat_type: 'symptom_check',
        session_id: sessionId,
      });

      setSessionId(response.data.session_id);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          message: response.data.message,
          urgency_level: response.data.urgency_level,
          suggested_action: response.data.suggested_action,
        },
      ]);

      // 세션 목록 새로고침
      fetchSessions();
    } catch (error) {
      console.error('채팅 오류:', error);
      console.error('에러 응답:', error.response);
      console.error('에러 데이터:', error.response?.data);
      console.error('에러 상세:', error.response?.data?.detail);
      const errorMessage = error.response?.data?.detail || error.message || '죄송합니다. 오류가 발생했습니다. 다시 시도해주세요.';
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          message: `오류: ${errorMessage}`,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const loadSession = async (sid) => {
    try {
      const response = await chatAPI.getChatHistory(sid);
      setMessages(response.data);
      setSessionId(sid);
      setShowSessions(false);
    } catch (error) {
      console.error('채팅 기록 불러오기 실패:', error);
      alert('채팅 기록을 불러오는데 실패했습니다.');
    }
  };

  const startNewChat = () => {
    setMessages([
      {
        role: 'assistant',
        message: '안녕하세요! 건강 상담 챗봇입니다. 어떤 증상이 있으신가요?',
      },
    ]);
    setSessionId(null);
    setShowSessions(false);
  };

  return (
    <div className="chatbot-container">
      <div className="chatbot-header">
        <h2>💬 AI 건강 상담</h2>
        <div className="header-actions">
          <button
            className="history-btn"
            onClick={() => setShowSessions(!showSessions)}
          >
            📜 대화 기록
          </button>
          <button className="new-chat-btn" onClick={startNewChat}>
            ➕ 새 대화
          </button>
        </div>
        <p className="disclaimer-text">
          ⚠️ 본 서비스는 정보 제공 목적이며 의학적 진단이 아닙니다
        </p>
      </div>

      {showSessions && (
        <div className="sessions-panel">
          <h3>이전 대화 목록</h3>
          {sessions.length === 0 ? (
            <p className="no-sessions">저장된 대화가 없습니다.</p>
          ) : (
            <div className="sessions-list">
              {sessions.map((session) => (
                <div
                  key={session.session_id}
                  className={`session-item ${sessionId === session.session_id ? 'active' : ''}`}
                  onClick={() => loadSession(session.session_id)}
                >
                  <div className="session-preview">{session.preview}</div>
                  <div className="session-date">
                    {format(new Date(session.last_message_at), 'yyyy-MM-dd HH:mm')}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="messages-container">
        {messages.map((msg, index) => (
          <div key={index} className={`message ${msg.role}`}>
            <div className="message-content">
              <ReactMarkdown>{msg.message}</ReactMarkdown>
              {msg.urgency_level && (
                <div className={`urgency-badge ${msg.urgency_level}`}>
                  긴급도: {msg.urgency_level}
                </div>
              )}
              {msg.suggested_action && (
                <div className="suggested-action">
                  <strong>권장 조치:</strong> {msg.suggested_action}
                </div>
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div className="message assistant">
            <div className="message-content typing">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="input-container">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="증상을 설명해주세요..."
          rows="3"
          disabled={loading}
        />
        <button onClick={handleSend} disabled={loading || !input.trim()}>
          전송
        </button>
      </div>
    </div>
  );
};

export default ChatBot;
