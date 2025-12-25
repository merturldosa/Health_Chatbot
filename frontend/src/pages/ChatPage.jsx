/**
 * 채팅 페이지
 *
 * 1:1 채팅 기능과 채팅 후 감정 표현 기능 제공
 */

import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  getUserConversations,
  getAllUsers,
  getOrCreateConversation,
  subscribeToConversations,
} from '../firebase/firestoreService';
import ChatWindow from '../components/ChatWindow';
import './ChatPage.css';

const ChatPage = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showUserSelect, setShowUserSelect] = useState(false);

  const currentUserId = `backend_${user?.id}`;

  useEffect(() => {
    if (!user) return;

    loadData();

    // 실시간 대화방 구독
    const unsubscribe = subscribeToConversations(currentUserId, (convs) => {
      setConversations(convs);
    });

    return () => unsubscribe();
  }, [user]);

  const loadData = async () => {
    setLoading(true);

    // 대화방 목록 로드
    const convsResult = await getUserConversations(currentUserId);
    if (convsResult.success) {
      setConversations(convsResult.data);
    }

    // 사용자 목록 로드 (새 대화 시작용)
    const usersResult = await getAllUsers(currentUserId);
    if (usersResult.success) {
      setUsers(usersResult.data);
    }

    setLoading(false);
  };

  const handleStartNewChat = async (otherUser) => {
    const result = await getOrCreateConversation(
      currentUserId,
      otherUser.id,
      user.name || user.email,
      otherUser.displayName
    );

    if (result.success) {
      setSelectedConversation(result.data);
      setShowUserSelect(false);
    }
  };

  const handleSelectConversation = (conversation) => {
    setSelectedConversation(conversation);
  };

  const getOtherUserName = (conversation) => {
    const otherUserId = conversation.participants.find((id) => id !== currentUserId);
    return conversation.participantNames?.[otherUserId] || '알 수 없음';
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const now = new Date();
    const diff = now - date;

    if (diff < 60000) return '방금 전';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}분 전`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}시간 전`;
    return date.toLocaleDateString('ko-KR');
  };

  if (!user) {
    return (
      <div className="chat-page">
        <div className="chat-error">
          <p>로그인이 필요합니다</p>
        </div>
      </div>
    );
  }

  return (
    <div className="chat-page">
      <div className="chat-sidebar">
        <div className="chat-sidebar-header">
          <h2>채팅</h2>
          <button
            className="new-chat-btn"
            onClick={() => setShowUserSelect(!showUserSelect)}
            title="새 대화 시작"
          >
            ✏️
          </button>
        </div>

        {showUserSelect && (
          <div className="user-select">
            <h3>대화 상대 선택</h3>
            {users.length === 0 ? (
              <p className="no-users">다른 사용자가 없습니다</p>
            ) : (
              <ul className="user-list">
                {users.map((u) => (
                  <li key={u.id} onClick={() => handleStartNewChat(u)}>
                    <div className="user-avatar">{u.displayName?.[0] || '?'}</div>
                    <div className="user-info">
                      <div className="user-name">{u.displayName}</div>
                      <div className="user-email">{u.email}</div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        <div className="conversation-list">
          {loading ? (
            <div className="loading">로딩 중...</div>
          ) : conversations.length === 0 ? (
            <div className="no-conversations">
              <p>대화가 없습니다</p>
              <p>새 대화를 시작하세요</p>
            </div>
          ) : (
            conversations.map((conv) => (
              <div
                key={conv.id}
                className={`conversation-item ${
                  selectedConversation?.id === conv.id ? 'active' : ''
                }`}
                onClick={() => handleSelectConversation(conv)}
              >
                <div className="conversation-avatar">
                  {getOtherUserName(conv)[0] || '?'}
                </div>
                <div className="conversation-info">
                  <div className="conversation-header">
                    <div className="conversation-name">{getOtherUserName(conv)}</div>
                    <div className="conversation-time">
                      {formatTimestamp(conv.lastMessageTime)}
                    </div>
                  </div>
                  <div className="conversation-last-message">
                    {conv.lastMessage || '메시지 없음'}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="chat-main">
        {selectedConversation ? (
          <ChatWindow
            conversation={selectedConversation}
            currentUserId={currentUserId}
            currentUserName={user.name || user.email}
          />
        ) : (
          <div className="chat-placeholder">
            <p>대화를 선택하거나 새 대화를 시작하세요</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatPage;
