import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { SafeAreaProvider } from "react-native-safe-area-context";

import Onboarding from "./screen/onboarding/Onboarding";
import Home from "./screen/Home/Home";
import Bh_Verification from "./screen/auth/BH_Steps/Bh_Verification";
import RegisterWithBh from "./screen/auth/Register/Bh_registeration";
import BhOtpVerification from "./screen/auth/Register/BhOtpVerification";
import Login from "./screen/auth/login/Login";
import Complete_Profile from "./screen/auth/Profile_Complete/Complete_Profile";

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Onboarding">
          <Stack.Screen
            name="Onboarding"
            options={{ headerShown: false }}
            component={Onboarding}
          />
          <Stack.Screen
            name="Home"
            options={{ headerShown: false }}
            component={Home}
          />

          <Stack.Screen
            name="Register"
            options={{
              headerShown: true,
              title: "Verify Your Referral BH",
              headerTitleStyle: {
                fontSize: 16,
                fontWeight: "bold",
                color: "#000",
              },
            }}
            component={Bh_Verification}
          />

          <Stack.Screen
            name="complete_register_bh"
            options={{
              headerShown: true,
              title: "Register With BH ID",
              headerTitleStyle: {
                fontSize: 16,
                fontWeight: "bold",
                color: "#000",
              },
            }}
            component={RegisterWithBh}
          />
          <Stack.Screen
            name="OtpVerify"
            options={{
              headerShown: true,
              title: "Verify Otp ",
              headerTitleStyle: {
                fontSize: 16,
                fontWeight: "bold",
                color: "#000",
              },
            }}
            component={BhOtpVerification}
          />
          <Stack.Screen
            name="login"
            options={{
              headerShown: true,
              title: "Login To Account",
              headerTitleStyle: {
                fontSize: 16,
                fontWeight: "bold",
                color: "#000",
              },
            }}
            component={Login}
          />
          <Stack.Screen
            name="Complete_Profile"
            options={{
              headerShown: true,
              title: "Complete Your Profile",
              headerTitleStyle: {
                fontSize: 16,
                fontWeight: "bold",
                color: "#000",
              },
            }}
            component={Complete_Profile}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
