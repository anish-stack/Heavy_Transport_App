import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { SafeAreaProvider } from "react-native-safe-area-context";

import Onboarding from "./screen/onboarding/Onboarding";
import Home from "./screen/Home/Home";
import Bh_Verification from "./screen/auth/BH_Steps/Bh_Verification";
import RegisterWithBh from "./screen/auth/Register/Bh_registeration";

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
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
