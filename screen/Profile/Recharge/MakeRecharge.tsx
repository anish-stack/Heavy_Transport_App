import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Image,
  TextInput,

  Alert,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Clock, CreditCard, QrCode } from 'lucide-react-native';
import axios from 'axios';
import { useAuth } from '../../../context/AuthContext';
import useSettings from '../../../hooks/Settings';
import { API_URL_WEB } from '../../../constant/Api';
import { Button } from '../../../components/Button/Button';
import { Heading } from '../../../components/Heading/Heading';
import { formatTime } from '../../../utils/formatters';



const { width } = Dimensions.get('window');

type PaymentMethod = 'GATEWAY' | 'QR_CODE';

interface MembershipPlan {
  _id: string;
  title: string;
  price: number;
  description: string;
  validityDays: number;
  whatIsThis: string;
  category: string;
}

export default function MakeRechargeScreen() {
  const navigation = useNavigation();
  const { user } = useAuth();
  const { settings } = useSettings();

  const [loading, setLoading] = useState(false);
  const [memberships, setMemberships] = useState<MembershipPlan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<MembershipPlan | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(null);
  const [transactionId, setTransactionId] = useState('');
  const [timer, setTimer] = useState(30 * 60);

  const fetchMembershipPlans = useCallback(async () => {
    try {
      const { data } = await axios.get(`${API_URL_WEB}/api/v1/membership-plans`);
      setMemberships(data.data.filter((plan) => plan.category === 'Transport'));
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch membership plans');
    }
  }, []);

  React.useEffect(() => {
    fetchMembershipPlans();
  }, [fetchMembershipPlans]);

  React.useEffect(() => {
    let interval: NodeJS.Timeout;
    if (paymentMethod === 'QR_CODE' && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [paymentMethod, timer]);

  const handlePlanSelect = useCallback((plan: MembershipPlan) => {
    setSelectedPlan(plan);
  }, []);

  const handlePaymentMethodSelect = useCallback((method: PaymentMethod) => {
    setPaymentMethod(method);
    if (method === 'QR_CODE') {
      setTimer(30 * 60);
    }
  }, []);

  const handlePaymentGateway = useCallback(async () => {
    if (!selectedPlan || !user?.Bh_Id) return;
    
    setLoading(true);
    try {
      // Implement payment gateway integration here
      Alert.alert('Success', 'Payment processed successfully');
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', 'Payment failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [selectedPlan, user?.Bh_Id, navigation]);

  const handleQRPayment = useCallback(async () => {
    if (!selectedPlan || !user?.Bh_Id || !transactionId) return;

    setLoading(true);
    try {
      const { data } = await axios.post(
        `${API_URL_WEB}/api/v1/do-recharge?_id=${user.Bh_Id}`,
        {
          userId: user?._id,
          plan_id: selectedPlan._id,
          trn_no: transactionId,
        }
      );
      Alert.alert('Success', data?.message);
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', 'Payment verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [selectedPlan, user?.Bh_Id, transactionId, navigation]);

  const renderPlanSelection = useMemo(() => (
    <ScrollView style={styles.plansContainer}>
      {memberships.map((plan) => (
        <View
          key={plan._id}
          style={[
            styles.planCard,
            selectedPlan?._id === plan._id && styles.selectedPlan,
          ]}
        >
          <Button
            title={plan.title}
            variant={selectedPlan?._id === plan._id ? 'primary' : 'outline'}
            onPress={() => handlePlanSelect(plan)}
            style={styles.planButton}
          />
          <View style={styles.planDetails}>
            <Heading title={`₹${plan.price}`} level={2} color="#FF385C" />
            <View style={styles.validityBadge}>
              <Clock size={16} color="#666" />
              <Heading
                title={`${plan.validityDays} ${plan.whatIsThis}`}
                level={6}
                color="#666"
                style={styles.validityText}
              />
            </View>
          </View>
        </View>
      ))}
    </ScrollView>
  ), [memberships, selectedPlan, handlePlanSelect]);

  const renderPaymentMethods = useMemo(() => (
    <View style={styles.paymentContainer}>
      <Button
        title="Pay with Gateway"
        variant={paymentMethod === 'GATEWAY' ? 'primary' : 'outline'}
        onPress={() => handlePaymentMethodSelect('GATEWAY')}
        style={styles.methodButton}
        textStyle={styles.methodButtonText}
        icon={CreditCard}
      />
      <Button
        title="Pay with QR Code"
        variant={paymentMethod === 'QR_CODE' ? 'primary' : 'outline'}
        onPress={() => handlePaymentMethodSelect('QR_CODE')}
        style={styles.methodButton}
        textStyle={styles.methodButtonText}
        icon={QrCode}
      />
    </View>
  ), [paymentMethod, handlePaymentMethodSelect]);

  const renderQRPayment = useMemo(() => (
    <View style={styles.qrContainer}>
      <View style={styles.timerContainer}>
        <Clock size={20} color="#FF385C" />
        <Heading
          title={formatTime(timer)}
          level={4}
          color="#FF385C"
          style={styles.timerText}
        />
      </View>
      <Image
        source={{ uri: settings?.paymentQr }}
        style={styles.qrImage}
        resizeMode="contain"
      />
      <TextInput
        style={styles.input}
        placeholder="Enter Transaction ID"
        value={transactionId}
        onChangeText={setTransactionId}
        placeholderTextColor="#666"
      />
      <Button
        title="Verify Payment"
        onPress={handleQRPayment}
        isLoading={loading}
        isDisabled={!transactionId}
        style={styles.verifyButton}
      />
    </View>
  ), [settings?.paymentQr, timer, transactionId, loading, handleQRPayment]);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View style={styles.header}>
          <Heading title="Choose Your Plan" level={2} />
          <Heading
            title="Select a membership plan that suits your needs"
            level={5}
            color="#666"
          />
        </View>

        {renderPlanSelection}

        {selectedPlan && (
          <>
            <View style={styles.divider} />
            <Heading
              title="Select Payment Method"
              level={3}
              style={styles.sectionTitle}
            />
            {renderPaymentMethods}
          </>
        )}

        {paymentMethod === 'QR_CODE' && renderQRPayment}
        
        {paymentMethod === 'GATEWAY' && (
          <Button
            title="Proceed to Payment"
            onPress={handlePaymentGateway}
            isLoading={loading}
            style={styles.proceedButton}
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  plansContainer: {
    padding: 16,
  },
  planCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  selectedPlan: {
    borderWidth: 2,
    borderColor: '#FF385C',
  },
  planButton: {
    marginBottom: 12,
  },
  planDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  validityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    padding: 8,
    borderRadius: 8,
  },
  validityText: {
    marginLeft: 6,
    marginBottom: 0,
  },
  divider: {
    height: 1,
    backgroundColor: '#eee',
    marginVertical: 20,
  },
  sectionTitle: {
    paddingHorizontal: 20,
  },
  paymentContainer: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
  },
  methodButton: {
    flex: 1,
  },
  methodButtonText: {
    marginLeft: 8,
  },
  qrContainer: {
    padding: 20,
    alignItems: 'center',
  },
  timerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff4f6',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
  },
  timerText: {
    marginLeft: 8,
    marginBottom: 0,
  },
  qrImage: {
    width: width - 80,
    height: width - 80,
    borderRadius: 12,
    marginBottom: 20,
  },
  input: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  verifyButton: {
    width: '100%',
  },
  proceedButton: {
    margin: 20,
  },
});