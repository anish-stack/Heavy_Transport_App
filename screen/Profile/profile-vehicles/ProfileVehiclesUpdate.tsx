import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import React, { useCallback, useEffect, useState } from "react";
import { useNavigation } from "@react-navigation/native";
import { useAuth } from "../../../context/AuthContext";
import {
  Truck,
  X,
  Plus,
  CircleAlert as AlertCircle,
} from "lucide-react-native";
import TopHeadPart from "../../../components/Layout/TopHeadPart";
import { SafeAreaView } from "react-native-safe-area-context";
import { fetchVehicles, fetchVehiclesCategory } from "../../../utils/Api_Fetchings";
import axios from "axios";
import { API_URL_APP_LOCAL } from "../../../constant/Api";
import { COLORS } from "../../../constant/Colors";

interface Category {
  _id: string;
  id: string;
  title: string;
}

interface Vehicle {
  _id: string;
  name: string;
  vehicleType: string;
  isAvailable: boolean;
}

export default function ProfileVehiclesUpdate() {
  const navigation = useNavigation();
  const { user, token ,getToken } = useAuth();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedVehicles, setSelectedVehicles] = useState<Vehicle[]>(
    user?.vehicle_info || []
  );
  const [loading, setLoading] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetchVehiclesCategory();
      if (response) {
        setCategories(response);
      } else {
        setError("Failed to fetch vehicle categories");
      }
    } catch (err) {
      console.error("Error fetching categories:", err);
      setError("An error occurred while fetching vehicle categories");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchVehiclesByCategory = useCallback(async (categoryId: string) => {
    try {
      setLoading(true);
      const response = await fetchVehicles(categoryId);
      if (response) {
        setVehicles(response);
      } else {
        setError("Failed to fetch vehicles");
      }
    } catch (err) {
      console.error("Error fetching vehicles:", err);
      setError("An error occurred while fetching vehicles");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (selectedCategory) {
      fetchVehiclesByCategory(selectedCategory);
    }
  }, [selectedCategory, fetchVehiclesByCategory]);

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId);
  };

  const toggleVehicleSelection = (vehicle: Vehicle) => {
    setSelectedVehicles((prev) => {
      const exists = prev.find((v) => v._id === vehicle._id);
      if (exists) {
        return prev.filter((v) => v._id !== vehicle._id);
      }
      return [...prev, vehicle];
    });
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const response = await axios.put(
        `${API_URL_APP_LOCAL}/heavy/heavy-vehicle-profile-update/${user?._id}`,
        { vehicle_info: selectedVehicles },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (response.data.success) {
        getToken()
        navigation.goBack();
      }
    } catch (err) {
        console.log(err.response?.data?.message)
      setError(
        err.response?.data?.message ||
          "An error occurred while updating vehicles"
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.error} />
        <Text style={styles.loadingText}>Loading vehicles...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={styles.container}>
        <TopHeadPart title={"Update Vehicle"} />

        <ScrollView style={styles.content}>
          {error ? (
            <View style={styles.errorContainer}>
              <AlertCircle color="#EF4444" size={20} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          <View style={styles.currentVehicles}>
            <Text style={styles.sectionTitle}>Current Vehicles</Text>
            {selectedVehicles.length === 0 ? (
              <Text style={styles.emptyText}>No vehicles selected</Text>
            ) : (
              <View style={styles.vehicleGrid}>
                {selectedVehicles.map((vehicle) => (
                  <View key={vehicle._id} style={styles.vehicleCard}>
                    <View style={styles.vehicleInfo}>
                      <Truck size={20} color={COLORS.error} />
                      <Text style={styles.vehicleName}>{vehicle.name}</Text>
                      <Text style={styles.vehicleType}>
                        {vehicle.vehicleType}
                      </Text>
                    </View>
                    <TouchableOpacity
                      style={styles.removeButton}
                      onPress={() => toggleVehicleSelection(vehicle)}
                    >
                      <X size={16} color="#EF4444" />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}
          </View>

          <View style={styles.categorySection}>
            <Text style={styles.sectionTitle}>Add Vehicles</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.categoryList}
            >
              {categories.map((category) => (
                <TouchableOpacity
                  key={category._id}
                  style={[
                    styles.categoryButton,
                    selectedCategory === category._id &&
                      styles.categoryButtonActive,
                  ]}
                  onPress={() => handleCategorySelect(category._id)}
                >
                  <Text
                    style={[
                      styles.categoryButtonText,
                      selectedCategory === category._id &&
                        styles.categoryButtonTextActive,
                    ]}
                  >
                    {category.title}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {selectedCategory && (
            <View style={styles.vehiclesList}>
              {vehicles.map((vehicle) => {
                const isSelected = selectedVehicles.some(
                  (v) => v._id === vehicle._id
                );
                return (
                  <TouchableOpacity
                    key={vehicle._id}
                    style={[
                      styles.vehicleItem,
                      isSelected && styles.vehicleItemSelected,
                    ]}
                    onPress={() => toggleVehicleSelection(vehicle)}
                  >
                    <Truck
                      size={20}
                      color={isSelected ? "#FFFFFF" : COLORS.error }
                    />
                    <Text
                      style={[
                        styles.vehicleItemText,
                        isSelected && styles.vehicleItemTextSelected,
                      ]}
                    >
                      {vehicle.name}
                    </Text>
                    {isSelected && (
                      <View style={styles.selectedIndicator}>
                        <Plus size={16} color="#FFFFFF" />
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </ScrollView>

        <TouchableOpacity
          style={[
            styles.updateButton,
            submitting && styles.updateButtonDisabled,
          ]}
          onPress={handleSubmit}
          disabled={submitting}
        >
          {submitting ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.updateButtonText}>Update Vehicles</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#64748B",
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
  backButtonText: {
    fontSize: 24,
    color: "#1E293B",
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
    padding: 16,
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FEF2F2",
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    gap: 8,
  },
  errorText: {
    color: "#EF4444",
    fontSize: 14,
    flex: 1,
  },
  currentVehicles: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1E293B",
    marginBottom: 16,
  },
  emptyText: {
    textAlign: "center",
    color: "#64748B",
    fontSize: 16,
    fontStyle: "italic",
  },
  vehicleGrid: {
    gap: 12,
  },
  vehicleCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#F1F5F9",
    padding: 12,
    borderRadius: 8,
  },
  vehicleInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  vehicleName: {
    fontSize: 16,
    color: "#1E293B",
    fontWeight: "500",
  },
  vehicleType: {
    fontSize: 14,
    color: "#64748B",
    marginLeft: "auto",
  },
  removeButton: {
    padding: 8,
  },
  categorySection: {
    marginBottom: 24,
  },
  categoryList: {
    flexGrow: 0,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#F1F5F9",
    marginRight: 8,
  },
  categoryButtonActive: {
    backgroundColor:COLORS.error,
  },
  categoryButtonText: {
    color: "#1E293B",
    fontSize: 14,
    fontWeight: "500",
  },
  categoryButtonTextActive: {
    color: "white",
  },
  vehiclesList: {
    gap: 8,
  },
  vehicleItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: "white",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    gap: 12,
  },
  vehicleItemSelected: {
    backgroundColor: COLORS.error,
    borderColor: COLORS.error,
  },
  vehicleItemText: {
    fontSize: 16,
    color: "#1E293B",
    flex: 1,
  },
  vehicleItemTextSelected: {
    color: "white",
  },
  selectedIndicator: {
    backgroundColor: "#0284C7",
    borderRadius: 12,
    padding: 4,
  },
  updateButton: {
    backgroundColor: COLORS.error,
    margin: 16,
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  updateButtonDisabled: {
    opacity: 0.7,
  },
  updateButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
});
