import { useState, useRef, useEffect } from 'react';
import { chatAPI } from '../services/api';
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
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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

  return (
    <div className="chatbot-container">
      <div className="chatbot-header">
        <h2>💬 AI 건강 상담</h2>
        <p className="disclaimer-text">
          ⚠️ 본 서비스는 정보 제공 목적이며 의학적 진단이 아닙니다
        </p>
      </div>

      <div className="messages-container">
        {messages.map((msg, index) => (
          <div key={index} className={`message ${msg.role}`}>
            <div className="message-content">
              <p>{msg.message}</p>
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
