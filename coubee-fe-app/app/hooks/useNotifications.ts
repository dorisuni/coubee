import { useEffect, useState, useRef } from "react";
import * as Notifications from "expo-notifications";
import {
  requestNotificationPermissions,
  getExpoPushToken,
  addNotificationListener,
  addNotificationResponseListener,
  type NotificationListener,
  type NotificationResponseListener,
} from "../services/notifications";
import { sendTokenToBackend } from "../services/api";

export interface UseNotificationsOptions {
  userId?: string;
  onNotificationReceived?: NotificationListener;
  onNotificationResponse?: NotificationResponseListener;
}

export function useNotifications(options: UseNotificationsOptions = {}) {
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
  const [hasPermission, setHasPermission] = useState<boolean>(false);
  const [notification, setNotification] =
    useState<Notifications.Notification | null>(null);

  const notificationListener = useRef<{ remove(): void } | null>(null);
  const responseListener = useRef<{ remove(): void } | null>(null);

  useEffect(() => {
    // 알림 권한 요청 및 토큰 등록
    const setupNotifications = async () => {
      const permission = await requestNotificationPermissions();
      setHasPermission(permission);

      if (permission) {
        const token = await getExpoPushToken();
        if (token) {
          setExpoPushToken(token);
          // 백엔드로 토큰 전송
          await sendTokenToBackend(token);
        }
      }
    };

    setupNotifications();

    // 알림 수신 리스너 등록
    notificationListener.current = addNotificationListener((notification) => {
      setNotification(notification);
      options.onNotificationReceived?.(notification);
    });

    // 알림 응답 리스너 등록
    responseListener.current = addNotificationResponseListener((response) => {
      options.onNotificationResponse?.(response);
    });

    return () => {
      notificationListener.current?.remove();
      responseListener.current?.remove();
    };
  }, [options.userId]);

  return {
    expoPushToken,
    hasPermission,
    notification,
  };
}

// Default export for Expo Router compatibility
export default useNotifications;
