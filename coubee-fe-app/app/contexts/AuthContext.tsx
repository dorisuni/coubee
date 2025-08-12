import React, { createContext, useContext, useEffect } from 'react';
import { router, useSegments } from 'expo-router';
import { useAuth, type AuthState } from '../hooks/useAuth';

interface AuthContextType extends AuthState {
  login: (token: string, refreshToken?: string, userId?: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuthStatus: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const auth = useAuth();
  const segments = useSegments();

  // 페이지별 권한 설정
  const publicRoutes = [
    'login',           // 로그인 페이지
    'register',        // 회원가입 페이지 (필요시)
    'forgot-password', // 비밀번호 찾기 (필요시)
    'index',          // 초기 페이지
    '(tabs)',         // 탭 페이지들은 공개 (내부에서 개별 체크)
  ];

  const protectedRoutes = [
    'profile',        // 프로필 페이지
    'settings',       // 설정 페이지
    'dashboard',      // 대시보드
    'modal',          // 모달 페이지
  ];

  // 현재 경로가 보호된 경로인지 확인
  const isProtectedRoute = (segments: string[]) => {
    if (!segments.length) return false;
    
    const firstSegment = segments[0];
    return protectedRoutes.includes(firstSegment);
  };

  // 현재 경로가 공개 경로인지 확인  
  const isPublicRoute = (segments: string[]) => {
    if (!segments.length) return true; // 루트는 공개
    
    const firstSegment = segments[0];
    return publicRoutes.includes(firstSegment);
  };

  // 인증 상태 변화시 자동 리다이렉트
  useEffect(() => {
    if (!auth.isLoading) {
      const currentPath = segments.join('/');
      
      if (auth.isAuthenticated) {
        // 로그인됨
        if (isPublicRoute(segments) && segments[0] === 'login') {
          // 로그인 페이지에 있으면 메인으로 이동
          router.replace('/(tabs)');
        }
        // 보호된 경로에 있으면 그대로 유지
      } else {
        // 로그아웃됨
        if (isProtectedRoute(segments)) {
          // 보호된 경로에 있으면 로그인으로 이동
          router.replace('/login');
        }
        // 공개 경로에 있으면 그대로 유지
      }
      
      console.log('Auth check:', {
        isAuthenticated: auth.isAuthenticated,
        currentPath,
        isProtected: isProtectedRoute(segments),
        isPublic: isPublicRoute(segments)
      });
    }
  }, [auth.isAuthenticated, auth.isLoading, segments]);

  return (
    <AuthContext.Provider value={auth}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
}

// Default export for Expo Router compatibility
export default AuthProvider;