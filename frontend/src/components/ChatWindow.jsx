/**
 * 채팅 윈도우 컴포넌트
 *
 * 1:1 대화 메시지 표시 및 전송, 감정 분석 통합
 */

import { useState, useEffect, useRef } from 'react';
import {
  subscribeToMessages,
  sendMessage,
  markMessageAsRead,
} from '../firebase/firestoreService';
import { emotionAPI } from '../services/api';
import PostChatEmotionModal from './PostChatEmotionModal';
import './ChatWindow.css';

const ChatWindow = ({ conversation, currentUserId, currentUserName }) => {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [sending, setSending] = useState(false);
  const [showEmotionModal, setShowEmotionModal] = useState(false);
  const messagesEndRef = useRef(null);

  const otherUserId = conversation.participants.find((id) => id !== currentUserId);
  const otherUserName = conversation.participantNames?.[otherUserId] || '알 수 없음';

  useEffect(() => {
    if (!conversation) return;

    // 실시간 메시지 구독
    const unsubscribe = subscribeToMessages(conversation.id, (msgs) => {
      setMessages(msgs);

      // 읽지 않은 메시지 읽음 처리
      msgs.forEach((msg) => {
        if (msg.senderId !== currentUserId && !msg.readBy?.includes(currentUserId)) {
          markMessageAsRead(conversation.id, msg.id, currentUserId);
        }
      });

      // 스크롤 하단으로
      scrollToBottom();
    });

    return () => unsubscribe();
  }, [conversation]);

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleSendMessage = async () => {
    if (!inputText.trim() || sending) return;

    const messageText = inputText.trim();
    setInputText('');
    setSending(true);

    try {
      // 감정 분석 (선택사항 - 백엔드 API 사용)
      let emotionData = null;
      try {
        const emotionResponse = await emotionAPI.analyze({ text: messageText });
        emotionData = emotionResponse.data;
      } catch (error) {
        console.warn('감정 분석 실패:', error);
      }

      // 메시지 전송
      await sendMessage(conversation.id, currentUserId, messageText, emotionData);
    } catch (error) {
      console.error('메시지 전송 실패:', error);
      alert('메시지 전송에 실패했습니다');
      setInputText(messageText); // 복원
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
  };

  const getSentimentLabel = (sentiment) => {
    const labels = {
      positive: '긍정',
      negative: '부정',
      neutral: '중립',
      very_positive: '매우 긍정',
      very_negative: '매우 부정',
    };
    return labels[sentiment] || sentiment;
  };

  return (
    <div className="chat-window">
      <div className="chat-window-header">
        <div className="chat-header-info">
          <h3>{otherUserName}</h3>
        </div>
        <button
          className="emotion-history-btn"
          onClick={() => setShowEmotionModal(true)}
          title="채팅 후 감정 표현"
        >
          💭 감정 표현
        </button>
      </div>

      <div className="chat-messages">
        {messages.length === 0 ? (
          <div className="no-messages">
            <p>메시지가 없습니다</p>
            <p>대화를 시작해보세요</p>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`message ${msg.senderId === currentUserId ? 'sent' : 'received'}`}
            >
              <div className="message-content">
                <div className="message-text">{msg.text}</div>
                {msg.emotion && (
                  <div className="message-emotion">
                    <span className="emotion-icon">{msg.emotion.emotion_icon}</span>
                    <span className="emotion-label">
                      {getSentimentLabel(msg.emotion.sentiment)}
                    </span>
                    {msg.emotion.voice_analysis && (
                      <span className="voice-badge" title="음성 톤 분석 포함">
                        🎙️
                      </span>
                    )}
                  </div>
                )}
              </div>
              <div className="message-time">{formatTimestamp(msg.timestamp)}</div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="chat-input-container">
        <textarea
          className="chat-input"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="메시지를 입력하세요..."
          disabled={sending}
          rows={1}
        />
        <button
          className="send-btn"
          onClick={handleSendMessage}
          disabled={!inputText.trim() || sending}
        >
          {sending ? '전송 중...' : '전송'}
        </button>
      </div>

      {showEmotionModal && (
        <PostChatEmotionModal
          conversationId={conversation.id}
          currentUserId={currentUserId}
          otherUserName={otherUserName}
          onClose={() => setShowEmotionModal(false)}
        />
      )}
    </div>
  );
};

export default ChatWindow;
