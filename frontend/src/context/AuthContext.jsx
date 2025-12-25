import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';
import { auth } from '../firebase/config';
import { onAuthStateChanged } from 'firebase/auth';
import { createOrUpdateUser } from '../firebase/firestoreService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [firebaseUser, setFirebaseUser] = useState(null);

  useEffect(() => {
    checkAuth();

    // Firebase 인증 상태 감지 (Firebase가 초기화된 경우에만)
    if (auth) {
      const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
        setFirebaseUser(fbUser);
  
        if (fbUser) {
          // Firebase 사용자가 로그인됨 → Firestore 프로필 동기화
          try {
            await createOrUpdateUser(fbUser.uid, {
              email: fbUser.email,
              displayName: fbUser.displayName || user?.name || fbUser.email?.split('@')[0],
              photoURL: fbUser.photoURL || null,
              createdAt: fbUser.metadata.creationTime,
            });
          } catch (error) {
            console.error('Firebase 프로필 동기화 실패:', error);
          }
        }
      });
  
      return () => unsubscribe();
    }
  }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const response = await authAPI.getCurrentUser();
        setUser(response.data);
      } catch (error) {
        localStorage.removeItem('token');
      }
    }
    setLoading(false);
  };

  const login = async (email, password) => {
    const response = await authAPI.login({ username: email, password });
    localStorage.setItem('token', response.data.access_token);
    setUser(response.data.user);

    // Firebase에도 사용자 프로필 생성/업데이트
    // (Firebase Auth 없이 Firestore만 사용)
    try {
      const userId = `backend_${response.data.user.id}`;
      await createOrUpdateUser(userId, {
        email: response.data.user.email,
        displayName: response.data.user.name || response.data.user.email?.split('@')[0],
        photoURL: null,
        createdAt: new Date().toISOString(),
      });
    } catch (error) {
      console.warn('Firebase 프로필 생성 실패 (채팅 기능 제한될 수 있음):', error);
    }

    return response.data;
  };

  const register = async (userData) => {
    const response = await authAPI.register(userData);
    return response.data;
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);

    // Firebase 로그아웃 (필요시)
    if (firebaseUser && auth) {
      auth.signOut();
    }
  };

  return (
    <AuthContext.Provider value={{ user, firebaseUser, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
