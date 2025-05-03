import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Pressable,
  Image,
  Platform,
  Modal,
  TouchableOpacity,
} from "react-native";
import { 
  FontAwesome5, 
  MaterialIcons, 
  Feather,
  AntDesign 
} from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as ImagePicker from 'expo-image-picker';
import axios from "axios";
import { useAuth } from "../../../context/AuthContext";
import { useNavigation } from "@react-navigation/native";
import FormInput from "../../../components/FormInput";
import { API_URL_APP_LOCAL } from "../../../constant/Api";

/**
 * Interface for form data
 */
interface FormData {
  name: string;
  email: string;
  phone_number: string;
  call_timing: {
    start_time: string;
    end_time: string;
  };
}

/**
 * Interface for form validation errors
 */
interface FormErrors {
  name?: string;
  email?: string;
  phone_number?: string;
  call_timing?: string;
  image?: string;
}

/**
 * Interface for time picker props
 */
interface TimePickerProps {
  label: string;
  value: string;
  onChange: (time: string) => void;
}

/**
 * Interface for image data
 */
interface ImageData {
  uri: string;
  type?: string;
  name?: string;
  base64?: string;
}

export default function EditProfile() {
  const { user, token, getToken } = useAuth();
  const navigation = useNavigation();
  
  // Form state
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    phone_number: "",
    call_timing: {
      start_time: "09:00",
      end_time: "17:00",
    },
  });

  // UI state
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [generalError, setGeneralError] = useState("");
  
  // Time picker state
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);
  
  // Image picker state
  const [imageData, setImageData] = useState<ImageData | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageUploading, setImageUploading] = useState(false);
  const [showImagePreview, setShowImagePreview] = useState(false);

  // Initialize form data with user data
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

      if (user.profileImageUrl) {
        setImagePreview(user.profile_image);
      }
    }
  }, [user]);

  // Form validation
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};


    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Image picker function
  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      setErrors({...errors, image: 'Permission to access gallery was denied'});
      return;
    }

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
        base64: true,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        const asset = result.assets[0];
        setImageData({
          uri: asset.uri,
          type: 'image/jpeg',
          name: `profile-${Date.now()}.jpg`,
          base64: asset.base64 || undefined,
        });
        setImagePreview(asset.uri);
        setErrors({...errors, image: undefined});
      }
    } catch (error) {
      console.error('Error picking image:', error);
      setErrors({...errors, image: 'Failed to select image'});
    }
  };

  // Handle profile update
  const handleUpdateProfile = async () => {
    if (!validateForm()) return;

    setLoading(true);
    setGeneralError("");
    setSuccess(false);

    try {
      // Create FormData for multipart request
      const formDataForUpload = new FormData();
      formDataForUpload.append('name', formData.name);
      formDataForUpload.append('email', formData.email);
      formDataForUpload.append('phone_number', formData.phone_number);
      formDataForUpload.append('call_timing[start_time]', formData.call_timing.start_time);
      formDataForUpload.append('call_timing[end_time]', formData.call_timing.end_time);

      // Add image if selected
      if (imageData) {
        formDataForUpload.append('profileImage', {
          uri: imageData.uri,
          type: imageData.type || 'image/jpeg',
          name: imageData.name || 'profile.jpg',
        } as any);
      }

      const response = await axios.put(
        `${API_URL_APP_LOCAL}/heavy/heavy-vehicle-profile-update/${user?._id}`,
        imageData ? formDataForUpload : formData,
        {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': imageData ? 'multipart/form-data' : 'application/json',
          },
        }
      );
      
      await getToken();
      
      if (response.data.success) {
        setSuccess(true);
        setTimeout(() => {
          navigation.goBack();
        }, 1500);
      }
    } catch (error: any) {
      console.error('Update profile error:', error);
      setGeneralError(
        error.response?.data?.message ||
        "An error occurred while updating your profile"
      );
    } finally {
      setLoading(false);
    }
  };

  // Time change handlers
  const handleTimeChange = (field: 'start_time' | 'end_time', event: any, selectedTime?: Date) => {
    if (field === 'start_time') {
      setShowStartTimePicker(Platform.OS === 'ios');
    } else {
      setShowEndTimePicker(Platform.OS === 'ios');
    }
    
    if (selectedTime) {
      const hours = selectedTime.getHours().toString().padStart(2, '0');
      const minutes = selectedTime.getMinutes().toString().padStart(2, '0');
      const timeString = `${hours}:${minutes}`;
      
      setFormData(prev => ({
        ...prev,
        call_timing: {
          ...prev.call_timing,
          [field]: timeString
        }
      }));

      // Clear error when time is changed
      if (errors.call_timing) {
        setErrors(prev => ({
          ...prev,
          call_timing: undefined
        }));
      }
    }
  };

  // Time picker component
  const TimePicker = ({ label, value, onChange }: TimePickerProps) => {
    const [show, setShow] = useState(false);
    
    const handlePress = () => {
      setShow(true);
    };
    
    const handleChange = (event: any, selectedDate?: Date) => {
      setShow(Platform.OS === 'ios');
      
      if (selectedDate) {
        const hours = selectedDate.getHours().toString().padStart(2, '0');
        const minutes = selectedDate.getMinutes().toString().padStart(2, '0');
        const timeString = `${hours}:${minutes}`;
        onChange(timeString);
      }
    };
    
    // Convert string time to Date object
    const getTimeAsDate = () => {
      const [hours, minutes] = value.split(':').map(Number);
      const date = new Date();
      date.setHours(hours);
      date.setMinutes(minutes);
      return date;
    };
    
    return (
      <View>
        <Text style={styles.timeLabel}>{label}</Text>
        <Pressable 
          style={styles.timePicker}
          onPress={handlePress}
        >
          <Text style={styles.timeText}>{value}</Text>
          <Feather name="clock" size={18} color="#64748B" />
        </Pressable>
        
        {show && (
          <DateTimePicker
            value={getTimeAsDate()}
            mode="time"
            is24Hour={true}
            display="default"
            onChange={handleChange}
          />
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => navigation.goBack()}>
          <Feather name="chevron-left" size={24} color="#1E293B" />
        </Pressable>
        <Text style={styles.headerTitle}>Edit Profile</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Image Section */}
        <View style={styles.imageSection}>
          <Pressable 
            style={styles.profileImageContainer}
            onPress={() => setShowImagePreview(true)}
          >
            <Image
              source={{
                uri: imagePreview || 
                  user?.profile_image ||
                  "https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=400&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
              }}
              style={styles.profileImage}
            />
            {imagePreview && (
              <View style={styles.previewBadge}>
                <Text style={styles.previewBadgeText}>Preview</Text>
              </View>
            )}
          </Pressable>
          
          <Pressable 
            style={styles.changePhotoButton}
            onPress={pickImage}
          >
            <Feather name="camera" size={16} color="#0EA5E9" style={styles.buttonIcon} />
            <Text style={styles.changePhotoText}>Change Photo</Text>
          </Pressable>
          
          {errors.image && (
            <Text style={styles.imageError}>{errors.image}</Text>
          )}
        </View>

        {/* Form */}
        <View style={styles.form}>
          <FormInput
            icon={<Feather name="user" size={20} color="#64748B" />}
            placeholder="Full Name"
            value={formData.name}
            editable={false}
            onChangeText={() => {}}
            error={errors.name}
          />

          <FormInput
            icon={<Feather name="mail" size={20} color="#64748B" />}
            placeholder="Email Address"
            value={formData.email}
            editable={false}
            onChangeText={() => {}}
            error={errors.email}
            keyboardType="email-address"
          />

          <FormInput
            icon={<Feather name="phone" size={20} color="#64748B" />}
            placeholder="Phone Number"
            value={formData.phone_number}
            editable={false}
            onChangeText={() => {}}
            error={errors.phone_number}
            keyboardType="phone-pad"
          />

          {/* Call Timing Section */}
          <View style={styles.timingSection}>
            <View style={styles.timingHeader}>
              <Feather name="clock" size={20} color="#64748B" />
              <Text style={styles.timingTitle}>Available Hours</Text>
            </View>
            
            <View style={styles.timingInputs}>
              <TimePicker 
                label="Start Time"
                value={formData.call_timing.start_time}
                onChange={(time) => setFormData(prev => ({
                  ...prev,
                  call_timing: { ...prev.call_timing, start_time: time }
                }))}
              />
              
              <View style={styles.timeDivider}>
                <Text style={styles.timeDividerText}>to</Text>
              </View>
              
              <TimePicker 
                label="End Time"
                value={formData.call_timing.end_time}
                onChange={(time) => setFormData(prev => ({
                  ...prev,
                  call_timing: { ...prev.call_timing, end_time: time }
                }))}
              />
            </View>
            
            {errors.call_timing && (
              <Text style={styles.timeError}>{errors.call_timing}</Text>
            )}
          </View>
        </View>

        {/* Error Message */}
        {generalError && (
          <View style={styles.generalError}>
            <Feather name="alert-circle" size={20} color="#EF4444" />
            <Text style={styles.generalErrorText}>{generalError}</Text>
          </View>
        )}

        {/* Success Message */}
        {success && (
          <View style={styles.success}>
            <AntDesign name="checkcircle" size={20} color="#10B981" />
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
            <ActivityIndicator color="white" size="small" />
          ) : (
            <>
              <Feather name="save" size={18} color="white" style={styles.buttonIcon} />
              <Text style={styles.saveButtonText}>Save Changes</Text>
            </>
          )}
        </Pressable>
      </View>

      {/* Image Preview Modal */}
      <Modal
        visible={showImagePreview}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowImagePreview(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Profile Photo</Text>
              <TouchableOpacity 
                onPress={() => setShowImagePreview(false)}
                style={styles.closeButton}
              >
                <AntDesign name="close" size={24} color="#1E293B" />
              </TouchableOpacity>
            </View>
            
            <Image
              source={{
                uri: imagePreview || 
                  user?.profileImageUrl ||
                  "https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=400&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
              }}
              style={styles.modalImage}
              resizeMode="contain"
            />
            
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={styles.modalButton}
                onPress={pickImage}
              >
                <Feather name="camera" size={18} color="white" style={styles.buttonIcon} />
                <Text style={styles.modalButtonText}>Change Photo</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.modalCloseButton}
                onPress={() => setShowImagePreview(false)}
              >
                <Text style={styles.modalCloseButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    paddingVertical: 16,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
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
    paddingBottom: 40,
  },
  imageSection: {
    alignItems: "center",
    marginBottom: 32,
  },
  profileImageContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: '#E2E8F0',
  },
  previewBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#0EA5E9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'white',
  },
  previewBadgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '600',
  },
  changePhotoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "#F1F5F9",
    borderRadius: 20,
  },
  buttonIcon: {
    marginRight: 8,
  },
  changePhotoText: {
    color: "#0EA5E9",
    fontSize: 14,
    fontWeight: "500",
  },
  imageError: {
    color: '#EF4444',
    fontSize: 12,
    marginTop: 8,
  },
  form: {
    gap: 20,
  },
  timingSection: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  timingHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
  },
  timingTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: "#1E293B",
  },
  timingInputs: {
    flexDirection: "row",
    alignItems: "center",
  },
  timeLabel: {
    fontSize: 12,
    color: "#64748B",
    marginBottom: 4,
  },
  timePicker: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: "#F8FAFC",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  timeText: {
    fontSize: 16,
    color: "#1E293B",
  },
  timeDivider: {
    width: 40,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 12,
  },
  timeDividerText: {
    fontSize: 14,
    color: "#64748B",
    fontWeight: '500',
  },
  timeError: {
    color: '#EF4444',
    fontSize: 12,
    marginTop: 8,
  },
  generalError: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#FEF2F2",
    padding: 16,
    borderRadius: 12,
    marginTop: 24,
    borderWidth: 1,
    borderColor: '#FECACA',
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
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  successText: {
    flex: 1,
    color: "#10B981",
    fontSize: 14,
  },
  footer: {
    padding: 20,
    backgroundColor: "white",
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 3,
  },
  saveButton: {
    flexDirection: 'row',
    backgroundColor: "#0EA5E9",
    borderRadius: 12,
    height: 52,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#0EA5E9",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 2,
  },
  saveButtonDisabled: {
    opacity: 0.7,
  },
  saveButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: 'white',
    width: '90%',
    borderRadius: 16,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
  },
  closeButton: {
    padding: 4,
  },
  modalImage: {
    width: '100%',
    height: 300,
    backgroundColor: '#F1F5F9',
  },
  modalButtons: {
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  modalButton: {
    flexDirection: 'row',
    flex: 1,
    backgroundColor: '#0EA5E9',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  modalCloseButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F1F5F9',
  },
  modalCloseButtonText: {
    color: '#64748B',
    fontWeight: '600',
  },
});