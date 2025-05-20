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
import DateTimePicker from '@react-native-community/datetimepicker';

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
  aadharNumber: string;
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
  aadharNumber?: string;
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
  const [isDatePickerVisible, setDatePickerVisible] = useState<boolean>(false);
  const [date, setDate] = useState<Date>(new Date(new Date().setFullYear(new Date().getFullYear() - 18)));
  const [showDobError, setShowDobError] = useState<boolean>(false);

  // Refs for input fields
  const inputRefs = useRef<Array<TextInput | null>>([]);

  // Initial form data
  const initialFormData: FormData = useMemo(
    () => ({
      name: "",
      email: "",
      reEmail: "",
      number: "",
      password: "",
      category: "676ef9795c75082fcbc59c51", 
      address: {
        area: "",
        street_address: "",
        landmark: "",
        pincode: "",
        location: {
          type: "Point",
          coordinates: [78.2693, 25.369], // Default coordinates
        },
      },
      aadharNumber: '',
      dob: formatDate(new Date(new Date().setFullYear(new Date().getFullYear() - 18))),
      member_id: "",
      referral_code_which_applied: bh_id,
      is_referral_applied: Boolean(bh_id),
    }),
    [bh_id]
  );

  const [formData, setFormData] = useState<FormData>(initialFormData);

  // Function to format date for display
  function formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

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

  // Format Aadhaar number as user types
  const formatAadhar = (text: string): string => {
    // Remove all spaces first
    const cleaned = text.replace(/\s/g, '');
    
    // Add spaces after every 4 characters
    let formatted = '';
    for (let i = 0; i < cleaned.length && i < 12; i++) {
      if (i > 0 && i % 4 === 0) {
        formatted += ' ';
      }
      formatted += cleaned[i];
    }
    
    return formatted;
  };

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

  // Function to validate age
  const validateAge = (selectedDate: Date): boolean => {
    const today = new Date();
    const birthDate = new Date(selectedDate);
    
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age >= 18;
  };

  // Function to handle date change
  const handleDateChange = (event: any, selectedDate?: Date) => {
    setDatePickerVisible(Platform.OS === 'ios');
    
    if (selectedDate) {
      const isValidAge = validateAge(selectedDate);
      
      if (isValidAge) {
        setDate(selectedDate);
        const formattedDate = formatDate(selectedDate);
        setFormData(prev => ({
          ...prev,
          dob: formattedDate
        }));
        
        // Clear error if it exists
        if (errors.dob) {
          setErrors(prev => ({
            ...prev,
            dob: undefined
          }));
        }
        setShowDobError(false);
      } else {
        setShowDobError(true);
        setTimeout(() => setShowDobError(false), 3000);
      }
    }
  };

  // Function to validate a single field
  const validateField = (field: keyof FormData, value: string): string | undefined => {
    const currentDate = new Date();
    
    switch (field) {
      case 'name':
        return !value.trim() ? "Please enter your name." : undefined;
      
      case 'email':
        if (!value.trim()) return "Please provide your email address.";
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return "Please enter a valid email address.";
        return undefined;
      
      case 'reEmail':
        if (!value.trim()) return "Please re-enter your email address.";
        if (value !== formData.email) return "Emails do not match.";
        return undefined;
      
      case 'number':
        if (!value.trim()) return "Please enter your phone number.";
        if (!/^\d{10}$/.test(value)) return "Phone number must be exactly 10 digits.";
        return undefined;
      
      case 'password':
        if (!value.trim()) return "Please create a password.";
        if (value.length < 8) return "Password must be at least 8 characters long.";
        return undefined;
      
      case 'dob':
        if (!value.trim()) return "Please enter your date of birth.";
        const dobDate = new Date(value);
        if (isNaN(dobDate.getTime())) return "Please enter a valid date.";
        
        const age = currentDate.getFullYear() - dobDate.getFullYear();
        const m = currentDate.getMonth() - dobDate.getMonth();
        if (m < 0 || (m === 0 && currentDate.getDate() < dobDate.getDate())) {
          if (age <= 18) return "You must be at least 18 years old.";
        }
        return undefined;
      
      case 'aadharNumber':
        if (!value.trim()) return "Please enter your Aadhaar number.";
        if (!/^\d{4}\s\d{4}\s\d{4}$/.test(value)) return "Please enter a valid 12-digit Aadhaar number.";
        return undefined;
      
      default:
        return undefined;
    }
  };

  // Function to validate form data
  const validateForm = useCallback(() => {
    const newErrors: FormErrors = {};

    // Validate all fields
    Object.entries(formData).forEach(([key, value]) => {
      if (key === 'address' || key === 'category' || key === 'is_referral_applied' || 
          key === 'member_id' || key === 'referral_code_which_applied') {
        return; // Skip these fields or handle separately
      }
      
      const error = validateField(key as keyof FormData, value as string);
      if (error) {
        newErrors[key] = error;
      }
    });

    // Validate address fields
    if (!formData.address.pincode.trim()) {
      newErrors.pincode = "Please enter your pincode.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  // Function to handle form submission
  const handleSubmit = async () => {
    if (!validateForm()) {
      Alert.alert("Form Error", "Please correct the errors in the form before submitting.");
      return;
    }

    setSubmitting(true);
    
    try {
      const response = await axios.post(
        `${API_URL_WEB}/api/v1/register_vendor`,
        formData
      );
  console.error("Registration response.data:", response.data);
      if (response.data?.success) {
        navigation.navigate("OtpVerify", {
          type: response.data.type,
          email: response.data.email,
          expireTime: response.data.time,
          number: response.data.number,
        });
      } else {
        Alert.alert("Registration Error", response.data?.message || "Registration failed");
      }
    } catch (error: any) {
      console.error("Registration error:", error);
      const errorMessage = error.response?.data?.message || "Registration failed. Please try again later.";
      Alert.alert("Registration Error", errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  // Function to handle input changes with real-time validation
  const handleInputChange = useCallback(
    (field: keyof FormData, value: string) => {
      // Format aadhaar number if needed
      if (field === 'aadharNumber') {
        value = formatAadhar(value);
      }
      
      setFormData((prevData) => ({
        ...prevData,
        [field]: value,
      }));

      // Real-time validation
      const error = validateField(field, value);
      
      setErrors(prev => ({
        ...prev,
        [field]: error
      }));
    },
    [formData]
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
        <Text style={styles.loadingText}>Verifying details...</Text>
      </View>
    );
  }

  // Render error state for invalid BH ID
  if (!isBhVerify && bh_id) {
    return (
      <View style={styles.errorContainer}>
        <MaterialIcons name="error-outline" size={48} color="#FF5252" />
        <Text style={styles.errorTitle}>Invalid Referral Code</Text>
        <Text style={styles.errorText}>
          The BH ID "{bh_id}" could not be verified. Please check and try again.
        </Text>
        <TouchableOpacity
          style={styles.errorButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.errorButtonText}>Go Back</Text>
        </TouchableOpacity>
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

            {/* Aadhaar Number Input */}
            <FormInput
              label="Aadhaar Number"
              value={formData.aadharNumber}
              onChangeText={(text) => handleInputChange("aadharNumber", text)}
              error={errors.aadharNumber}
              placeholder="XXXX XXXX XXXX"
              keyboardType="numeric"
              ref={(el) => (inputRefs.current[1] = el)}
              onKeyPress={(e) => handleKeyPress(e, 1)}
              returnKeyType="next"
              blurOnSubmit={false}
              maxLength={14} // 12 digits + 2 spaces
            />

            {/* Date of Birth Input */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Date of Birth (18+ years only)</Text>
              <TouchableOpacity 
                style={[
                  styles.datePickerButton,
                  errors.dob && styles.inputError
                ]}
                onPress={() => setDatePickerVisible(true)}
              >
                <Text style={[
                  styles.datePickerText,
                  !formData.dob && styles.placeholderText
                ]}>
                  {formData.dob || "Select your date of birth"}
                </Text>
                <MaterialIcons name="calendar-today" size={20} color="#555" />
              </TouchableOpacity>
              {errors.dob && <Text style={styles.errorText}>{errors.dob}</Text>}
              {showDobError && (
                <View style={styles.ageErrorContainer}>
                  <Text style={styles.ageErrorText}>
                    You must be at least 18 years old to register
                  </Text>
                </View>
              )}
              
              {isDatePickerVisible && (
                <DateTimePicker
                  value={date}
                  mode="date"
                  display={Platform.OS === "ios" ? "spinner" : "default"}
                  onChange={handleDateChange}
                  maximumDate={new Date(new Date().setFullYear(new Date().getFullYear() - 18))}
                />
              )}
            </View>

            {/* Email Input */}
            <FormInput
              label="Email"
              value={formData.email}
              onChangeText={(text) => handleInputChange("email", text)}
              error={errors.email}
              placeholder="Enter your email"
              keyboardType="email-address"
              ref={(el) => (inputRefs.current[2] = el)}
              onKeyPress={(e) => handleKeyPress(e, 2)}
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
              ref={(el) => (inputRefs.current[3] = el)}
              onKeyPress={(e) => handleKeyPress(e, 3)}
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
              ref={(el) => (inputRefs.current[4] = el)}
              onKeyPress={(e) => handleKeyPress(e, 4)}
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
              ref={(el) => (inputRefs.current[5] = el)}
              onKeyPress={(e) => handleKeyPress(e, 5)}
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
              startIndex={6}
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
              onPress={handleSubmit}
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