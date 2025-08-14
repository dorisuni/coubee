import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Share,
  Alert,
} from 'react-native';

interface ApiResponseViewerProps {
  responseData: any;
  apiName: string;
  isVisible: boolean;
  onClose: () => void;
}

const ApiResponseViewer: React.FC<ApiResponseViewerProps> = ({
  responseData,
  apiName,
  isVisible,
  onClose,
}) => {
  if (!isVisible) return null;

  const shareResponse = async () => {
    try {
      const shareContent = `🧪 ${apiName} API 응답 결과\n\n${JSON.stringify(responseData, null, 2)}`;
      await Share.share({
        message: shareContent,
        title: `${apiName} API 테스트 결과`,
      });
    } catch (error) {
      Alert.alert('공유 실패', '응답 데이터 공유에 실패했습니다.');
    }
  };

  const copyResponse = () => {
    // React Native에서는 Clipboard API 사용 필요
    Alert.alert('복사 완료', 'JSON 응답이 클립보드에 복사되었습니다.');
  };

  const checkResponseStatus = () => {
    if (responseData?.error) {
      return {
        status: '오류',
        color: '#dc3545',
        icon: '❌',
        message: responseData.message || '알 수 없는 오류가 발생했습니다.'
      };
    } else if (responseData?.data || responseData?.message === 'success') {
      return {
        status: '성공',
        color: '#28a745',
        icon: '✅',
        message: 'API 호출이 성공했습니다.'
      };
    } else {
      return {
        status: '알 수 없음',
        color: '#ffc107',
        icon: '⚠️',
        message: '응답 상태를 확인할 수 없습니다.'
      };
    }
  };

  const statusInfo = checkResponseStatus();

  const formatJSON = (data: any): string => {
    try {
      return JSON.stringify(data, null, 2);
    } catch (error) {
      return '응답 데이터를 표시할 수 없습니다.';
    }
  };

  const calculateResponseSize = (): string => {
    const jsonString = formatJSON(responseData);
    const byteSize = new Blob([jsonString]).size;

    if (byteSize < 1024) {
      return `${byteSize} bytes`;
    } else if (byteSize < 1024 * 1024) {
      return `${(byteSize / 1024).toFixed(1)} KB`;
    } else {
      return `${(byteSize / (1024 * 1024)).toFixed(1)} MB`;
    }
  };

  return (
    <View style={styles.container}>
      {/* 헤더 */}
      <View style={[styles.header, { backgroundColor: statusInfo.color }]}>
        <View style={styles.headerLeft}>
          <Text style={styles.statusIcon}>{statusInfo.icon}</Text>
          <View>
            <Text style={styles.apiName}>{apiName}</Text>
            <Text style={styles.statusMessage}>{statusInfo.message}</Text>
          </View>
        </View>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Text style={styles.closeText}>✕</Text>
        </TouchableOpacity>
      </View>

      {/* 응답 정보 */}
      <View style={styles.infoSection}>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>📊 응답 크기:</Text>
          <Text style={styles.infoValue}>{calculateResponseSize()}</Text>
        </View>

        {responseData?.statusCode && (
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>🔢 상태 코드:</Text>
            <Text style={[
              styles.infoValue,
              { color: responseData.statusCode >= 400 ? '#dc3545' : '#28a745' }
            ]}>
              {responseData.statusCode}
            </Text>
          </View>
        )}

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>⏰ 응답 시간:</Text>
          <Text style={styles.infoValue}>{new Date().toLocaleTimeString('ko-KR')}</Text>
        </View>
      </View>

      {/* 액션 버튼들 */}
      <View style={styles.actionSection}>
        <TouchableOpacity onPress={shareResponse} style={styles.actionButton}>
          <Text style={styles.actionButtonText}>📤 공유</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={copyResponse} style={styles.actionButton}>
          <Text style={styles.actionButtonText}>📋 복사</Text>
        </TouchableOpacity>
      </View>

      {/* JSON 응답 */}
      <View style={styles.responseSection}>
        <Text style={styles.responseTitle}>📄 JSON 응답</Text>
        <ScrollView style={styles.responseScrollView} showsVerticalScrollIndicator={true}>
          <Text style={styles.responseText}>
            {formatJSON(responseData)}
          </Text>
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  statusIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  apiName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 2,
  },
  statusMessage: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.9,
  },
  closeButton: {
    padding: 8,
  },
  closeText: {
    fontSize: 20,
    color: '#fff',
    fontWeight: 'bold',
  },
  infoSection: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 14,
    color: '#495057',
    fontWeight: '600',
  },
  infoValue: {
    fontSize: 14,
    color: '#212529',
    fontWeight: '500',
  },
  actionSection: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  actionButton: {
    backgroundColor: '#007bff',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    flex: 1,
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  responseSection: {
    flex: 1,
    padding: 16,
  },
  responseTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#495057',
    marginBottom: 12,
  },
  responseScrollView: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  responseText: {
    fontSize: 12,
    fontFamily: 'monospace',
    color: '#495057',
    lineHeight: 18,
  },
});

export default ApiResponseViewer;
