import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

// 알림 동작 설정
Notifications.setNotificationHandler({
  handleNotification:
    async (): Promise<Notifications.NotificationBehavior> => ({
      shouldShowAlert: true,
      shouldPlaySound: false,
      shouldSetBadge: true,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
});

// 푸시 알림 권한 요청
export async function requestNotificationPermissions(): Promise<boolean> {
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#FF231F7C",
    });
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  return finalStatus === "granted";
}

// Expo push token 생성
export async function getExpoPushToken(): Promise<string | null> {
  try {
    // SDK 53 이후 Android에서 Expo Go에서는 푸시 알림이 지원되지 않음
    // 프로덕션에서는 development build 필요
    if (Platform.OS === "android" && __DEV__) {
      console.warn(
        "Push notifications are not available in Expo Go on Android from SDK 53. Use development build for push notifications."
      );
    }

    // 권한이 있는지 먼저 확인
    const { status } = await Notifications.getPermissionsAsync();
    if (status !== "granted") {
      console.warn("Push notifications permission not granted");
      return null;
    }

    const token = await Notifications.getExpoPushTokenAsync({
      projectId: "ccb50e7c-c280-47e9-86bb-959ea482b0c9",
    });
    return token.data;
  } catch (error) {
    console.error("Error getting push token:", error);
    return null;
  }
}

// 알림 리스너 타입
export type NotificationListener = (
  notification: Notifications.Notification
) => void;
export type NotificationResponseListener = (
  response: Notifications.NotificationResponse
) => void;

// 알림 수신 리스너 등록
export function addNotificationListener(listener: NotificationListener) {
  return Notifications.addNotificationReceivedListener(listener);
}

// 알림 응답 리스너 등록 (사용자가 알림을 탭했을 때)
export function addNotificationResponseListener(
  listener: NotificationResponseListener
) {
  return Notifications.addNotificationResponseReceivedListener(listener);
}

// Default export for Expo Router compatibility
export default {
  requestNotificationPermissions,
  getExpoPushToken,
  addNotificationListener,
  addNotificationResponseListener,
};
