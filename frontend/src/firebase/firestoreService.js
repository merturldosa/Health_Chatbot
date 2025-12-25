/**
 * Firestore 데이터베이스 서비스
 *
 * 채팅 및 감정 표현 기능을 위한 Firestore 작업 처리
 */

import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { db } from './config';

// ==================== 사용자 관리 ====================

/**
 * 사용자 프로필 생성 또는 업데이트
 */
export const createOrUpdateUser = async (userId, userData) => {
  try {
    const userRef = doc(db, 'users', userId);
    await setDoc(
      userRef,
      {
        ...userData,
        lastSeen: serverTimestamp(),
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
    return { success: true };
  } catch (error) {
    console.error('사용자 프로필 생성/업데이트 실패:', error);
    return { success: false, error };
  }
};

/**
 * 사용자 프로필 가져오기
 */
export const getUserProfile = async (userId) => {
  try {
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      return { success: true, data: { id: userSnap.id, ...userSnap.data() } };
    } else {
      return { success: false, error: '사용자를 찾을 수 없습니다' };
    }
  } catch (error) {
    console.error('사용자 프로필 가져오기 실패:', error);
    return { success: false, error };
  }
};

/**
 * 모든 사용자 목록 가져오기 (채팅 상대 선택용)
 */
export const getAllUsers = async (currentUserId) => {
  try {
    const usersRef = collection(db, 'users');
    const usersSnap = await getDocs(usersRef);

    const users = [];
    usersSnap.forEach((doc) => {
      if (doc.id !== currentUserId) {
        // 본인 제외
        users.push({ id: doc.id, ...doc.data() });
      }
    });

    return { success: true, data: users };
  } catch (error) {
    console.error('사용자 목록 가져오기 실패:', error);
    return { success: false, error };
  }
};

// ==================== 대화방 관리 ====================

/**
 * 1:1 대화방 생성 또는 기존 대화방 찾기
 */
export const getOrCreateConversation = async (userId1, userId2, user1Name, user2Name) => {
  try {
    // 기존 대화방 찾기
    const conversationsRef = collection(db, 'conversations');
    const q = query(
      conversationsRef,
      where('participants', 'array-contains', userId1)
    );
    const querySnapshot = await getDocs(q);

    // 두 사용자가 모두 참여하는 대화방 찾기
    let existingConversation = null;
    querySnapshot.forEach((doc) => {
      const participants = doc.data().participants;
      if (participants.includes(userId2)) {
        existingConversation = { id: doc.id, ...doc.data() };
      }
    });

    if (existingConversation) {
      return { success: true, data: existingConversation, isNew: false };
    }

    // 새 대화방 생성
    const newConversation = {
      participants: [userId1, userId2],
      participantNames: {
        [userId1]: user1Name,
        [userId2]: user2Name,
      },
      lastMessage: '',
      lastMessageTime: serverTimestamp(),
      createdAt: serverTimestamp(),
    };

    const docRef = await addDoc(conversationsRef, newConversation);
    return {
      success: true,
      data: { id: docRef.id, ...newConversation },
      isNew: true,
    };
  } catch (error) {
    console.error('대화방 생성/찾기 실패:', error);
    return { success: false, error };
  }
};

/**
 * 사용자의 모든 대화방 가져오기
 */
export const getUserConversations = async (userId) => {
  try {
    const conversationsRef = collection(db, 'conversations');
    const q = query(
      conversationsRef,
      where('participants', 'array-contains', userId),
      orderBy('lastMessageTime', 'desc')
    );

    const querySnapshot = await getDocs(q);
    const conversations = [];
    querySnapshot.forEach((doc) => {
      conversations.push({ id: doc.id, ...doc.data() });
    });

    return { success: true, data: conversations };
  } catch (error) {
    console.error('대화방 목록 가져오기 실패:', error);
    return { success: false, error };
  }
};

/**
 * 대화방 실시간 구독 (변경사항 자동 업데이트)
 */
export const subscribeToConversations = (userId, callback) => {
  const conversationsRef = collection(db, 'conversations');
  const q = query(
    conversationsRef,
    where('participants', 'array-contains', userId),
    orderBy('lastMessageTime', 'desc')
  );

  return onSnapshot(q, (querySnapshot) => {
    const conversations = [];
    querySnapshot.forEach((doc) => {
      conversations.push({ id: doc.id, ...doc.data() });
    });
    callback(conversations);
  });
};

// ==================== 메시지 관리 ====================

/**
 * 메시지 전송
 */
export const sendMessage = async (conversationId, senderId, text, emotionData = null) => {
  try {
    const messagesRef = collection(db, 'conversations', conversationId, 'messages');

    const messageData = {
      senderId,
      text,
      timestamp: serverTimestamp(),
      readBy: [senderId],
    };

    // 감정 데이터 포함 (선택)
    if (emotionData) {
      messageData.emotion = emotionData;
    }

    const docRef = await addDoc(messagesRef, messageData);

    // 대화방 lastMessage 업데이트
    const conversationRef = doc(db, 'conversations', conversationId);
    await updateDoc(conversationRef, {
      lastMessage: text.substring(0, 50),
      lastMessageTime: serverTimestamp(),
    });

    return { success: true, messageId: docRef.id };
  } catch (error) {
    console.error('메시지 전송 실패:', error);
    return { success: false, error };
  }
};

/**
 * 대화방의 메시지 가져오기
 */
export const getMessages = async (conversationId, limitCount = 50) => {
  try {
    const messagesRef = collection(db, 'conversations', conversationId, 'messages');
    const q = query(messagesRef, orderBy('timestamp', 'desc'), limit(limitCount));

    const querySnapshot = await getDocs(q);
    const messages = [];
    querySnapshot.forEach((doc) => {
      messages.push({ id: doc.id, ...doc.data() });
    });

    // 시간 순서대로 정렬 (오래된 것부터)
    messages.reverse();

    return { success: true, data: messages };
  } catch (error) {
    console.error('메시지 가져오기 실패:', error);
    return { success: false, error };
  }
};

/**
 * 메시지 실시간 구독
 */
export const subscribeToMessages = (conversationId, callback) => {
  const messagesRef = collection(db, 'conversations', conversationId, 'messages');
  const q = query(messagesRef, orderBy('timestamp', 'asc'));

  return onSnapshot(q, (querySnapshot) => {
    const messages = [];
    querySnapshot.forEach((doc) => {
      messages.push({ id: doc.id, ...doc.data() });
    });
    callback(messages);
  });
};

/**
 * 메시지 읽음 표시
 */
export const markMessageAsRead = async (conversationId, messageId, userId) => {
  try {
    const messageRef = doc(db, 'conversations', conversationId, 'messages', messageId);
    const messageSnap = await getDoc(messageRef);

    if (messageSnap.exists()) {
      const readBy = messageSnap.data().readBy || [];
      if (!readBy.includes(userId)) {
        await updateDoc(messageRef, {
          readBy: [...readBy, userId],
        });
      }
    }

    return { success: true };
  } catch (error) {
    console.error('메시지 읽음 표시 실패:', error);
    return { success: false, error };
  }
};

// ==================== 채팅 후 감정 표현 ====================

/**
 * 채팅 후 감정 표현 저장
 */
export const savePostChatEmotion = async (emotionData) => {
  try {
    const emotionsRef = collection(db, 'post_chat_emotions');

    const data = {
      conversationId: emotionData.conversationId,
      userId: emotionData.userId,
      timestamp: serverTimestamp(),
      myEmotion: {
        primary: emotionData.myEmotion.primary,
        intensity: emotionData.myEmotion.intensity,
        notes: emotionData.myEmotion.notes || '',
        emotion_icon: emotionData.myEmotion.emotion_icon || '😐',
      },
      perceivedOtherEmotion: {
        primary: emotionData.perceivedOtherEmotion.primary,
        intensity: emotionData.perceivedOtherEmotion.intensity,
        confidence: emotionData.perceivedOtherEmotion.confidence || 50,
        emotion_icon: emotionData.perceivedOtherEmotion.emotion_icon || '😐',
      },
    };

    const docRef = await addDoc(emotionsRef, data);
    return { success: true, emotionId: docRef.id };
  } catch (error) {
    console.error('감정 표현 저장 실패:', error);
    return { success: false, error };
  }
};

/**
 * 특정 대화방의 감정 표현 기록 가져오기
 */
export const getPostChatEmotions = async (conversationId) => {
  try {
    const emotionsRef = collection(db, 'post_chat_emotions');
    const q = query(
      emotionsRef,
      where('conversationId', '==', conversationId),
      orderBy('timestamp', 'desc')
    );

    const querySnapshot = await getDocs(q);
    const emotions = [];
    querySnapshot.forEach((doc) => {
      emotions.push({ id: doc.id, ...doc.data() });
    });

    return { success: true, data: emotions };
  } catch (error) {
    console.error('감정 표현 기록 가져오기 실패:', error);
    return { success: false, error };
  }
};

/**
 * 감정 일치도 분석 (두 사람의 감정 표현 비교)
 */
export const analyzeEmotionAlignment = async (conversationId, userId1, userId2) => {
  try {
    const emotionsRef = collection(db, 'post_chat_emotions');
    const q = query(
      emotionsRef,
      where('conversationId', '==', conversationId),
      orderBy('timestamp', 'desc'),
      limit(10) // 최근 10개 분석
    );

    const querySnapshot = await getDocs(q);
    const emotions = [];
    querySnapshot.forEach((doc) => {
      emotions.push({ id: doc.id, ...doc.data() });
    });

    // 각 사용자의 감정 데이터
    const user1Emotions = emotions.filter((e) => e.userId === userId1);
    const user2Emotions = emotions.filter((e) => e.userId === userId2);

    // 감정 일치도 계산
    let alignmentScore = 0;
    let comparisonCount = 0;

    user1Emotions.forEach((u1Emotion) => {
      // 같은 시간대의 user2 감정 찾기 (timestamp 비교)
      const matchingU2Emotion = user2Emotions.find((u2Emotion) => {
        const timeDiff = Math.abs(
          u1Emotion.timestamp?.toMillis() - u2Emotion.timestamp?.toMillis()
        );
        return timeDiff < 60000; // 1분 이내
      });

      if (matchingU2Emotion) {
        // user1이 느낀 자신의 감정 vs user2가 인지한 user1의 감정
        const user1Self = u1Emotion.myEmotion.primary;
        const user2Perceived = matchingU2Emotion.perceivedOtherEmotion.primary;

        if (user1Self === user2Perceived) {
          alignmentScore += 1;
        }

        comparisonCount += 1;
      }
    });

    const alignmentPercentage = comparisonCount > 0
      ? Math.round((alignmentScore / comparisonCount) * 100)
      : 0;

    return {
      success: true,
      data: {
        alignmentPercentage,
        totalComparisons: comparisonCount,
        matches: alignmentScore,
        user1EmotionCount: user1Emotions.length,
        user2EmotionCount: user2Emotions.length,
      },
    };
  } catch (error) {
    console.error('감정 일치도 분석 실패:', error);
    return { success: false, error };
  }
};

/**
 * 사용자의 대화 상대별 감정 패턴 분석
 */
export const analyzeEmotionPatternsByContact = async (userId) => {
  try {
    const emotionsRef = collection(db, 'post_chat_emotions');
    const q = query(
      emotionsRef,
      where('userId', '==', userId),
      orderBy('timestamp', 'desc'),
      limit(100)
    );

    const querySnapshot = await getDocs(q);
    const emotions = [];
    querySnapshot.forEach((doc) => {
      emotions.push({ id: doc.id, ...doc.data() });
    });

    // 대화방별로 그룹화
    const emotionsByConversation = emotions.reduce((acc, emotion) => {
      const convId = emotion.conversationId;
      if (!acc[convId]) {
        acc[convId] = [];
      }
      acc[convId].push(emotion);
      return acc;
    }, {});

    // 각 대화방의 감정 통계
    const patterns = Object.keys(emotionsByConversation).map((convId) => {
      const convEmotions = emotionsByConversation[convId];

      // 감정 분포
      const emotionCounts = convEmotions.reduce((acc, e) => {
        const primary = e.myEmotion.primary;
        acc[primary] = (acc[primary] || 0) + 1;
        return acc;
      }, {});

      // 평균 강도
      const avgIntensity =
        convEmotions.reduce((sum, e) => sum + e.myEmotion.intensity, 0) /
        convEmotions.length;

      // 가장 많은 감정
      const dominantEmotion = Object.keys(emotionCounts).reduce((a, b) =>
        emotionCounts[a] > emotionCounts[b] ? a : b
      );

      return {
        conversationId: convId,
        totalRecords: convEmotions.length,
        dominantEmotion,
        avgIntensity: Math.round(avgIntensity * 10) / 10,
        emotionDistribution: emotionCounts,
      };
    });

    return { success: true, data: patterns };
  } catch (error) {
    console.error('감정 패턴 분석 실패:', error);
    return { success: false, error };
  }
};

// ==================== 유틸리티 ====================

/**
 * Firestore Timestamp를 Date로 변환
 */
export const timestampToDate = (timestamp) => {
  if (!timestamp) return null;
  if (timestamp instanceof Timestamp) {
    return timestamp.toDate();
  }
  return timestamp;
};

/**
 * 감정 아이콘 매핑
 */
export const EMOTION_ICONS = {
  joy: '😊',
  happiness: '😊',
  sadness: '😢',
  anger: '😠',
  fear: '😨',
  anxiety: '😰',
  neutral: '😐',
  surprise: '😲',
  disgust: '🤢',
  love: '❤️',
  excitement: '🤩',
  calm: '😌',
  stress: '😖',
  frustration: '😤',
  confusion: '😕',
};

/**
 * 감정 이름으로 아이콘 가져오기
 */
export const getEmotionIcon = (emotionName) => {
  const normalized = emotionName?.toLowerCase();
  return EMOTION_ICONS[normalized] || '😐';
};
