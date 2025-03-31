import { View, Text, StatusBar, Image, TouchableOpacity } from "react-native";
import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import styles from "./onboarding";
import { useNavigation } from "@react-navigation/native";
export default function Onboarding() {
  const navigation = useNavigation();
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle={"light-content"} />

      <View style={styles.imageContainer}>
        <Image
          source={require("../../assets/onboarding/truck_image.webp")}
          style={styles.image}
          resizeMode="cover"
        />
      </View>

      <View style={styles.textContainer}>
        <Text style={styles.title}>
          Welcome to Olyox Heavy Vehicles Partner
        </Text>
        <Text style={styles.description}>
          Join us to manage and grow your business with Olyox Heavy Vehicles.
        </Text>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          onPress={() => navigation.navigate("login")}
          activeOpacity={0.9}
          style={styles.button}
        >
          <Text style={styles.buttonText}>Login</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => navigation.navigate("Register")}
          activeOpacity={0.9}
          style={styles.button}
        >
          <Text style={styles.buttonText}>Register</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
