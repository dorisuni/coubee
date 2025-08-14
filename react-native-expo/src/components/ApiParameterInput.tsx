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
      visible={isVisible}
      transparent={true}
      animationType="slide"
      onRequestClose={handleCancelClick}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {/* 헤더 */}
          <View style={styles.header}>
            <Text style={styles.title}>📝 매개변수 입력</Text>
            <Text style={styles.subtitle}>{apiName}</Text>
          </View>

          {/* 매개변수 입력 폼 */}
          <ScrollView style={styles.formScrollView} showsVerticalScrollIndicator={false}>
            {parameterList.map((parameter, index) => (
              <View key={index} style={styles.parameterGroup}>
                <View style={styles.labelRow}>
                  <Text style={styles.parameterLabel}>
                    {parameter.name}
                    {parameter.required && <Text style={styles.requiredMark}> *</Text>}
                  </Text>
                  <Text style={styles.typeIndicator}>({parameter.type})</Text>
                </View>

                {parameter.description && (
                  <Text style={styles.descriptionText}>{parameter.description}</Text>
                )}

                <View style={styles.inputRow}>
                  <TextInput
                    style={[
                      styles.inputField,
                      parameter.required && !parameterValues[parameter.name] && styles.requiredInputField
                    ]}
                    value={parameterValues[parameter.name] || ''}
                    onChangeText={(value) => handleParameterChange(parameter.name, value)}
                    placeholder={parameter.defaultValue ? `기본값: ${parameter.defaultValue}` : `${parameter.name} 입력`}
                    placeholderTextColor="#6c757d"
                    {...getInputPropertiesByType(parameter.type)}
                  />

                  {parameter.example && (
                    <TouchableOpacity
                      onPress={() => applyExampleValue(parameter)}
                      style={styles.exampleButton}
                    >
                      <Text style={styles.exampleButtonText}>예시</Text>
                    </TouchableOpacity>
                  )}
                </View>

                {parameter.example && (
                  <Text style={styles.exampleText}>예시: {parameter.example}</Text>
                )}
              </View>
            ))}
          </ScrollView>

          {/* 액션 버튼들 */}
          <View style={styles.actionSection}>
            <TouchableOpacity onPress={handleCancelClick} style={styles.cancelButton}>
              <Text style={styles.cancelButtonText}>취소</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleConfirmClick} style={styles.confirmButton}>
              <Text style={styles.confirmButtonText}>🚀 API 호출</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 15,
    width: '90%',
    maxHeight: '80%',
  },
  header: {
    backgroundColor: '#007bff',
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.9,
  },
  formScrollView: {
    maxHeight: 400,
    padding: 20,
  },
  parameterGroup: {
    marginBottom: 20,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  parameterLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212529',
  },
  requiredMark: {
    color: '#dc3545',
  },
  typeIndicator: {
    fontSize: 12,
    color: '#6c757d',
    fontStyle: 'italic',
  },
  descriptionText: {
    fontSize: 14,
    color: '#6c757d',
    marginBottom: 8,
    lineHeight: 20,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  inputField: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#e9ecef',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  requiredInputField: {
    borderColor: '#dc3545',
    borderWidth: 2,
  },
  exampleButton: {
    backgroundColor: '#28a745',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
  },
  exampleButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  exampleText: {
    fontSize: 12,
    color: '#28a745',
    marginTop: 4,
    fontStyle: 'italic',
  },
  actionSection: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#6c757d',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  confirmButton: {
    flex: 2,
    backgroundColor: '#007bff',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ApiParameterInput;
