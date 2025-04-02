import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import axios from 'axios';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { API_URL_WEB } from '../../../constant/Api';
import { COLORS } from '../../../constant/Colors';

type RootStackParamList = {
    'profile-complete': { BH: string };
    'otp-verification': { type: string; email: string; number: string };
};

type OtpVerificationScreenRouteProp = RouteProp<RootStackParamList, 'otp-verification'>;
type ProfileCompleteScreenNavigationProp = StackNavigationProp<RootStackParamList, 'profile-complete'>;

interface FormData {
    otp: string;
    type: string;
    email: string;
}

const BhOtpVerification: React.FC = () => {
    const navigation = useNavigation<ProfileCompleteScreenNavigationProp>();
    const route = useRoute<OtpVerificationScreenRouteProp>();
    const { type, email, number } = route.params;

    const [formData, setFormData] = useState<FormData>({
        otp: '',
        type: type,
        email: email,
    });
    const [loading, setLoading] = useState<boolean>(false);
    const [timer, setTimer] = useState<number>(0);

    useEffect(() => {
        const interval = setInterval(() => {
            if (timer > 0) setTimer((prev) => prev - 1);
        }, 1000);
        return () => clearInterval(interval);
    }, [timer]);

    const handleChange = useCallback((value: string) => {
        setFormData(prevData => ({ ...prevData, otp: value }));
    }, []);

    const handleSubmit = useCallback(async () => {
        if (!formData.otp || formData.otp.length !== 6) {
            Alert.alert("Error", "Please enter a valid 6-digit OTP");
            return;
        }
        setLoading(true);
        try {
            const response = await axios.post(
                `${API_URL_WEB}/api/v1/verify_email`,
                formData
            );
            Alert.alert("Success", response.data.message || "OTP verified successfully!", [
                { text: "OK", onPress: () => navigation.navigate('login', { BH: response.data.BHID }) }
            ]);
        } catch (error: any) {
            Alert.alert("Error", error.response?.data?.message || "Failed to verify OTP.");
        } finally {
            setLoading(false);
        }
    }, [formData, navigation]);

    const handleResendOtp = useCallback(async () => {
        if (timer > 0) {
            Alert.alert("Please wait", `Resend OTP in ${timer} seconds.`);
            return;
        }
        setLoading(true);
        try {
            const response = await axios.post(
                `${API_URL_WEB}/api/v1/resend_Otp`,
                { email, type }
            );
            Alert.alert("Success", response.data.message || "OTP sent successfully!");
            setTimer(120);
        } catch (error: any) {
            Alert.alert("Error", error.response?.data?.message || "Failed to resend OTP.");
        } finally {
            setLoading(false);
        }
    }, [email, type, timer]);

    const resendText = useMemo(() => {
        return timer > 0 ? `Resend OTP in ${timer}s` : "Didn't receive the OTP? Resend";
    }, [timer]);

    const isResendDisabled = useMemo(() => {
        return timer > 0 || loading;
    }, [timer, loading]);

    const containerStyle = useMemo(() => styles.container, []);
    const cardStyle = useMemo(() => styles.card, []);
    const buttonStyle = useMemo(() => styles.button, []);

    return (
        <View style={containerStyle}>
            <View style={cardStyle}>
                <Text style={styles.title}>Enter OTP</Text>
                <Text style={styles.subtitle}>We have sent a 6-digit OTP to <Text style={styles.bold}>{number}</Text></Text>

                <TextInput
                    style={styles.input}
                    placeholder="Enter OTP"
                    keyboardType="numeric"
                    maxLength={6}
                    value={formData.otp}
                    onChangeText={handleChange}
                />

                <TouchableOpacity
                    style={buttonStyle}
                    onPress={handleSubmit}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.buttonText}>Verify OTP</Text>
                    )}
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={handleResendOtp}
                    disabled={isResendDisabled}
                >
                    <Text style={styles.resendText}>{resendText}</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: COLORS.lightAccent,
        padding: 16,
    },
    card: {
        backgroundColor: COLORS.white,
        padding: 20,
        borderRadius: 10,
        width: '100%',
        maxWidth: 400,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 5,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 10,
    },
    subtitle: {
        textAlign: 'center',
        color: '#555',
        marginBottom: 20,
    },
    bold: {
        fontWeight: 'bold',
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        padding: 10,
        fontSize: 16,
        marginBottom: 20,
    },
    button: {
        backgroundColor: COLORS.dark,
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
        marginBottom: 10,
    },
    buttonText: {
        color: COLORS.white,
        fontSize: 16,
        fontWeight: 'bold',
    },
    resendText: {
        textAlign: 'center',
        color: COLORS.error,
        fontSize: 14,
    },
});

export default BhOtpVerification;