import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    Modal,
    TextInput,
    Keyboard,
    TouchableWithoutFeedback,
    Alert,
    Platform
} from 'react-native';
import { Feather, FontAwesome } from '@expo/vector-icons'

import axios from 'axios';
import { API_URL_WEB } from '../../../../constant/Api';
import { useAuth } from '../../../../context/AuthContext';
import Layout from '../../../../components/Layout/Layout';

// Types
interface BankDetails {
    accountNo: string;
    ifsc_code: string;
    bankName: string;
}

interface UPIDetails {
    upi_id: string;
}

interface WithdrawalForm {
    amount: string;
    method: 'UPI' | 'Bank Transfer';
    isBank: boolean;
    isUpi: boolean;
    BankDetails: BankDetails;
    upi_details: UPIDetails;
}

interface Withdrawal {
    _id: string;
    amount: number;
    method: 'UPI' | 'Bank Transfer';
    status: 'Approved' | 'Pending' | 'Rejected';
    BankDetails?: BankDetails;
    upi_details?: UPIDetails;
    trn_no?: string;
    requestedAt: string;
    time_of_payment_done?: string;
}

interface Props {
    user: {
        _id: string;
        balance: number;
    };
}

const INITIAL_FORM: WithdrawalForm = {
    amount: '',
    method: 'UPI',
    isBank: false,
    isUpi: true,
    BankDetails: {
        accountNo: '',
        ifsc_code: '',
        bankName: '',
    },
    upi_details: {
        upi_id: '',
    },
};

export default function WithdrawScreen() {
    const [modalVisible, setModalVisible] = useState(false);
    const [withdrawForm, setWithdrawForm] = useState<WithdrawalForm>(INITIAL_FORM);
    const [loading, setLoading] = useState(false);
    const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
    const { user } = useAuth()

    const fetchWithdrawals = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`${API_URL_WEB}/api/v1/withdrawal?_id=${user.BH_DETAILS?.data?._id}`);
            setWithdrawals(response.data.withdrawal || []);
            console.log(response.data)
            // Set last used paymentcons method if exists
            if (response.data.withdrawal?.length > 0) {
                const lastWithdrawal = response.data.withdrawal[0];
                setWithdrawForm(prev => ({
                    ...prev,
                    method: lastWithdrawal.method,
                    isBank: lastWithdrawal.method === 'Bank Transfer',
                    isUpi: lastWithdrawal.method === 'UPI',
                    BankDetails: lastWithdrawal.BankDetails || prev.BankDetails,
                    upi_details: lastWithdrawal.upi_details || prev.upi_details,
                }));
            }
        } catch (error) {
            console.log(error?.response?.data)
            Alert.alert('Error', 'Failed to load withdrawal history');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchWithdrawals();
    }, [user.BH_DETAILS?.data?._id]);

    console.log(user.BH_DETAILS?.data)
    const handleSubmit = async () => {
        if (!withdrawForm.amount || parseFloat(withdrawForm.amount) <= 0) {
            Alert.alert('Error', 'Please enter a valid amount');
            return;
        }

        if (parseFloat(withdrawForm.amount) > user.BH_DETAILS?.data?.wallet) {
            Alert.alert('Error', 'Insufficient balance');
            return;
        }


        setLoading(true);
        try {
            await axios.post(`https://www.webapi.olyox.com/api/v1/create-withdrawal?_id=${user.BH_DETAILS?.data?._id}`, withdrawForm);

            Alert.alert('Success', 'Withdrawal request submitted successfully');
            setModalVisible(false);
            fetchWithdrawals();
        } catch (error) {
            Alert.alert('Error', 'Failed to submit withdrawal request');
        } finally {
            setLoading(false);
        }
    };

    const WithdrawalCard = ({ withdrawal }: { withdrawal: Withdrawal }) => (
        <View style={styles.card}>
            <View style={styles.cardHeader}>
                <View style={styles.methodBadge}>
                    {withdrawal.method === 'UPI' ? (
                        <Feather name='credit-card' size={20} color="#2196F3" />
                    ) : (
                        <FontAwesome name='bank' size={20} color="#2196F3" />
                    )}
                    <Text style={styles.methodText}>{withdrawal.method}</Text>
                </View>
                <Text style={styles.amount}>₹{withdrawal.amount}</Text>
            </View>

            <View style={[
                styles.statusBadge,
                { backgroundColor: getStatusColor(withdrawal.status).bg }
            ]}>
                {withdrawal.status === 'Approved' ? (
                    <Feather name='alert-circle' size={18} color={getStatusColor(withdrawal.status).text} />
                ) : withdrawal.status === 'Pending' ? (
                    <Feather name='clock' size={18} color={getStatusColor(withdrawal.status).text} />
                ) : (
                    <Feather name='x' size={18} color={getStatusColor(withdrawal.status).text} />
                )}
                <Text style={[
                    styles.statusText,
                    { color: getStatusColor(withdrawal.status).text }
                ]}>
                    {withdrawal.status}
                </Text>
            </View>

            <View style={styles.cardDetails}>
                {withdrawal.method === 'UPI' ? (
                    <DetailRow
                        icon={'@'}
                        label="UPI ID"
                        value={withdrawal.upi_details?.upi_id || 'N/A'}
                    />
                ) : (
                    <>
                        <DetailRow
                            icon={<Feather name='bank' size={18} color="#666" />}
                            label="Bank"
                            value={withdrawal.BankDetails?.bankName || 'N/A'}
                        />
                        <DetailRow
                            icon={<Feather name='credit-card' size={18} color="#666" />}
                            label="Account"
                            value={withdrawal.BankDetails?.accountNo || 'N/A'}
                        />
                        <DetailRow
                            icon={<Feather name='barcode' size={18} color="#666" />}
                            label="IFSC"
                            value={withdrawal.BankDetails?.ifsc_code || 'N/A'}
                        />
                    </>
                )}

                <DetailRow
                    icon={<Feather name='calendar' size={18} color="#666" />}
                    label="Date"
                    value={formatDate(withdrawal.requestedAt)}
                />
            </View>
        </View>
    );

    const DetailRow = ({ icon, label, value }: {
        icon: React.ReactNode;
        label: string;
        value: string;
    }) => (
        <View style={styles.detailRow}>
            {icon}
            <Text style={styles.detailLabel}>{label}:</Text>
            <Text style={styles.detailValue}>{value}</Text>
        </View>
    );

    return (
        // <SafeAreaView style={styles.container}>

        // </SafeAreaView>
        <Layout isHeaderShow={false}>
            <View style={styles.header}>
                <View>
                    <Text style={styles.headerTitle}>Withdrawals</Text>
                    <Text style={styles.headerBalance}>Balance: ₹{user.BH_DETAILS?.data?.wallet}</Text>
                </View>
                <TouchableOpacity
                    style={styles.newButton}
                    onPress={() => setModalVisible(true)}
                >
                    <Feather name='plus' size={20} color="#fff" />
                    <Text style={styles.newButtonText}>Withdraw</Text>
                </TouchableOpacity>
            </View>

            {loading ? (
                <View style={styles.loader}>
                    <ActivityIndicator size="large" color="#2196F3" />
                </View>
            ) : (
                <ScrollView style={styles.content}>
                    {withdrawals.length === 0 ? (
                        <View style={styles.empty}>
                            <FontAwesome name='rupee' size={64} color="#666" />
                            <Text style={styles.emptyText}>No withdrawals yet</Text>
                        </View>
                    ) : (
                        withdrawals.map(withdrawal => (
                            <WithdrawalCard key={withdrawal._id} withdrawal={withdrawal} />
                        ))
                    )}
                </ScrollView>
            )}

            <WithdrawalModal
                visible={modalVisible}
                onClose={() => setModalVisible(false)}
                form={withdrawForm}
                setForm={setWithdrawForm}
                onSubmit={handleSubmit}
                loading={loading}
            />
        </Layout>
    );
}

const WithdrawalModal = ({
    visible,
    onClose,
    form,
    setForm,
    onSubmit,
    loading
}: {
    visible: boolean;
    onClose: () => void;
    form: WithdrawalForm;
    setForm: (form: WithdrawalForm) => void;
    onSubmit: () => void;
    loading: boolean;
}) => (
    <Modal
        visible={visible}
        animationType="slide"
        transparent
        onRequestClose={onClose}
    >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>New Withdrawal</Text>
                        <TouchableOpacity onPress={onClose}>
                            <Feather name='x' size={24} color="#666" />
                        </TouchableOpacity>
                    </View>

                    <ScrollView>
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Amount</Text>
                            <View style={styles.inputWrapper}>
                                <FontAwesome name='rupee' size={20} color="#666" />
                                <TextInput
                                    style={styles.input}
                                    keyboardType="numeric"
                                    placeholder="Enter amount"
                                    value={form.amount}
                                    onChangeText={(text) => setForm({ ...form, amount: text })}
                                />
                            </View>
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Payment Method</Text>
                            <View style={styles.methodButtons}>
                                {['UPI', 'Bank Transfer'].map((method) => (
                                    <TouchableOpacity
                                        key={method}
                                        style={[
                                            styles.methodButton,
                                            form.method === method && styles.methodButtonActive
                                        ]}
                                        onPress={() => setForm({
                                            ...form,
                                            method: method as WithdrawalForm['method'],
                                            isBank: method === 'Bank Transfer',
                                            isUpi: method === 'UPI'
                                        })}
                                    >
                                        {method === 'UPI' ? (
                                            <Feather name='credit-card' size={20} color={form.method === method ? '#fff' : '#666'} />
                                        ) : (
                                            <FontAwesome name='bank' size={20} color={form.method === method ? '#fff' : '#666'} />
                                        )}
                                        <Text style={[
                                            styles.methodButtonText,
                                            form.method === method && styles.methodButtonTextActive
                                        ]}>
                                            {method}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>

                        {form.method === 'UPI' ? (
                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>UPI ID</Text>
                                <View style={styles.inputWrapper}>
                                    <Text>@</Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Enter UPI ID"
                                        value={form.upi_details.upi_id}
                                        onChangeText={(text) => setForm({
                                            ...form,
                                            upi_details: { upi_id: text }
                                        })}
                                    />
                                </View>
                            </View>
                        ) : (
                            <>
                                <View style={styles.inputGroup}>
                                    <Text style={styles.label}>Bank Name</Text>
                                    <View style={styles.inputWrapper}>
                                        <FontAwesome name='bank' size={20} color="#666" />
                                        <TextInput
                                            style={styles.input}
                                            placeholder="Enter bank name"
                                            value={form.BankDetails.bankName}
                                            onChangeText={(text) => setForm({
                                                ...form,
                                                BankDetails: { ...form.BankDetails, bankName: text }
                                            })}
                                        />
                                    </View>
                                </View>

                                <View style={styles.inputGroup}>
                                    <Text style={styles.label}>Account Number</Text>
                                    <View style={styles.inputWrapper}>
                                        <Feather name='credit-card' size={20} color="#666" />
                                        <TextInput
                                            style={styles.input}
                                            placeholder="Enter account number"
                                            keyboardType="numeric"
                                            value={form.BankDetails.accountNo}
                                            onChangeText={(text) => setForm({
                                                ...form,
                                                BankDetails: { ...form.BankDetails, accountNo: text }
                                            })}
                                        />
                                    </View>
                                </View>

                                <View style={styles.inputGroup}>
                                    <Text style={styles.label}>IFSC Code</Text>
                                    <View style={styles.inputWrapper}>
                                        <FontAwesome name='barcode' size={20} color="#666" />
                                        <TextInput
                                            style={styles.input}
                                            placeholder="Enter IFSC code"
                                            autoCapitalize="characters"
                                            value={form.BankDetails.ifsc_code}
                                            onChangeText={(text) => setForm({
                                                ...form,
                                                BankDetails: { ...form.BankDetails, ifsc_code: text }
                                            })}
                                        />
                                    </View>
                                </View>
                            </>
                        )}
                    </ScrollView>

                    <TouchableOpacity
                        style={styles.submitButton}
                        onPress={onSubmit}
                        disabled={loading}
                    >
                        <Text style={styles.submitButtonText}>
                            {loading ? 'Processing...' : 'Submit Withdrawal'}
                        </Text>
                        <Feather name='arrow-right' size={20} color="#fff" />
                    </TouchableOpacity>
                </View>
            </View>
        </TouchableWithoutFeedback>
    </Modal>
);

const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
};

const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
        case 'approved':
            return { bg: '#4CAF5020', text: '#4CAF50' };
        case 'pending':
            return { bg: '#FFA00020', text: '#FFA000' };
        case 'rejected':
            return { bg: '#FF525220', text: '#FF5252' };
        default:
            return { bg: '#66666620', text: '#666666' };
    }
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
    },
    headerBalance: {
        fontSize: 16,
        color: '#666',
        marginTop: 4,
    },
    newButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#2196F3',
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
        gap: 8,
    },
    newButtonText: {
        color: '#fff',
        fontWeight: '600',
    },
    content: {
        flex: 1,
        padding: 16,
    },
    loader: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    empty: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 100,
    },
    emptyText: {
        fontSize: 18,
        color: '#666',
        marginTop: 16,
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
            },
            android: {
                elevation: 4,
            },
        }),
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    methodBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    methodText: {
        fontSize: 16,
        color: '#2196F3',
        fontWeight: '600',
    },
    amount: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
        padding: 8,
        borderRadius: 20,
        gap: 6,
        marginBottom: 16,
    },
    statusText: {
        fontSize: 14,
        fontWeight: '600',
    },
    cardDetails: {
        borderTopWidth: 1,
        borderTopColor: '#eee',
        paddingTop: 16,
        gap: 12,
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    detailLabel: {
        width: 70,
        fontSize: 14,
        color: '#666',
    },
    detailValue: {
        flex: 1,
        fontSize: 14,
        color: '#333',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 20,
        maxHeight: '90%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
    },
    inputGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 16,
        color: '#666',
        marginBottom: 8,
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
        borderRadius: 12,
        paddingHorizontal: 16,
        gap: 12,
    },
    input: {
        flex: 1,
        paddingVertical: 12,
        fontSize: 16,
        color: '#333',
    },
    methodButtons: {
        flexDirection: 'row',
        gap: 12,
    },
    methodButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 12,
        borderRadius: 12,
        backgroundColor: '#f5f5f5',
        gap: 8,
    },
    methodButtonActive: {
        backgroundColor: '#2196F3',
    },
    methodButtonText: {
        fontSize: 14,
        color: '#666',
        fontWeight: '600',
    },
    methodButtonTextActive: {
        color: '#fff',
    },
    submitButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#2196F3',
        padding: 16,
        borderRadius: 12,
        marginTop: 20,
        gap: 8,
    },
    submitButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});