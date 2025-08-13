import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  ActivityIndicator,
  SafeAreaView,
  Modal,
  Image,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { Payment, PortOneController } from '@portone/react-native-sdk';
import { authAPI, orderAPI, paymentAPI, qrAPI, tokenManager } from '../api/client';
import { PaymentMethod, OrderItem, Order, PaymentConfig, PAYMENT_METHOD_LABELS } from '../types';

interface MainScreenProps {
  onLogout: () => void;
}

const MainScreen: React.FC<MainScreenProps> = ({ onLogout }) => {
  const paymentController = useRef<PortOneController>(null);
  
  // 사용자 정보
  const [userId, setUserId] = useState<number | null>(null);
  
  // 주문 정보
  const [storeId, setStoreId] = useState('1');
  const [recipientName, setRecipientName] = useState('홍길동');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('CARD');
  const [itemName, setItemName] = useState('테스트 상품');
  const [productId, setProductId] = useState('1');
  const [quantity, setQuantity] = useState('2');
  const [itemPrice, setItemPrice] = useState('500');
  
  // 상태 관리
  const [isLoading, setIsLoading] = useState(false);
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null);
  const [paymentConfig, setPaymentConfig] = useState<PaymentConfig | null>(null);
  const [showPayment, setShowPayment] = useState(false);
  const [qrModalVisible, setQrModalVisible] = useState(false);
  const [qrImageUri, setQrImageUri] = useState<string | null>(null);

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

  const handleLogout = async () => {
    Alert.alert(
      '로그아웃',
      '정말 로그아웃하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        { 
          text: '로그아웃', 
          onPress: async () => {
            await authAPI.logout();
            onLogout();
          }
        }
      ]
    );
  };

  const calculateTotalAmount = (): number => {
    return parseInt(quantity) * parseInt(itemPrice);
  };

  const startPaymentFlow = async () => {
    if (!userId) {
      Alert.alert('오류', '사용자 정보를 불러올 수 없습니다.');
      return;
    }

    setIsLoading(true);
    try {
      // 1. 결제 설정 정보 가져오기
      await fetchPaymentConfig();
      
      // 2. 주문 생성
      await createOrder();
      
      // 3. 결제 준비
      await preparePayment();
      
      // 4. 결제창 표시
      setShowPayment(true);
      
    } catch (error: any) {
      console.error('결제 플로우 시작 실패:', error);
      Alert.alert('오류', error.message || '결제 플로우 시작에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPaymentConfig = async () => {
    try {
      const response = await paymentAPI.getPaymentConfig();
      setPaymentConfig(response.data);
    } catch (error: any) {
      throw new Error('결제 설정 로드 실패: ' + (error.response?.data?.message || error.message));
    }
  };

  const createOrder = async () => {
    if (!userId) throw new Error('사용자 정보가 없습니다.');

    const orderItems: OrderItem[] = [{
      productId: parseInt(productId),
      name: itemName,
      quantity: parseInt(quantity),
      price: parseInt(itemPrice)
    }];

    const orderData = {
      storeId: parseInt(storeId),
      recipientName,
      paymentMethod,
      totalAmount: calculateTotalAmount(),
      items: orderItems
    };

    try {
      const response = await orderAPI.createOrder(orderData);
      // OrderResponse를 Order 타입으로 변환
      const order: Order = {
        ...response.data,
        storeId: parseInt(storeId),
        recipientName,
        paymentMethod,
        items: orderItems
      };
      setCurrentOrder(order);
    } catch (error: any) {
      throw new Error('주문 생성 실패: ' + (error.response?.data?.message || error.message));
    }
  };

  const preparePayment = async () => {
    if (!currentOrder) throw new Error('주문 정보가 없습니다.');

    const prepareData = {
      storeId: parseInt(storeId),
      items: [{
        productId: parseInt(productId),
        name: itemName,
        quantity: parseInt(quantity),
        price: parseInt(itemPrice)
      }]
    };

    try {
      await paymentAPI.preparePayment(currentOrder.orderId, prepareData);
    } catch (error: any) {
      throw new Error('결제 준비 실패: ' + (error.response?.data?.message || error.message));
    }
  };

  const getPortOnePayMethod = (method: PaymentMethod): "CARD" | "EASY_PAY" | "VIRTUAL_ACCOUNT" | "TRANSFER" | "MOBILE" | "GIFT_CERTIFICATE" | "PAYPAL" | "ALIPAY" => {
    const payMethodMap: Record<PaymentMethod, "CARD" | "EASY_PAY" | "VIRTUAL_ACCOUNT" | "TRANSFER" | "MOBILE" | "GIFT_CERTIFICATE" | "PAYPAL" | "ALIPAY"> = {
      'CARD': 'CARD',
      'KAKAOPAY': 'EASY_PAY',
      'TOSSPAY': 'EASY_PAY'
    };
    return payMethodMap[method] || 'CARD';
  };

  const handlePaymentComplete = async (result: any) => {
    setShowPayment(false);
    
    if (result.code != null) {
      Alert.alert('결제 실패', result.message || '결제가 실패했습니다.');
      return;
    }

    Alert.alert('결제 성공', '결제가 완료되었습니다!');
    
    // QR 코드 생성 및 표시
    if (currentOrder) {
      await showPickupQrCode(currentOrder.orderId);
    }
  };

  const handlePaymentError = (error: any) => {
    setShowPayment(false);
    Alert.alert('결제 오류', error.message || '결제 중 오류가 발생했습니다.');
  };

  const showPickupQrCode = async (orderId: string) => {
    try {
      // Base64 형태로 QR 코드 이미지 가져오기
      const qrBase64 = await qrAPI.getQrCodeBase64(orderId);
      setQrImageUri(qrBase64);
      setQrModalVisible(true);
    } catch (error: any) {
      console.error('QR 코드 생성 실패:', error);
      Alert.alert('오류', 'QR 코드 생성에 실패했습니다.');
    }
  };

  if (showPayment && currentOrder && paymentConfig) {
    const channelKey = paymentConfig.channelKeys[paymentMethod.toLowerCase()];
    
    return (
      <SafeAreaView style={{ flex: 1 }}>
        <Payment
          ref={paymentController}
          request={{
            storeId: paymentConfig.storeId,
            channelKey: channelKey,
            paymentId: currentOrder.paymentId,
            orderName: currentOrder.orderName,
            totalAmount: currentOrder.amount,
            currency: "KRW" as const,
            payMethod: getPortOnePayMethod(paymentMethod),
            customer: {
              fullName: currentOrder.buyerName,
              phoneNumber: "010-1234-5678",
              email: "test@example.com"
            }
          }}
          onComplete={handlePaymentComplete}
          onError={handlePaymentError}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* 헤더 */}
        <View style={styles.header}>
          <Text style={styles.title}>🍯 Coubee 결제</Text>
          <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
            <Text style={styles.logoutButtonText}>로그아웃</Text>
          </TouchableOpacity>
        </View>

        {/* 주문 정보 입력 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🛍️ 주문 정보</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>매장 ID</Text>
            <TextInput
              style={styles.input}
              value={storeId}
              onChangeText={setStoreId}
              keyboardType="numeric"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>수령인 이름</Text>
            <TextInput
              style={styles.input}
              value={recipientName}
              onChangeText={setRecipientName}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>결제 방법</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={paymentMethod}
                onValueChange={setPaymentMethod}
                style={styles.picker}
              >
                {Object.entries(PAYMENT_METHOD_LABELS).map(([key, label]) => (
                  <Picker.Item key={key} label={label} value={key} />
                ))}
              </Picker>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>상품명</Text>
            <TextInput
              style={styles.input}
              value={itemName}
              onChangeText={setItemName}
            />
          </View>

          <View style={styles.row}>
            <View style={[styles.inputGroup, styles.flex1]}>
              <Text style={styles.label}>상품 ID</Text>
              <TextInput
                style={styles.input}
                value={productId}
                onChangeText={setProductId}
                keyboardType="numeric"
              />
            </View>
            <View style={[styles.inputGroup, styles.flex1, styles.marginLeft]}>
              <Text style={styles.label}>수량</Text>
              <TextInput
                style={styles.input}
                value={quantity}
                onChangeText={setQuantity}
                keyboardType="numeric"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>단가</Text>
            <TextInput
              style={styles.input}
              value={itemPrice}
              onChangeText={setItemPrice}
              keyboardType="numeric"
            />
          </View>

          <View style={styles.totalContainer}>
            <Text style={styles.totalText}>
              총 금액: {calculateTotalAmount().toLocaleString()}원
            </Text>
          </View>
        </View>

        {/* 결제 버튼 */}
        <TouchableOpacity
          style={[styles.paymentButton, isLoading && styles.disabledButton]}
          onPress={startPaymentFlow}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.paymentButtonText}>🚀 결제 시작</Text>
          )}
        </TouchableOpacity>
      </ScrollView>

      {/* QR 코드 모달 */}
      <Modal
        visible={qrModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setQrModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>🎉 결제 완료!</Text>
              <TouchableOpacity
                onPress={() => setQrModalVisible(false)}
                style={styles.closeButton}
              >
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>
            
            <Text style={styles.modalSubtitle}>📱 수령용 QR 코드</Text>
            <Text style={styles.modalDescription}>매장에서 이 QR 코드를 보여주세요</Text>
            
            {qrImageUri && (
              <View style={styles.qrContainer}>
                <Image source={{ uri: qrImageUri }} style={styles.qrImage} />
              </View>
            )}
            
            {currentOrder && (
              <View style={styles.orderInfo}>
                <Text style={styles.orderInfoText}>
                  <Text style={styles.bold}>주문 ID:</Text> {currentOrder.orderId}
                </Text>
                <Text style={styles.orderInfoText}>
                  <Text style={styles.bold}>수령인:</Text> {currentOrder.buyerName}
                </Text>
                <Text style={styles.orderInfoText}>
                  <Text style={styles.bold}>결제 금액:</Text> {currentOrder.amount.toLocaleString()}원
                </Text>
              </View>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollView: {
    flex: 1,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007bff',
  },
  logoutButton: {
    backgroundColor: '#dc3545',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#495057',
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#495057',
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e9ecef',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#e9ecef',
    borderRadius: 8,
    backgroundColor: '#fff',
  },
  picker: {
    height: 50,
  },
  row: {
    flexDirection: 'row',
  },
  flex1: {
    flex: 1,
  },
  marginLeft: {
    marginLeft: 10,
  },
  totalContainer: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 8,
    marginTop: 10,
  },
  totalText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007bff',
    textAlign: 'center',
  },
  paymentButton: {
    backgroundColor: '#007bff',
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
    marginBottom: 20,
  },
  disabledButton: {
    backgroundColor: '#6c757d',
  },
  paymentButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 0,
    width: '90%',
    maxWidth: 400,
  },
  modalHeader: {
    backgroundColor: '#28a745',
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  closeButton: {
    padding: 5,
  },
  closeButtonText: {
    fontSize: 24,
    color: '#fff',
    fontWeight: 'bold',
  },
  modalSubtitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#495057',
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 8,
  },
  modalDescription: {
    fontSize: 14,
    color: '#6c757d',
    textAlign: 'center',
    marginBottom: 20,
  },
  qrContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  qrImage: {
    width: 200,
    height: 200,
    borderRadius: 10,
  },
  orderInfo: {
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
    padding: 16,
    margin: 20,
  },
  orderInfoText: {
    fontSize: 14,
    color: '#495057',
    marginBottom: 6,
  },
  bold: {
    fontWeight: 'bold',
    color: '#212529',
  },
});

export default MainScreen;
