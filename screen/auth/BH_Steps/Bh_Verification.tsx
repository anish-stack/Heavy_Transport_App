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
import { API_URL_WEB } from "../../../constant/Api";
import axios from "axios";
import { SafeAreaView } from "react-native-safe-area-context";
import styles from "./Bh_Styles";
import { COLORS } from "../../../constant/Colors";

export default function Bh_Verification() {
  const [bh, setBh] = useState("BH960114");
  const [name, setName] = useState("");
  const [response, setResponse] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();

  const checkBhId = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { data } = await axios.post(`${API_URL_WEB}/api/v1/check-bh-id`, {
        bh,
      });

      if (!data.success) {
        setLoading(false);
        return setError(data.message || "Failed to validate BH ID.");
      }

      setName(data.data);
      setResponse(data);

      setTimeout(() => {
        navigation.navigate("complete_register_bh", { bh_id: bh });
      }, 4500);
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
      <StatusBar barStyle={"light-content"} />

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
          keyboardType={"number-pad"}
          onChangeText={setBh}
          placeholderTextColor={COLORS.darkDark}
        />

        <TouchableOpacity
          activeOpacity={0.9}
          style={styles.button}
          onPress={checkBhId}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#000" />
          ) : (
            <Text style={styles.buttonText}>Verify BH ID</Text>
          )}
        </TouchableOpacity>

        {renderMessage}
      </View>
    </SafeAreaView>
  );
}
