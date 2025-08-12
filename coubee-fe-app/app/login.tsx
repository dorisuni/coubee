import { useState } from "react";
import { Alert } from "react-native";
import { Text, View, Button, Input, YStack } from "tamagui";
import { router } from "expo-router";
import { loginUser } from "./services/api";
import { useAuthContext } from "./contexts/AuthContext";

function LoginScreen() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuthContext();

  const handleLogin = async () => {
    if (!username || !password) {
      Alert.alert("오류", "사용자명과 비밀번호를 입력해주세요.");
      return;
    }

    setIsLoading(true);

    try {
      // 실제 로그인 API 호출
      const response = await loginUser({ username, password });

      if (response) {
        // AuthContext의 login 함수를 통해 상태 업데이트
        await login(
          response.data.accessRefreshToken.access.token,
          response.data.accessRefreshToken.refresh.token,
          response.data.userInfo.username
        );

        Alert.alert("성공", "로그인이 완료되었습니다.");
        // AuthContext에서 자동으로 라우팅을 처리함
      } else {
        Alert.alert("오류", "사용자명 또는 비밀번호가 올바르지 않습니다.");
      }
    } catch (error) {
      console.error("Login error:", error);
      Alert.alert("오류", "로그인에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <YStack
      flex={1}
      items="center"
      justify="center"
      gap="$8"
      px="$10"
      pt="$5"
      bg="$background"
    >
      <Text>로그인</Text>

      <Input
        width="100%"
        placeholder="사용자명"
        value={username}
        onChangeText={setUsername}
        autoCapitalize="none"
      />

      <Input
        width="100%"
        placeholder="비밀번호"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <Button width="100%" onPress={handleLogin} disabled={isLoading}>
        {isLoading ? "로그인 중..." : "로그인"}
      </Button>
    </YStack>
  );
}

// AuthProvider가 자동으로 권한 관리
export default LoginScreen;
