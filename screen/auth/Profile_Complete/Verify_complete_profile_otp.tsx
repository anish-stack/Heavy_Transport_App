import React, { useState } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    Image,
    Alert,
    StyleSheet,
    ActivityIndicator
} from "react-native";
import { useRoute } from "@react-navigation/native";
import { resendOtpPartner, VerifyOtpOfPartner } from "../../../utils/Api_Fetchings";
import { useAuth } from "../../../context/AuthContext";

export default function VerifyCompleteProfileOtp() {
    const route = useRoute();
    const { phone_number } = route.params || {};
    const [otp, setOtp] = useState<string>("");
    const { setToken, token } = useAuth()
    const [loading, setLoading] = useState<boolean>(false);

    const handleVerifyOtp = async () => {
        if (!otp) {
            Alert.alert("Error", "Please enter the OTP");
            return;
        }

        setLoading(true);
        try {
            const response = await VerifyOtpOfPartner({ phone_number, otp: parseInt(otp) });
            if (response.success) {
                Alert.alert("Success", "OTP verified successfully!");

                setToken(response.token);
            } else {
                throw new Error(response.message);
            }
        } catch (error: any) {
            Alert.alert("Error", error.message || "Failed to verify OTP.");
        } finally {
            setLoading(false);
        }
    };

    console.log("Save", token)

    const handleResendOtp = async () => {
        try {
            const response = await resendOtpPartner({ phone_number });
            Alert.alert("Success", response.message || "OTP resent successfully!");
        } catch (error: any) {
            Alert.alert("Error", error.message || "Failed to resend OTP.");
        }
    };

    return (
        <View style={styles.container}>
            <Image
                source={{ uri: "https://img.freepik.com/free-vector/two-factor-authentication-concept-illustration_114360-5280.jpg?t=st=1743591810~exp=1743595410~hmac=569667e932d25b9cdd87c540add206f4c4b2687c0f94fcf11e75376978c6e691&w=740" }}
                style={styles.backgroundImage}
            />
            <View style={styles.card}>
                <Text style={styles.title}>OTP Verification</Text>
                <Text style={styles.subtitle}>
                    Enter the OTP sent to <Text style={styles.phone}>{phone_number}</Text>
                </Text>
                <TextInput
                    placeholder="Enter OTP"
                    keyboardType="numeric"
                    value={otp}
                    onChangeText={setOtp}
                    maxLength={6}
                    style={styles.input}
                />
                <TouchableOpacity
                    onPress={handleVerifyOtp}
                    style={styles.button}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator size="small" color="#ffffff" />
                    ) : (
                        <Text style={styles.buttonText}>Verify OTP</Text>
                    )}
                </TouchableOpacity>
                <TouchableOpacity onPress={handleResendOtp}>
                    <Text style={styles.resendText}>Resend OTP</Text>
                </TouchableOpacity>

            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#f0f0f0",
        padding: 20,
    },
    backgroundImage: {
        position: "absolute",
        width: "100%",
        height: "100%",
        opacity: 0.2,
    },
    card: {
        backgroundColor: "#ffffff",
        padding: 24,
        borderRadius: 16,
        width: "90%",
        maxWidth: 400,
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 8,
    },
    title: {
        fontSize: 24,
        fontWeight: "bold",
        color: "#333",
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: "#555",
        textAlign: "center",
        marginBottom: 16,
    },
    phone: {
        fontWeight: "bold",
        color: "#007bff",
    },
    input: {
        width: "100%",
        padding: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: "#ccc",
        marginBottom: 16,
        fontSize: 18,
        textAlign: "center",
        backgroundColor: "#f9f9f9",
    },
    button: {
        backgroundColor: "#007bff",
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 8,
        marginBottom: 12,
        width: "100%",
        alignItems: "center",
    },
    buttonText: {
        color: "#fff",
        fontSize: 18,
        fontWeight: "bold",
    },
    resendText: {
        fontSize: 16,
        color: "#007bff",
        marginTop: 8,
    },
    details: {
        fontSize: 14,
        color: "#666",
        textAlign: "center",
        marginTop: 12,
    },
});
