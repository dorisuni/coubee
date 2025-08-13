import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Alert,
  ScrollView,
} from 'react-native';

interface ParameterInfo {
  name: string;
  type: string;
  required: boolean;
  defaultValue?: string;
  description?: string;
  example?: string;
}

interface ApiParameterInputProps {
  isVisible: boolean;
  apiName: string;
  parameterList: ParameterInfo[];
  onConfirm: (parameterValues: Record<string, string>) => void;
  onCancel: () => void;
}

const ApiParameterInput: React.FC<ApiParameterInputProps> = ({
  isVisible,
  apiName,
  parameterList,
  onConfirm,
  onCancel,
}) => {
  const [parameterValues, setParameterValues] = useState<Record<string, string>>({});

  const handleParameterChange = (parameterName: string, value: string) => {
    setParameterValues(prevValues => ({
      ...prevValues,
      [parameterName]: value,
    }));
  };

  const validateInput = (): boolean => {
    for (const parameter of parameterList) {
      if (parameter.required && !parameterValues[parameter.name]?.trim()) {
        Alert.alert('입력 오류', `${parameter.name}은(는) 필수 입력 항목입니다.`);
        return false;
      }
    }
    return true;
  };

  const handleConfirmClick = () => {
    if (validateInput()) {
      // 기본값 적용
      const finalParameterValues = { ...parameterValues };
      parameterList.forEach(parameter => {
        if (!finalParameterValues[parameter.name] && parameter.defaultValue) {
          finalParameterValues[parameter.name] = parameter.defaultValue;
        }
      });

      onConfirm(finalParameterValues);
      setParameterValues({});
    }
  };

  const handleCancelClick = () => {
    setParameterValues({});
    onCancel();
  };

  const applyExampleValue = (parameter: ParameterInfo) => {
    if (parameter.example) {
      handleParameterChange(parameter.name, parameter.example);
    }
  };

  const getInputPropertiesByType = (type: string) => {
    switch (type.toLowerCase()) {
      case 'number':
      case '숫자':
        return { keyboardType: 'numeric' as const };
      case 'email':
      case '이메일':
        return { keyboardType: 'email-address' as const };
      case 'phone':
      case '전화번호':
        return { keyboardType: 'phone-pad' as const };
      case 'url':
        return { keyboardType: 'url' as const };
      default:
        return { keyboardType: 'default' as const };
    }
  };

  return (
    <Modal
      visible={표시여부}
      transparent={true}
      animationType="slide"
      onRequestClose={취소버튼클릭}
    >
      <View style={스타일.모달오버레이}>
        <View style={스타일.모달내용}>
          {/* 헤더 */}
          <View style={스타일.헤더}>
            <Text style={스타일.제목}>📝 매개변수 입력</Text>
            <Text style={스타일.부제목}>{API이름}</Text>
          </View>

          {/* 매개변수 입력 폼 */}
          <ScrollView style={스타일.폼스크롤뷰} showsVerticalScrollIndicator={false}>
            {매개변수목록.map((매개변수, 인덱스) => (
              <View key={인덱스} style={스타일.매개변수그룹}>
                <View style={스타일.라벨행}>
                  <Text style={스타일.매개변수라벨}>
                    {매개변수.이름}
                    {매개변수.필수여부 && <Text style={스타일.필수표시}> *</Text>}
                  </Text>
                  <Text style={스타일.타입표시}>({매개변수.타입})</Text>
                </View>

                {매개변수.설명 && (
                  <Text style={스타일.설명텍스트}>{매개변수.설명}</Text>
                )}

                <View style={스타일.입력행}>
                  <TextInput
                    style={[
                      스타일.입력필드,
                      매개변수.필수여부 && !매개변수값들[매개변수.이름] && 스타일.필수입력필드
                    ]}
                    value={매개변수값들[매개변수.이름] || ''}
                    onChangeText={(값) => 매개변수값변경(매개변수.이름, 값)}
                    placeholder={매개변수.기본값 ? `기본값: ${매개변수.기본값}` : `${매개변수.이름} 입력`}
                    placeholderTextColor="#6c757d"
                    {...타입별입력속성(매개변수.타입)}
                  />
                  
                  {매개변수.예시 && (
                    <TouchableOpacity
                      onPress={() => 예시값적용(매개변수)}
                      style={스타일.예시버튼}
                    >
                      <Text style={스타일.예시버튼텍스트}>예시</Text>
                    </TouchableOpacity>
                  )}
                </View>

                {매개변수.예시 && (
                  <Text style={스타일.예시텍스트}>예시: {매개변수.예시}</Text>
                )}
              </View>
            ))}
          </ScrollView>

          {/* 액션 버튼들 */}
          <View style={스타일.액션섹션}>
            <TouchableOpacity onPress={취소버튼클릭} style={스타일.취소버튼}>
              <Text style={스타일.취소버튼텍스트}>취소</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={확인버튼클릭} style={스타일.확인버튼}>
              <Text style={스타일.확인버튼텍스트}>🚀 API 호출</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const 스타일 = StyleSheet.create({
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
  헤더: {
    backgroundColor: '#007bff',
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    padding: 20,
    alignItems: 'center',
  },
  제목: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  부제목: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.9,
  },
  폼스크롤뷰: {
    maxHeight: 400,
    padding: 20,
  },
  매개변수그룹: {
    marginBottom: 20,
  },
  라벨행: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  매개변수라벨: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212529',
  },
  필수표시: {
    color: '#dc3545',
  },
  타입표시: {
    fontSize: 12,
    color: '#6c757d',
    fontStyle: 'italic',
  },
  설명텍스트: {
    fontSize: 14,
    color: '#6c757d',
    marginBottom: 8,
    lineHeight: 20,
  },
  입력행: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  입력필드: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#e9ecef',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  필수입력필드: {
    borderColor: '#dc3545',
    borderWidth: 2,
  },
  예시버튼: {
    backgroundColor: '#28a745',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
  },
  예시버튼텍스트: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  예시텍스트: {
    fontSize: 12,
    color: '#28a745',
    marginTop: 4,
    fontStyle: 'italic',
  },
  액션섹션: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
  },
  취소버튼: {
    flex: 1,
    backgroundColor: '#6c757d',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  취소버튼텍스트: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  확인버튼: {
    flex: 2,
    backgroundColor: '#007bff',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  확인버튼텍스트: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ApiParameterInput;
