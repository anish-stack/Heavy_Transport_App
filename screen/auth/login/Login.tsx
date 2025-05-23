
import { View, Text, Image, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from "react-native"
import { useEffect, useState } from "react"
import { API_URL_APP_LOCAL } from "../../../constant/Api"
import axios from "axios"
import FormInput from "../../../components/FormInput"
import styles from "./LoginStyle"
import { useNavigation, useRoute } from "@react-navigation/native"
import { useAuth } from "../../../context/AuthContext"


export default function Login() {
    const route = useRoute()
    const { BH } = route.params || {}

    const [otpType, setOtpType] = useState('text')
    const [bhId, setBhId] = useState("BH")
    const [loading, setLoading] = useState<boolean>(false)
    const [error, setError] = useState<string>("")
    const [otp, setOtp] = useState<string>("")
    const { setToken } = useAuth()
    const [isOtpSent, setIsOtpSent] = useState<boolean>(false)
    const [loginSuccess, setLoginSuccess] = useState<boolean>(false)
    const navigation = useNavigation()

    useEffect(() => {
        if (BH) {
            setBhId(BH)

        }

    }, [BH])

   const handleLogin = async () => {
  if (bhId.trim().toUpperCase() === "BH" || bhId.trim() === "") {
    setError("Please enter a valid BH ID");
    return;
  }

  try {
    setLoading(true);
    setError("");

    const response = await axios.post(`${API_URL_APP_LOCAL}/heavy/heavy-vehicle-login`, {
      Bh_Id: bhId,
      msgType: otpType,
    });

    if (response.data && response.data.success) {
      setIsOtpSent(true);
      Alert.alert("Success", "OTP has been sent to your registered mobile number");
    } else {
      setError(response.data?.message || "Failed to send OTP. Please try again.");
    }
  } catch (error) {
    // Safe access to error response
    const errResp = error?.response?.data;
    if (errResp?.error === "Provider not founded by BH Id on website Please Register First !!") {
      const data = errResp?.information || {};
      navigation.navigate("Register");
      setError(errResp?.message || "Failed to login. Please try again.");
    } else {
      // In case errResp is undefined, pass empty object
      const data = errResp?.information || {};
      navigation.navigate("Complete_Profile", { data: { ...data, bhId } });
      setError(errResp?.message || "Failed to login. Please try again.");
    }
    console.log(error.response || error);
  } finally {
    setLoading(false);
  }
};


    const handleVerifyLogin = async () => {
        if (!otp || otp.trim() === "") {
            setError("Please enter the OTP")
            return
        }

        try {
            setLoading(true)
            setError("")
            const response = await axios.post(`${API_URL_APP_LOCAL}/heavy/heavy-vehicle-verify-otp`, {
                Bh_Id: bhId,
                otp: Number.parseInt(otp),
            })

            // console.log(response.data.success)
            // console.log(response.data.token)
            // console.log(response.data)
            if (response.data && response.data.success) {
                console.log(response.data.token)
                setLoginSuccess(true)
                const { token } = response.data || {}
                setToken(token)
                Alert.alert("Success", "Login successful!")
                setTimeout(() => {
                    navigation.reset({
                        index: 0,
                        routes: [{ name: 'Home' }],
                    });
                }, 1500);
            } else {
                setError(response.data?.message || "Invalid OTP. Please try again.")
            }
        } catch (error: any) {
            console.error(error?.response?.status)
            setError(error.response?.data?.message || "Failed to verify OTP. Please try again.")
        } finally {
            setLoading(false)
        }
    }


    const handleResendOtp = async () => {
        try {
            setLoading(true)
            setError("")
            const response = await axios.post(`${API_URL_APP_LOCAL}/heavy/heavy-vehicle-resend-otp`, { Bh_Id: bhId })

            if (response.data && response.data.success) {
                Alert.alert("Success", "OTP has been resent to your registered mobile number")
            } else {
                setError(response.data?.message || "Failed to resend OTP. Please try again.")
            }
        } catch (error: any) {
            console.error(error)
            setError(error.response?.data?.message || "Failed to resend OTP. Please try again.")
        } finally {
            setLoading(false)
        }
    }

    const renderLoginForm = () => (
        <View style={styles.formContainer}>

            {/* OTP Type Buttons Row */}
            <View style={{

                marginBottom: 20,
                flexDirection: 'row',
                justifyContent: 'space-between',
                gap: 10,
            }}>
                <TouchableOpacity
                    onPress={() => setOtpType('text')}
                    style={{
                        flex: 1,
                        padding: 5,
                        borderRadius: 8,
                        borderWidth: 1,
                        borderColor: otpType === 'text' ? '#0d6efd' : '#ccc',
                        backgroundColor: otpType === 'text' ? '#0d6efd' : '#fff',
                        alignItems: 'center',
                    }}
                >
                    <Text style={{
                        color: otpType === 'text' ? '#fff' : '#333',
                        fontWeight: otpType === 'text' ? 'bold' : 'normal'
                    }}>
                        Text Message
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={() => setOtpType('whatsapp')}
                    style={{
                        flex: 1,
                        padding: 5,
                        borderRadius: 8,
                        borderWidth: 1,
                        borderColor: otpType === 'whatsapp' ? '#0d6efd' : '#ccc',
                        backgroundColor: otpType === 'whatsapp' ? '#0d6efd' : '#fff',
                        alignItems: 'center',
                    }}
                >
                    <Text style={{
                        color: otpType === 'whatsapp' ? '#fff' : '#333',
                        fontWeight: otpType === 'whatsapp' ? 'bold' : 'normal'
                    }}>
                        WhatsApp Message
                    </Text>
                </TouchableOpacity>
            </View>

            {/* BH ID Input */}
            <FormInput
                label="Enter Your BH ID"
                value={bhId}
                onChangeText={setBhId}
                placeholder="Enter your BH ID"
                keyboardType="numeric"
            />

            {/* Send OTP Button */}
            <TouchableOpacity
                style={[styles.button, loading && styles.disabledButton]}
                onPress={handleLogin}
                disabled={loading}
            >
                {loading ? (
                    <ActivityIndicator color={styles.buttonText.color} />
                ) : (
                    <Text style={styles.buttonText}>Send OTP</Text>
                )}
            </TouchableOpacity>
        </View>
    );


    const renderOtpForm = () => (
        <View style={styles.formContainer}>
            <FormInput
                label="Enter OTP"
                value={otp}
                onChangeText={(text) => setOtp(text)}
                placeholder="Enter the OTP sent to your mobile"
                keyboardType={"numeric"}

            />
            <TouchableOpacity
                style={[styles.button, loading && styles.disabledButton]}
                onPress={handleVerifyLogin}
                disabled={loading}
            >
                {loading ? (
                    <ActivityIndicator color={styles.buttonText.color} />
                ) : (
                    <Text style={styles.buttonText}>Verify OTP</Text>
                )}
            </TouchableOpacity>

            <TouchableOpacity style={styles.resendButton} onPress={handleResendOtp} disabled={loading}>
                <Text style={styles.resendText}>Resend OTP</Text>
            </TouchableOpacity>
        </View>
    )

    const renderSuccessView = () => (
        <View style={styles.successContainer}>
            {/* <Image
        style={styles.successImage}
        source={require("../../../assets/Login/success.jpg")}
        defaultSource={require("../../../assets/Login/login.jpg")}
      /> */}
            <Text style={styles.successText}>Login Successful!</Text>
            <Text style={styles.successSubText}>Welcome back to the application</Text>
        </View>
    )

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <View style={styles.imageContainer}>
                <Image style={styles.headerImage} source={require("../../../assets/Login/login.jpg")} resizeMode="cover" />
            </View>

            <View style={styles.contentContainer}>
                <Text style={styles.title}>Login</Text>

                {error ? (
                    <View style={styles.errorContainer}>
                        <Text style={styles.errorText}>{error}</Text>
                    </View>
                ) : null}

                {loginSuccess ? renderSuccessView() : isOtpSent ? renderOtpForm() : renderLoginForm()}
            </View>
        </ScrollView>
    )
}

