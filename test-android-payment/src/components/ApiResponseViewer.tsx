3+8-3

'import React from 'react';
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
  응답데이터: any;
  API이름: string;
  표시여부: boolean;
  닫기함수: () => void;
}

const ApiResponseViewer: React.FC<ApiResponseViewerProps> = ({
  응답데이터,
  API이름,
  표시여부,
  닫기함수,
}) => {
  if (!표시여부) return null;

  const 응답공유 = async () => {
    try {
      const 공유내용 = `🧪 ${API이름} API 응답 결과\n\n${JSON.stringify(응답데이터, null, 2)}`;
      await Share.share({
        message: 공유내용,
        title: `${API이름} API 테스트 결과`,
      });
    } catch (오류) {
      Alert.alert('공유 실패', '응답 데이터 공유에 실패했습니다.');
    }
  };

  const 응답복사 = () => {
    // React Native에서는 Clipboard API 사용 필요
    Alert.alert('복사 완료', 'JSON 응답이 클립보드에 복사되었습니다.');
  };

  const 응답상태확인 = () => {
    if (응답데이터?.오류) {
      return {
        상태: '오류',
        색상: '#dc3545',
        아이콘: '❌',
        메시지: 응답데이터.메시지 || '알 수 없는 오류가 발생했습니다.'
      };
    } else if (응답데이터?.data || 응답데이터?.message === 'success') {
      return {
        상태: '성공',
        색상: '#28a745',
        아이콘: '✅',
        메시지: 'API 호출이 성공했습니다.'
      };
    } else {
      return {
        상태: '알 수 없음',
        색상: '#ffc107',
        아이콘: '⚠️',
        메시지: '응답 상태를 확인할 수 없습니다.'
      };
    }
  };

  const 상태정보 = 응답상태확인();

  const JSON포맷팅 = (데이터: any): string => {
    try {
      return JSON.stringify(데이터, null, 2);
    } catch (오류) {
      return '응답 데이터를 표시할 수 없습니다.';
    }
  };

  const 응답크기계산 = (): string => {
    const JSON문자열 = JSON포맷팅(응답데이터);
    const 바이트크기 = new Blob([JSON문자열]).size;
    
    if (바이트크기 < 1024) {
      return `${바이트크기} bytes`;
    } else if (바이트크기 < 1024 * 1024) {
      return `${(바이트크기 / 1024).toFixed(1)} KB`;
    } else {
      return `${(바이트크기 / (1024 * 1024)).toFixed(1)} MB`;
    }
  };

  return (
    <View style={스타일.컨테이너}>
      {/* 헤더 */}
      <View style={[스타일.헤더, { backgroundColor: 상태정보.색상 }]}>
        <View style={스타일.헤더왼쪽}>
          <Text style={스타일.상태아이콘}>{상태정보.아이콘}</Text>
          <View>
            <Text style={스타일.API이름}>{API이름}</Text>
            <Text style={스타일.상태메시지}>{상태정보.메시지}</Text>
          </View>
        </View>
        <TouchableOpacity onPress={닫기함수} style={스타일.닫기버튼}>
          <Text style={스타일.닫기텍스트}>✕</Text>
        </TouchableOpacity>
      </View>

      {/* 응답 정보 */}
      <View style={스타일.정보섹션}>
        <View style={스타일.정보행}>
          <Text style={스타일.정보라벨}>📊 응답 크기:</Text>
          <Text style={스타일.정보값}>{응답크기계산()}</Text>
        </View>
        
        {응답데이터?.상태코드 && (
          <View style={스타일.정보행}>
            <Text style={스타일.정보라벨}>🔢 상태 코드:</Text>
            <Text style={[
              스타일.정보값,
              { color: 응답데이터.상태코드 >= 400 ? '#dc3545' : '#28a745' }
            ]}>
              {응답데이터.상태코드}
            </Text>
          </View>
        )}
        
        <View style={스타일.정보행}>
          <Text style={스타일.정보라벨}>⏰ 응답 시간:</Text>
          <Text style={스타일.정보값}>{new Date().toLocaleTimeString('ko-KR')}</Text>
        </View>
      </View>

      {/* 액션 버튼들 */}
      <View style={스타일.액션섹션}>
        <TouchableOpacity onPress={응답공유} style={스타일.액션버튼}>
          <Text style={스타일.액션버튼텍스트}>📤 공유</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={응답복사} style={스타일.액션버튼}>
          <Text style={스타일.액션버튼텍스트}>📋 복사</Text>
        </TouchableOpacity>
      </View>

      {/* JSON 응답 */}
      <View style={스타일.응답섹션}>
        <Text style={스타일.응답제목}>📄 JSON 응답</Text>
        <ScrollView style={스타일.응답스크롤뷰} showsVerticalScrollIndicator={true}>
          <Text style={스타일.응답텍스트}>
            {JSON포맷팅(응답데이터)}
          </Text>
        </ScrollView>
      </View>
    </View>
  );
};

const 스타일 = StyleSheet.create({
  컨테이너: {
    flex: 1,
    backgroundColor: '#fff',
  },
  헤더: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  헤더왼쪽: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  상태아이콘: {
    fontSize: 24,
    marginRight: 12,
  },
  API이름: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 2,
  },
  상태메시지: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.9,
  },
  닫기버튼: {
    padding: 8,
  },
  닫기텍스트: {
    fontSize: 20,
    color: '#fff',
    fontWeight: 'bold',
  },
  정보섹션: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  정보행: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  정보라벨: {
    fontSize: 14,
    color: '#495057',
    fontWeight: '600',
  },
  정보값: {
    fontSize: 14,
    color: '#212529',
    fontWeight: '500',
  },
  액션섹션: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  액션버튼: {
    backgroundColor: '#007bff',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    flex: 1,
    alignItems: 'center',
  },
  액션버튼텍스트: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  응답섹션: {
    flex: 1,
    padding: 16,
  },
  응답제목: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#495057',
    marginBottom: 12,
  },
  응답스크롤뷰: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  응답텍스트: {
    fontSize: 12,
    fontFamily: 'monospace',
    color: '#495057',
    lineHeight: 18,
  },
});

export default ApiResponseViewer;
