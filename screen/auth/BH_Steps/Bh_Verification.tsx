import {
  View,
  Text,
  StatusBar,
  Image,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import React, { useState, useCallback, useMemo } from "react";
import { useNavigation } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import axios from "axios";

import { API_URL_WEB } from "../../../constant/Api";
import { COLORS } from "../../../constant/Colors";
import styles from "./Bh_Styles";
import useSettings from "../../../hooks/Settings";

export default function BhVerification() {
  // State management
  const [bh, setBh] = useState("BH");
  const [response, setResponse] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [skipping, setSkipping] = useState(false);
  
  const navigation = useNavigation();
  const { settings } = useSettings();

  // Handle BH ID verification
  const checkBhId = useCallback(async () => {
    if (!bh || bh === "BH") {
      setError("Please enter a valid BH ID");
      return;
    }
    
    try {
      setLoading(true);
      setError(null);

      const { data } = await axios.post(`${API_URL_WEB}/api/v1/check-bh-id`, { bh });

      if (!data.success) {
        setError(data.message || "Failed to validate BH ID.");
        return;
      }

      setResponse(data);
      
      // Navigate after successful verification
      setTimeout(() => {
        navigation.navigate("complete_register_bh", { bh_id: bh });
      }, 1000);
    } catch (err) {
      setResponse(null);
      setError(
        err.response?.data?.message ||
        "An unexpected error occurred. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }, [bh, navigation]);

  // Handle skip functionality
  const handleSkip = useCallback(() => {
    console.log('Skip button pressed');
    setSkipping(true);

    // Check if adminBh exists in settings
    if (settings?.adminBh) {
      console.log(`Using admin BH ID from settings: ${settings.adminBh}`);
      setTimeout(() => {
        navigation.navigate('complete_register_bh', { bh_id: settings.adminBh });
        setSkipping(false);
      }, 1000);
    } else {
      console.log('No admin BH ID found in settings');
      setError('No default BH ID available. Please enter a valid BH ID or contact support.');
      setSkipping(false);
    }
  }, [settings, navigation]);

  // Render status message
  const renderMessage = useMemo(() => {
    if (response) {
      return (
        <View style={styles.successBox}>
          <Text style={styles.successText}>
            {response.message || "BH ID verified successfully!"} Redirecting...
          </Text>
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      );
    }

    return null;
  }, [response, error]);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />

      <View style={styles.card}>
        <Image
          source={{
            uri: "https://res.cloudinary.com/dlasn7jtv/image/upload/v1735719280/llocvfzlg1mojxctm7v0.png",
          }}
          style={styles.logo}
        />

        <Text style={styles.title}>Enter Your BH ID</Text>
        <Text style={styles.subtitle}>
          Register at Olyox.com and start earning today!
        </Text>

        <TextInput
          style={styles.input}
          placeholder="Enter your BH ID"
          value={bh}
          keyboardType="number-pad"
          onChangeText={setBh}
          placeholderTextColor={COLORS.darkDark}
        />

        <TouchableOpacity
          activeOpacity={0.9}
          style={styles.button}
          onPress={checkBhId}
          disabled={loading || skipping}
        >
          {loading ? (
            <ActivityIndicator color="#000" />
          ) : (
            <Text style={styles.buttonText}>Verify BH ID</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.9}
          style={styles.skipButton}
          onPress={handleSkip}
          disabled={loading || skipping}
        >
          {skipping ? (
            <ActivityIndicator color="#000" />
          ) : (
            <Text style={styles.skipButtonText}>Skip Verification</Text>
          )}
        </TouchableOpacity>

        {renderMessage}
      </View>
    </SafeAreaView>
  );
}