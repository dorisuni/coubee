import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Alert,
  ActivityIndicator,
  Modal,
  TextInput,
} from 'react-native';
import { tokenManager } from '../api/client';
import ApiResponseViewer from '../components/ApiResponseViewer';
import ApiParameterInput from '../components/ApiParameterInput';
import { 전체API목록, 카테고리별API그룹화, API검색, API엔드포인트, 매개변수정보 } from '../config/apiEndpoints';

interface ApiTestScreenProps {
  뒤로가기: () => void;
}

// 인터페이스는 config 파일에서 import

const ApiTestScreen: React.FC<ApiTestScreenProps> = ({ 뒤로가기 }) => {
  const [로딩중, 로딩중설정] = useState(false);
  const [응답데이터, 응답데이터설정] = useState<any>(null);
  const [응답모달표시, 응답모달표시설정] = useState(false);
  const [매개변수모달표시, 매개변수모달표시설정] = useState(false);
  const [현재API, 현재API설정] = useState<API엔드포인트 | null>(null);
  const [사용자아이디, 사용자아이디설정] = useState<number | null>(null);
  const [검색어, 검색어설정] = useState('');
  const [API호출기록, API호출기록설정] = useState<Array<{
    API이름: string;
    호출시간: Date;
    성공여부: boolean;
    응답데이터: any;
  }>>([]);

  useEffect(() => {
    사용자정보로드();
  }, []);

  const 사용자정보로드 = async () => {
    try {
      const 사용자정보 = await tokenManager.getUserInfoFromToken();
      if (사용자정보) {
        사용자아이디설정(사용자정보.userId);
      }
    } catch (오류) {
      console.error('사용자 정보 로드 실패:', 오류);
    }
  };

  // API 목록 가져오기 (config에서)
  const API목록 = 전체API목록(사용자아이디 || 1);

  // 검색 필터링된 API 목록
  const 필터링된API목록 = 검색어 ? API검색(API목록, 검색어) : API목록;

  // 카테고리별로 API 그룹화
  const 카테고리별API = 카테고리별API그룹화(필터링된API목록);

  const API호출 = async (api: API엔드포인트, 매개변수들?: Record<string, string>) => {
    로딩중설정(true);
    응답데이터설정(null);
    
    const 시작시간 = new Date();

    try {
      const 결과 = await api.함수(매개변수들);
      응답데이터설정(결과);
      
      // API 호출 기록 추가
      API호출기록설정(이전기록 => [
        {
          API이름: api.이름,
          호출시간: 시작시간,
          성공여부: true,
          응답데이터: 결과
        },
        ...이전기록.slice(0, 9) // 최근 10개만 유지
      ]);
      
      응답모달표시설정(true);
    } catch (오류: any) {
      console.error('API 호출 오류:', 오류);
      const 오류응답 = {
        오류: true,
        메시지: 오류.response?.data?.message || 오류.message || 'API 호출에 실패했습니다',
        상태코드: 오류.response?.status,
        상세정보: 오류.response?.data
      };
      
      응답데이터설정(오류응답);
      
      // 오류도 기록에 추가
      API호출기록설정(이전기록 => [
        {
          API이름: api.이름,
          호출시간: 시작시간,
          성공여부: false,
          응답데이터: 오류응답
        },
        ...이전기록.slice(0, 9)
      ]);
      
      응답모달표시설정(true);
    } finally {
      로딩중설정(false);
    }
  };

  const API버튼클릭 = (api: API엔드포인트) => {
    현재API설정(api);
    if (api.매개변수목록 && api.매개변수목록.length > 0) {
      매개변수모달표시설정(true);
    } else {
      API호출(api);
    }
  };

  const 매개변수입력완료 = (매개변수값들: Record<string, string>) => {
    매개변수모달표시설정(false);
    if (현재API) {
      API호출(현재API, 매개변수값들);
    }
  };

  const 매개변수입력취소 = () => {
    매개변수모달표시설정(false);
    현재API설정(null);
  };

  return (
    <SafeAreaView style={스타일.컨테이너}>
      {/* 헤더 */}
      <View style={스타일.헤더}>
        <TouchableOpacity onPress={뒤로가기} style={스타일.뒤로가기버튼}>
          <Text style={스타일.뒤로가기텍스트}>← 뒤로</Text>
        </TouchableOpacity>
        <Text style={스타일.제목}>🧪 API 테스트</Text>
        <View style={스타일.빈공간} />
      </View>

      {/* 검색 바 */}
      <View style={스타일.검색섹션}>
        <TextInput
          style={스타일.검색입력}
          placeholder="API 검색... (이름, 설명, 카테고리)"
          placeholderTextColor="#6c757d"
          value={검색어}
          onChangeText={검색어설정}
        />
        {검색어.length > 0 && (
          <TouchableOpacity
            onPress={() => 검색어설정('')}
            style={스타일.검색지우기버튼}
          >
            <Text style={스타일.검색지우기텍스트}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* API 통계 */}
      <View style={스타일.통계섹션}>
        <Text style={스타일.통계텍스트}>
          📊 총 {필터링된API목록.length}개 API {검색어 && `(검색: "${검색어}")`}
        </Text>
        {API호출기록.length > 0 && (
          <Text style={스타일.통계텍스트}>
            🕒 최근 호출: {API호출기록[0].API이름} ({API호출기록[0].성공여부 ? '성공' : '실패'})
          </Text>
        )}
      </View>

      {/* API 목록 */}
      <ScrollView style={스타일.스크롤뷰}>
        {Object.entries(카테고리별API).map(([카테고리, apis]) => (
          <View key={카테고리} style={스타일.카테고리섹션}>
            <Text style={스타일.카테고리제목}>{카테고리}</Text>
            {apis.map((api, 인덱스) => (
              <TouchableOpacity
                key={인덱스}
                style={[스타일.API버튼, 로딩중 && 스타일.비활성화버튼]}
                onPress={() => API버튼클릭(api)}
                disabled={로딩중}
              >
                <View style={스타일.API버튼내용}>
                  <Text style={스타일.API이름}>{api.이름}</Text>
                  <Text style={스타일.API설명}>{api.설명}</Text>
                  {api.매개변수목록 && api.매개변수목록.length > 0 && (
                    <Text style={스타일.매개변수정보}>
                      📝 매개변수 {api.매개변수목록.length}개 필요
                    </Text>
                  )}
                </View>
                {로딩중 && 현재API?.이름 === api.이름 && (
                  <ActivityIndicator size="small" color="#007bff" />
                )}
              </TouchableOpacity>
            ))}
          </View>
        ))}
      </ScrollView>

      {/* 매개변수 입력 모달 */}
      {현재API && (
        <ApiParameterInput
          표시여부={매개변수모달표시}
          API이름={현재API.이름}
          매개변수목록={현재API.매개변수목록 || []}
          확인함수={매개변수입력완료}
          취소함수={매개변수입력취소}
        />
      )}

      {/* 응답 모달 */}
      <Modal
        visible={응답모달표시}
        transparent={true}
        animationType="slide"
        onRequestClose={() => 응답모달표시설정(false)}
      >
        <View style={스타일.모달오버레이}>
          <View style={스타일.모달내용}>
            <ApiResponseViewer
              응답데이터={응답데이터}
              API이름={현재API?.이름 || 'API'}
              표시여부={응답모달표시}
              닫기함수={() => 응답모달표시설정(false)}
            />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const 스타일 = StyleSheet.create({
  컨테이너: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  헤더: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  뒤로가기버튼: {
    padding: 8,
  },
  뒤로가기텍스트: {
    fontSize: 16,
    color: '#007bff',
    fontWeight: '600',
  },
  제목: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#495057',
  },
  빈공간: {
    width: 60,
  },
  검색섹션: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  검색입력: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#e9ecef',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#f8f9fa',
  },
  검색지우기버튼: {
    marginLeft: 8,
    padding: 8,
    backgroundColor: '#6c757d',
    borderRadius: 6,
  },
  검색지우기텍스트: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  통계섹션: {
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  통계텍스트: {
    fontSize: 12,
    color: '#6c757d',
    marginBottom: 2,
  },
  스크롤뷰: {
    flex: 1,
    padding: 16,
  },
  카테고리섹션: {
    marginBottom: 24,
  },
  카테고리제목: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#495057',
    marginBottom: 12,
    paddingLeft: 4,
  },
  API버튼: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  비활성화버튼: {
    opacity: 0.6,
  },
  API버튼내용: {
    flex: 1,
  },
  API이름: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212529',
    marginBottom: 4,
  },
  API설명: {
    fontSize: 14,
    color: '#6c757d',
    marginBottom: 4,
  },
  매개변수정보: {
    fontSize: 12,
    color: '#007bff',
    fontStyle: 'italic',
  },
  모달오버레이: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  모달내용: {
    backgroundColor: '#fff',
    borderRadius: 15,
    width: '90%',
    maxHeight: '80%',
  },
});

export default ApiTestScreen;
