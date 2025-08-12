import * as Notifications from "expo-notifications";
import * as Linking from "expo-linking";
import { router } from "expo-router";

export interface NotificationData {
  route?: string;
  params?: Record<string, any>;
  url?: string;
}

// 알림 클릭 시 네비게이션 처리
export function handleNotificationNavigation(
  response: Notifications.NotificationResponse
): void {
  try {
    const data = response.notification.request.content.data as NotificationData;

    if (data.url) {
      handleDeepLink(data.url);
    } else if (data.route) {
      navigateToRoute(data.route, data.params);
    } else {
      router.push("/(tabs)");
    }
  } catch (error) {
    console.error("Error handling notification navigation:", error);
    router.push("/(tabs)");
  }
}

// 딥링크 처리
function handleDeepLink(url: string): void {
  try {
    // coubee://route/path?param=value 형태의 URL 파싱
    const { hostname, path, queryParams } = Linking.parse(url);

    if (hostname && path) {
      const route = `${hostname}${path}`;
      navigateToRoute(route, queryParams || undefined);
    } else {
      router.push("/(tabs)");
    }
  } catch (error) {
    console.error("Error parsing deep link:", error);
    router.push("/(tabs)");
  }
}

// 라우트로 이동
function navigateToRoute(route: string, params?: Record<string, any>): void {
  try {
    if (params && Object.keys(params).length > 0) {
      // 파라미터가 있는 경우 쿼리 스트링으로 변환
      const queryString = new URLSearchParams(
        Object.entries(params).reduce((acc, [key, value]) => {
          acc[key] = String(value);
          return acc;
        }, {} as Record<string, string>)
      ).toString();

      router.push(`${route}?${queryString}` as any);
    } else {
      router.push(route as any);
    }
  } catch (error) {
    console.error("Error navigating to route:", route, error);
    router.push("/(tabs)");
  }
}

// 일반적인 알림 라우트 상수
export const NotificationRoutes = {
  HOME: "/(tabs)",
  TAB_ONE: "/(tabs)",
  TAB_TWO: "/(tabs)/two",
  LOGIN: "/login",
  PROFILE: "/profile",
  SETTINGS: "/settings",
} as const;

// Default export for Expo Router compatibility
export default { handleNotificationNavigation, NotificationRoutes };
