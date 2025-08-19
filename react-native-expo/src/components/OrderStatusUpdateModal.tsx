import React, { useState, useCallback } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { orderAPI } from '../api/client';

// 백엔드와 협의된 주문 상태 전이 규칙
const ALLOWED_TRANSITIONS: Record<string, string[]> = {
  PENDING: ['PAID', 'CANCELLED', 'FAILED'],
  PAID: ['PREPARING', 'CANCELLED', 'FAILED'],
  PREPARING: ['PREPARED', 'CANCELLED'],
  PREPARED: ['RECEIVED', 'CANCELLED'],
  RECEIVED: [],
  CANCELLED: [],
  FAILED: [],
};

interface OrderStatusUpdateModalProps {
  isVisible: boolean;
  onClose: () => void;
  onConfirm: (orderId: string, newStatus: string) => void;
}

const OrderStatusUpdateModal: React.FC<OrderStatusUpdateModalProps> = ({
  isVisible,
  onClose,
  onConfirm,
}) => {
  const [orderId, setOrderId] = useState('');
  const [currentStatus, setCurrentStatus] = useState<string | null>(null);
  const [nextStatusOptions, setNextStatusOptions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resetState = useCallback(() => {
    setOrderId('');
    setCurrentStatus(null);
    setNextStatusOptions([]);
    setIsLoading(false);
    setError(null);
  }, []);

  const handleClose = () => {
    resetState();
    onClose();
  };

  const handleFetchStatus = async () => {
    if (!orderId.trim()) {
      setError('주문 ID를 입력해주세요.');
      return;
    }
    setIsLoading(true);
    setError(null);
    setCurrentStatus(null);
    setNextStatusOptions([]);

    try {
      const response = await orderAPI.getOrderStatus(orderId.trim());
      // API 응답 구조에 따라 실제 상태 값 경로를 맞춰야 합니다.
      // 예: response.data.status, response.data[0].status 등
      const status = response.data?.status || response.data; 

      if (typeof status !== 'string' || !ALLOWED_TRANSITIONS.hasOwnProperty(status)) {
        throw new Error(`알 수 없거나 처리할 수 없는 상태입니다: ${status}`);
      }
      
      setCurrentStatus(status);
      setNextStatusOptions(ALLOWED_TRANSITIONS[status]);

    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || '주문 상태를 조회하지 못했습니다.';
      setError(errorMessage);
      Alert.alert('오류', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirm = (newStatus: string) => {
    onConfirm(orderId, newStatus);
    handleClose();
  };

  return (
    <Modal
      visible={isVisible}
      transparent={true}
      animationType="fade"
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <Text style={styles.title}>주문 상태 변경 (관리자)</Text>
          
          {/* Step 1: 주문 ID 입력 */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>주문 ID</Text>
            <TextInput
              style={styles.input}
              value={orderId}
              onChangeText={setOrderId}
              placeholder="상태를 조회할 주문 ID"
              editable={!currentStatus}
            />
            <TouchableOpacity 
              style={[styles.button, styles.fetchButton, !!currentStatus && styles.disabledButton]} 
              onPress={handleFetchStatus}
              disabled={!!currentStatus}
            >
              <Text style={styles.buttonText}>상태 조회</Text>
            </TouchableOpacity>
          </View>

          {isLoading && <ActivityIndicator size="large" color="#007bff" style={{ marginVertical: 20 }} />}
          {error && <Text style={styles.errorText}>{error}</Text>}

          {/* Step 2: 다음 상태 선택 */}
          {currentStatus && (
            <View style={styles.statusSection}>
              <Text style={styles.currentStatusText}>
                현재 상태: <Text style={styles.statusHighlight}>{currentStatus}</Text>
              </Text>
              <Text style={styles.label}>변경할 상태를 선택하세요:</Text>
              {nextStatusOptions.length > 0 ? (
                <View style={styles.optionsContainer}>
                  {nextStatusOptions.map(status => (
                    <TouchableOpacity
                      key={status}
                      style={[styles.button, styles.optionButton]}
                      onPress={() => handleConfirm(status)}
                    >
                      <Text style={styles.buttonText}>{status}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              ) : (
                <Text style={styles.infoText}>변경 가능한 다음 상태가 없습니다.</Text>
              )}
            </View>
          )}

          <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={handleClose}>
            <Text style={styles.buttonText}>취소</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  container: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    color: '#555',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
    marginBottom: 12,
  },
  button: {
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fetchButton: {
    backgroundColor: '#007bff',
  },
  disabledButton: {
    backgroundColor: '#aaa',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  statusSection: {
    marginTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 20,
  },
  currentStatusText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 16,
    color: '#333',
  },
  statusHighlight: {
    fontWeight: 'bold',
    color: '#dc3545',
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 10,
  },
  optionButton: {
    backgroundColor: '#28a745',
    paddingHorizontal: 20,
  },
  infoText: {
    textAlign: 'center',
    color: '#6c757d',
    fontStyle: 'italic',
    marginTop: 10,
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    marginVertical: 10,
  },
  cancelButton: {
    marginTop: 20,
    backgroundColor: '#6c757d',
  },
});

export default OrderStatusUpdateModal;
