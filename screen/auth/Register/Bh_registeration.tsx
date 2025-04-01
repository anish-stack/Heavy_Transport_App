import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import {
  View,
  ScrollView,
  TouchableOpacity,
  Text,
  ActivityIndicator,
  Alert,
  Platform,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard
} from "react-native";
import { useRoute, useNavigation, RouteProp } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import axios from "axios";
import { API_URL_WEB } from "../../../constant/Api";
import styles from "./BH_Styles";
import FormInput from "../../../components/FormInput";
import AddressForm from "../../../components/AddressForm";
import { MaterialIcons } from "@expo/vector-icons";

// Define route param types
type RootStackParamList = {
  RegisterWithBh: { bh_id?: string };
  OtpVerify: {
    type: string;
    email: string;
    expireTime: string;
    number: string;
  };
};

type RegisterWithBhRouteProp = RouteProp<RootStackParamList, "RegisterWithBh">;
type OtpVerifyNavigationProp = StackNavigationProp<
  RootStackParamList,
  "OtpVerify"
>;

// Define types for the component state
interface Category {
  _id: string;
  title: string;
}

interface Location {
  type: string;
  coordinates: [number, number];
}

interface Address {
  area: string;
  street_address: string;
  landmark: string;
  pincode: string;
  location: Location;
}

interface FormData {
  name: string;
  email: string;
  reEmail: string;
  number: string;
  password: string;
  category: string;
  address: Address;
  dob: string;
  member_id: string;
  referral_code_which_applied: string | undefined;
  is_referral_applied: boolean;
}

interface FormErrors {
  name?: string;
  email?: string;
  reEmail?: string;
  number?: string;
  password?: string;
  category?: string;
  pincode?: string;
  dob?: string;
  [key: string]: string | undefined;
}

const RegisterWithBh: React.FC = () => {
  const route = useRoute<RegisterWithBhRouteProp>();
  const navigation = useNavigation<OtpVerifyNavigationProp>();
  const { bh_id } = route.params || {};

  // State variables
  const [isBhVerify, setIsBhVerify] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [categories, setCategories] = useState<Category[]>([]);
  const [currentFocus, setCurrentFocus] = useState<number>(0);

  // Refs for input fields
  const inputRefs = useRef<Array<TextInput | null>>([]);

  // Initial form data
  const initialFormData: FormData = useMemo(
    () => ({
      name: "Anish Jha",
      email: "anishjha123456@gmail.com",
      reEmail: "anishjha123456@gmail.com",
      number: "9632589632",
      password: "Mahakaal@21",
      category: "676ef9795c75082fcbc59c51", // Default category
      address: {
        area: "Rohini",
        street_address: "",
        landmark: "Shiva",
        pincode: "110085",
        location: {
          type: "Point",
          coordinates: [78.2693, 25.369], // Default coordinates
        },
      },
      dob: "",
      member_id: "",
      referral_code_which_applied: bh_id,
      is_referral_applied: Boolean(bh_id),
    }),
    [bh_id]
  );

  const [formData, setFormData] = useState<FormData>(initialFormData);

  // Function to check BH ID validity
  const checkBhId = useCallback(async () => {
    if (!bh_id) {
      setIsBhVerify(true);
      setLoading(false);
      return;
    }

    try {
      const { data } = await axios.post(`${API_URL_WEB}/api/v1/check-bh-id`, {
        bh: bh_id,
      });
      setIsBhVerify(data.success);
      if (!data.success) {
        Alert.alert("Error", "Invalid BH ID. Please check and try again.");
      }
      setLoading(false);
    } catch (err) {
      console.error(err);
      setIsBhVerify(false);
      setLoading(false);
      Alert.alert("Error", "Failed to verify BH ID. Please try again later.");
    }
  }, [bh_id]);



  // Initialize data on component mount
  useEffect(() => {
    const initializeData = async () => {
      setLoading(true);
      await Promise.all([checkBhId()]);
    };

    initializeData();
  }, [checkBhId]);

  // Set up autofocus for the first input field
  useEffect(() => {
    const timer = setTimeout(() => {
      if (inputRefs.current[0]) {
        inputRefs.current[0].focus();
      }
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  // Function to handle key press events for navigation between fields
  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Enter' && inputRefs.current[index + 1]) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  // Function to format date for display
  const formatDate = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Function to validate form data
  const validateForm = useCallback(() => {
    const newErrors: FormErrors = {};
    const currentDate = new Date();
    const dobDate = new Date(formData.dob);

    if (!formData.name.trim()) newErrors.name = "Please enter your name.";
    if (!formData.dob.trim()) {
      newErrors.dob = "Please enter your date of birth.";
    } else if (isNaN(dobDate.getTime())) {
      newErrors.dob = "Please enter a valid date in YYYY-MM-DD format.";
    } else {
      const age = currentDate.getFullYear() - dobDate.getFullYear();
      if (age < 18) newErrors.dob = "You must be at least 18 years old.";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Please provide your email address.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address.";
    }

    if (!formData.reEmail.trim()) {
      newErrors.reEmail = "Please re-enter your email address.";
    } else if (formData.email !== formData.reEmail) {
      newErrors.reEmail = "Emails do not match.";
    }

    if (!formData.number.trim()) {
      newErrors.number = "Please enter your phone number.";
    } else if (!/^\d{10}$/.test(formData.number)) {
      newErrors.number = "Phone number must be exactly 10 digits.";
    }

    if (!formData.password.trim()) {
      newErrors.password = "Please create a password.";
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters long.";
    }

    if (!formData.category) newErrors.category = "Please select a category.";
    if (!formData.address.pincode.trim())
      newErrors.pincode = "Please enter your pincode.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  // Function to handle form submission
  const handleSubmit = async () => {
    console.log("!validateForm()!", !validateForm());
    // if (!validateForm()) return;
    setSubmitting(true);
    console.log("Submit Done!");
    try {
      const response = await axios.post(
        `${API_URL_WEB}/api/v1/register_vendor`,
        formData
      );
      console.log(response.data?.success)

      if (response.data?.success) {
        navigation.navigate("OtpVerify", {
          type: response.data.type,
          email: response.data.email,
          expireTime: response.data.time,
          number: response.data.number,
        });
      }
    } catch (error: any) {
      console.error(error);
      const errorMessage =
        error.response?.data?.message || "Registration failed";
      Alert.alert("Registration Error", errorMessage);
    } finally {
      setSubmitting(false);
    }
  }

  // Function to handle input changes
  const handleInputChange = useCallback(
    (field: keyof FormData, value: string) => {
      setFormData((prevData) => ({
        ...prevData,
        [field]: value,
      }));

      // Clear error when user types
      if (errors[field]) {
        setErrors(prev => ({
          ...prev,
          [field]: undefined
        }));
      }
    },
    [errors]
  );

  // Function to handle address changes
  const handleAddressChange = useCallback(
    (field: keyof Address, value: any) => {
      setFormData((prevData) => ({
        ...prevData,
        address: {
          ...prevData.address,
          [field]: value,
        },
      }));

      // Clear error when user types
      if (field === 'pincode' && errors.pincode) {
        setErrors(prev => ({
          ...prev,
          pincode: undefined
        }));
      }
    },
    [errors]
  );


  // Computed properties
  const isButtonDisabled = useMemo(() => {
    return submitting || !isBhVerify;
  }, [submitting, isBhVerify]);

  const buttonStyles = useMemo(
    () => [styles.button, isButtonDisabled && styles.buttonDisabled],
    [isButtonDisabled]
  );

  const buttonText = useMemo(
    () => (submitting ? "Registering..." : "Register"),
    [submitting]
  );

  // Render loading state
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text>Loading...</Text>
      </View>
    );
  }

  // Render error state for invalid BH ID
  if (!isBhVerify && bh_id) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.errorText}>
          Invalid BH ID. Please check and try again.
        </Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
          <View style={styles.formContainer}>
            <Text style={styles.formTitle}>Register Your Account</Text>

            {/* Name Input */}
            <FormInput
              label="Name (as per Aadhaar Card)"
              value={formData.name}
              onChangeText={(text) => handleInputChange("name", text)}
              error={errors.name}
              placeholder="Enter your name"
              ref={(el) => (inputRefs.current[0] = el)}
              onKeyPress={(e) => handleKeyPress(e, 0)}
              returnKeyType="next"
              blurOnSubmit={false}
            />



            {/* Email Input */}
            <FormInput
              label="Email"
              value={formData.email}
              onChangeText={(text) => handleInputChange("email", text)}
              error={errors.email}
              placeholder="Enter your email"
              keyboardType="email-address"
              ref={(el) => (inputRefs.current[1] = el)}
              onKeyPress={(e) => handleKeyPress(e, 1)}
              returnKeyType="next"
              blurOnSubmit={false}
              autoCapitalize="none"
            />

            {/* Re-enter Email Input */}
            <FormInput
              label="Re-enter Email"
              value={formData.reEmail}
              onChangeText={(text) => handleInputChange("reEmail", text)}
              error={errors.reEmail}
              placeholder="Re-enter your email"
              keyboardType="email-address"
              ref={(el) => (inputRefs.current[2] = el)}
              onKeyPress={(e) => handleKeyPress(e, 2)}
              returnKeyType="next"
              blurOnSubmit={false}
              autoCapitalize="none"
            />

            {/* Phone Number Input */}
            <FormInput
              label="Phone Number"
              value={formData.number}
              onChangeText={(text) => handleInputChange("number", text)}
              error={errors.number}
              placeholder="Enter your phone number"
              keyboardType="phone-pad"
              ref={(el) => (inputRefs.current[3] = el)}
              onKeyPress={(e) => handleKeyPress(e, 3)}
              returnKeyType="next"
              blurOnSubmit={false}
              maxLength={10}
            />

            {/* Password Input */}
            <FormInput
              label="Password"
              value={formData.password}
              onChangeText={(text) => handleInputChange("password", text)}
              error={errors.password}
              placeholder="Create a password"
              secureTextEntry
              ref={(el) => (inputRefs.current[4] = el)}
              onKeyPress={(e) => handleKeyPress(e, 4)}
              returnKeyType="next"
              blurOnSubmit={false}
            />



            {/* Address Form */}
            <View style={styles.sectionDivider}>
              <Text style={styles.sectionTitle}>Address Information</Text>
            </View>

            <AddressForm
              address={formData.address}
              onAddressChange={handleAddressChange}
              errors={errors}
              inputRefs={inputRefs}
              startIndex={5}
            />

            {/* Referral Information */}
            {bh_id && (
              <View style={styles.referralContainer}>
                <Text style={styles.referralTitle}>Referral Information</Text>
                <View style={styles.referralContent}>
                  <MaterialIcons name="person-add" size={20} color="#4CAF50" />
                  <Text style={styles.referralText}>
                    You're being referred with code: <Text style={styles.referralCode}>{bh_id}</Text>
                  </Text>
                </View>
              </View>
            )}

            {/* Submit Button */}
            <TouchableOpacity
              style={buttonStyles}
              onPress={() => handleSubmit()}
              disabled={isButtonDisabled}
            >
              {submitting ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.buttonText}>{buttonText}</Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

export default RegisterWithBh;
