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
import { getAllApiList, groupApisByCategory, searchApis, ApiEndpoint, ParameterInfo } from '../config/apiEndpoints';

interface ApiTestScreenProps {
  onGoBack: () => void;
}

// 인터페이스는 config 파일에서 import

const ApiTestScreen: React.FC<ApiTestScreenProps> = ({ onGoBack }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [responseData, setResponseData] = useState<any>(null);
  const [showResponseModal, setShowResponseModal] = useState(false);
  const [showParameterModal, setShowParameterModal] = useState(false);
  const [currentAPI, setCurrentAPI] = useState<ApiEndpoint | null>(null);
  const [userId, setUserId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [apiCallHistory, setApiCallHistory] = useState<Array<{
    apiName: string;
    callTime: Date;
    isSuccess: boolean;
    responseData: any;
  }>>([]);

  useEffect(() => {
    loadUserInfo();
  }, []);

  const loadUserInfo = async () => {
    try {
      const userInfo = await tokenManager.getUserInfoFromToken();
      if (userInfo) {
        setUserId(userInfo.userId);
      }
    } catch (error) {
      console.error('사용자 정보 로드 실패:', error);
    }
  };

  // API 목록 가져오기 (config에서)
  const apiList = getAllApiList(userId || 1);

  // 검색 필터링된 API 목록
  const filteredApiList = searchTerm ? searchApis(apiList, searchTerm) : apiList;

  // 카테고리별로 API 그룹화
  const apisByCategory = groupApisByCategory(filteredApiList);

  const callAPI = async (api: API엔드포인트, parameters?: Record<string, string>) => {
    setIsLoading(true);
    setResponseData(null);

    const startTime = new Date();

    try {
      const result = await api.func(parameters);
      setResponseData(result);

      // API 호출 기록 추가
      setApiCallHistory(prevHistory => [
        {
          apiName: api.name,
          callTime: startTime,
          isSuccess: true,
          responseData: result
        },
        ...prevHistory.slice(0, 9) // 최근 10개만 유지
      ]);

      setShowResponseModal(true);
    } catch (error: any) {
      console.error('API 호출 오류:', error);
      const errorResponse = {
        error: true,
        message: error.response?.data?.message || error.message || 'API 호출에 실패했습니다',
        statusCode: error.response?.status,
        details: error.response?.data
      };

      setResponseData(errorResponse);

      // 오류도 기록에 추가
      setApiCallHistory(prevHistory => [
        {
          apiName: api.name,
          callTime: startTime,
          isSuccess: false,
          responseData: errorResponse
        },
        ...prevHistory.slice(0, 9)
      ]);

      setShowResponseModal(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApiButtonClick = (api: API엔드포인트) => {
    setCurrentAPI(api);
    if (api.parameterList && api.parameterList.length > 0) {
      setShowParameterModal(true);
    } else {
      callAPI(api);
    }
  };

  const handleParameterInputComplete = (parameterValues: Record<string, string>) => {
    setShowParameterModal(false);
    if (currentAPI) {
      callAPI(currentAPI, parameterValues);
    }
  };

  const handleParameterInputCancel = () => {
    setShowParameterModal(false);
    setCurrentAPI(null);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* 헤더 */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onGoBack} style={styles.backButton}>
          <Text style={styles.backButtonText}>← 뒤로</Text>
        </TouchableOpacity>
        <Text style={styles.title}>🧪 API 테스트</Text>
        <View style={styles.spacer} />
      </View>

      {/* 검색 바 */}
      <View style={styles.searchSection}>
        <TextInput
          style={styles.searchInput}
          placeholder="API 검색... (이름, 설명, 카테고리)"
          placeholderTextColor="#6c757d"
          value={searchTerm}
          onChangeText={setSearchTerm}
        />
        {searchTerm.length > 0 && (
          <TouchableOpacity
            onPress={() => setSearchTerm('')}
            style={styles.clearSearchButton}
          >
            <Text style={styles.clearSearchButtonText}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* API 통계 */}
      <View style={styles.statsSection}>
        <Text style={styles.statsText}>
          📊 총 {filteredApiList.length}개 API {searchTerm && `(검색: "${searchTerm}")`}
        </Text>
        {apiCallHistory.length > 0 && (
          <Text style={styles.statsText}>
            🕒 최근 호출: {apiCallHistory[0].apiName} ({apiCallHistory[0].isSuccess ? '성공' : '실패'})
          </Text>
        )}
      </View>

      {/* API 목록 */}
      <ScrollView style={styles.scrollView}>
        {Object.entries(apisByCategory).map(([category, apis]) => (
          <View key={category} style={styles.categorySection}>
            <Text style={styles.categoryTitle}>{category}</Text>
            {apis.map((api, index) => (
              <TouchableOpacity
                key={index}
                style={[styles.apiButton, isLoading && styles.disabledButton]}
                onPress={() => handleApiButtonClick(api)}
                disabled={isLoading}
              >
                <View style={styles.apiButtonContent}>
                  <Text style={styles.apiName}>{api.name}</Text>
                  <Text style={styles.apiDescription}>{api.description}</Text>
                  {api.parameterList && api.parameterList.length > 0 && (
                    <Text style={styles.parameterInfo}>
                      📝 매개변수 {api.parameterList.length}개 필요
                    </Text>
                  )}
                </View>
                {isLoading && currentAPI?.name === api.name && (
                  <ActivityIndicator size="small" color="#007bff" />
                )}
              </TouchableOpacity>
            ))}
          </View>
        ))}
      </ScrollView>

      {/* 매개변수 입력 모달 */}
      {currentAPI && (
        <ApiParameterInput
          isVisible={showParameterModal}
          apiName={currentAPI.name}
          parameterList={currentAPI.parameterList || []}
          onConfirm={handleParameterInputComplete}
          onCancel={handleParameterInputCancel}
        />
      )}

      {/* 응답 모달 */}
      <Modal
        visible={showResponseModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowResponseModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ApiResponseViewer
              responseData={responseData}
              apiName={currentAPI?.name || 'API'}
              isVisible={showResponseModal}
              onClose={() => setShowResponseModal(false)}
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
