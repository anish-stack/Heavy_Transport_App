import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Pressable,
  TextInput,
  Image,
} from "react-native";

import {
  User,
  Phone,
  Mail,
  Clock,
  ChevronLeft,
  Check,
  CircleAlert as AlertCircle,
} from "lucide-react-native";

import axios from "axios";
import { useAuth } from "../../../context/AuthContext";
import { useNavigation } from "@react-navigation/native";
import FormInput from "../../../components/FormInput";
import { API_URL_APP_LOCAL } from "../../../constant/Api";

interface FormData {
  name: string;
  email: string;
  phone_number: string;
  call_timing: {
    start_time: string;
    end_time: string;
  };
}

interface FormErrors {
  name?: string;
  email?: string;
  phone_number?: string;
  call_timing?: string;
}

export default function EditProfile() {
  const { user, token, getToken } = useAuth();
  const router = useNavigation();
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    phone_number: "",
    call_timing: {
      start_time: "09:00",
      end_time: "17:00",
    },
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [generalError, setGeneralError] = useState("");

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        phone_number: user.phone_number || "",
        call_timing: {
          start_time: user.call_timing?.start_time || "09:00",
          end_time: user.call_timing?.end_time || "17:00",
        },
      });
    }
  }, [user]);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }

    if (!formData.phone_number.trim()) {
      newErrors.phone_number = "Phone number is required";
    } else if (!/^\+?[\d\s-]{10,}$/.test(formData.phone_number)) {
      newErrors.phone_number = "Invalid phone number";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleUpdateProfile = async () => {
    // console.log("I am ");
    if (!validateForm()) return;

    setLoading(true);
    setGeneralError("");
    setSuccess(false);

    try {
      const response = await axios.put(
        `${API_URL_APP_LOCAL}/heavy/heavy-vehicle-profile-update/${user?._id}`,
        formData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      getToken();
      if (response.data.success) {
        // Show success for 2 seconds then navigate back
        setTimeout(() => {
          setSuccess(true);
          router.goBack();
        }, 2000);
      }
    } catch (error) {
      console.log(error);
      setGeneralError(
        error.response?.data?.message ||
          "An error occurred while updating your profile"
      );
    } finally {
      setLoading(false);
    }
  };
  const handleInputChange = useCallback(
    (field: keyof FormData, value: string) => {
      setFormData((prevData) => ({
        ...prevData,
        [field]: value,
      }));

      // Clear error when user types
      if (errors[field]) {
        setErrors((prev) => ({
          ...prev,
          [field]: undefined,
        }));
      }
    },
    [errors]
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => router.goBack()}>
          <ChevronLeft size={24} color="#1E293B" />
        </Pressable>
        <Text style={styles.headerTitle}>Edit Profile</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
      >
        {/* Profile Image Section */}
        <View style={styles.imageSection}>
          <Image
            source={{
              uri:
                user?.profileImageUrl ||
                "https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=400&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
            }}
            style={styles.profileImage}
          />
          <Pressable style={styles.changePhotoButton}>
            <Text style={styles.changePhotoText}>Change Photo</Text>
          </Pressable>
        </View>

        {/* Form */}
        <View style={styles.form}>
          <FormInput
            icon={<User size={20} color="#64748B" />}
            placeholder="Full Name"
            value={formData.name}
            onChangeText={(text) => handleInputChange("name", text)}
            error={errors.name}
          />

          <FormInput
            icon={<Mail size={20} color="#64748B" />}
            placeholder="Email Address"
            value={formData.email}
            onChangeText={(text) => setFormData({ ...formData, email: text })}
            error={errors.email}
            keyboardType="email-address"
          />

          <FormInput
            icon={<Phone size={20} color="#64748B" />}
            placeholder="Phone Number"
            value={formData.phone_number}
            onChangeText={(text) =>
              setFormData({ ...formData, phone_number: text })
            }
            error={errors.phone_number}
            keyboardType="phone-pad"
          />

          {/* Call Timing Section */}
          <View style={styles.timingSection}>
            <View style={styles.timingHeader}>
              <Clock size={20} color="#64748B" />
              <Text style={styles.timingTitle}>Available Hours</Text>
            </View>
            <View style={styles.timingInputs}>
              <TextInput
                style={styles.timeInput}
                value={formData.call_timing.start_time}
                onChangeText={(text) =>
                  setFormData({
                    ...formData,
                    call_timing: { ...formData.call_timing, start_time: text },
                  })
                }
                placeholder="09:00"
              />
              <Text style={styles.timingSeparator}>to</Text>
              <TextInput
                style={styles.timeInput}
                value={formData.call_timing.end_time}
                onChangeText={(text) =>
                  setFormData({
                    ...formData,
                    call_timing: { ...formData.call_timing, end_time: text },
                  })
                }
                placeholder="17:00"
              />
            </View>
          </View>
        </View>

        {/* Error Message */}
        {generalError && (
          <View style={styles.generalError}>
            <AlertCircle size={20} color="#EF4444" />
            <Text style={styles.generalErrorText}>{generalError}</Text>
          </View>
        )}

        {/* Success Message */}
        {success && (
          <View style={styles.success}>
            <Check size={20} color="#10B981" />
            <Text style={styles.successText}>
              Profile updated successfully!
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Save Button */}
      <View style={styles.footer}>
        <Pressable
          style={[styles.saveButton, loading && styles.saveButtonDisabled]}
          onPress={handleUpdateProfile}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.saveButtonText}>Save Changes</Text>
          )}
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1E293B",
  },
  headerRight: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 24,
  },
  imageSection: {
    alignItems: "center",
    marginBottom: 32,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 16,
  },
  changePhotoButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "#F1F5F9",
    borderRadius: 20,
  },
  changePhotoText: {
    color: "#0EA5E9",
    fontSize: 14,
    fontWeight: "500",
  },
  form: {
    gap: 20,
  },
  inputContainer: {
    gap: 4,
  },
  input: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    paddingHorizontal: 16,
    height: 48,
  },
  inputError: {
    borderColor: "#EF4444",
  },
  inputIcon: {
    marginRight: 12,
  },
  inputField: {
    flex: 1,
    fontSize: 16,
    color: "#1E293B",
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginLeft: 4,
  },
  errorText: {
    fontSize: 12,
    color: "#EF4444",
  },
  timingSection: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  timingHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  timingTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: "#1E293B",
  },
  timingInputs: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  timeInput: {
    flex: 1,
    backgroundColor: "#F8FAFC",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 16,
    color: "#1E293B",
  },
  timingSeparator: {
    fontSize: 16,
    color: "#64748B",
  },
  generalError: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#FEF2F2",
    padding: 16,
    borderRadius: 12,
    marginTop: 24,
  },
  generalErrorText: {
    flex: 1,
    color: "#EF4444",
    fontSize: 14,
  },
  success: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#ECFDF5",
    padding: 16,
    borderRadius: 12,
    marginTop: 24,
  },
  successText: {
    flex: 1,
    color: "#10B981",
    fontSize: 14,
  },
  footer: {
    padding: 24,
    backgroundColor: "white",
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
  },
  saveButton: {
    backgroundColor: "#0EA5E9",
    borderRadius: 12,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
  },
  saveButtonDisabled: {
    opacity: 0.7,
  },
  saveButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
});
