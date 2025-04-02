import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Alert,
    ActivityIndicator,
  } from "react-native";
  import React, { useEffect, useState } from "react";
  import { useNavigation } from "@react-navigation/native";
  import ServiceAbleArasAdd from "../../../components/ServiceArea";
  import { useAuth } from "../../../context/AuthContext";
  import { API_URL_APP_LOCAL } from "../../../constant/Api";
  import axios from "axios";
import Layout from "../../../components/Layout/Layout";
import TopHeadPart from "../../../components/Layout/TopHeadPart";
import { COLORS } from "../../../constant/Colors";
  
  interface Location {
    type: string;
    coordinates: [number, number];
    places?: string;
    Area?: string;
    name?: string;
  }
  
  interface ServiceArea {
    location: Location;
    name: string;
  }
  
  export default function ServiceAreaScreen() {
    const navigation = useNavigation();
    const { user, token, getToken } = useAuth();
    const [serviceAreas, setServiceAreas] = useState<ServiceArea[]>([]);
    const [currentServiceArea, setCurrentServiceArea] = useState<Location>({
      type: "Point",
      coordinates: [0, 0],
      places: "",
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
  
    const handleServiceAreaChange = (field: keyof Location, value: any) => {
      setCurrentServiceArea((prev) => ({
        ...prev,
        [field]: value,
      }));
    };
  
    useEffect(() => {
      if (user?.service_areas) {
        setServiceAreas(user.service_areas);
      }
    }, [user]);
  
    const addServiceArea = () => {
      if (
        !currentServiceArea.coordinates ||
        currentServiceArea.coordinates[0] === 0 ||
        currentServiceArea.coordinates[1] === 0
      ) {
        Alert.alert("Error", "Please select a valid service area");
        return;
      }
  
      const newServiceArea = {
        location: { ...currentServiceArea },
        name: currentServiceArea.places || currentServiceArea.Area || "",
      };
  
      setServiceAreas((prevAreas) => [...prevAreas, newServiceArea]);
      setCurrentServiceArea({
        type: "Point",
        coordinates: [0, 0],
        places: "",
        Area: "",
      });
      setError("");
    };
  
    const handleSubmit = async () => {
        console.log("serviceAreas",serviceAreas)
      setLoading(true);
      try {
        const response = await axios.post(
          `${API_URL_APP_LOCAL}/heavy/heavy-vehicle-services-area/${user?._id}`,
          {service_areas:serviceAreas},
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        getToken();
        if (response.data.success) {
          setTimeout(() => {
            setServiceAreas(true);
            navigation.goBack();
          }, 2000);
        }
      } catch (error) {
        console.log(error);
        setError(
          error.response?.data?.message ||
            "An error occurred while updating your profile"
        );
      } finally {
        setLoading(false);
      }
    };
  
    const removeServiceArea = (index: number) => {
      const updatedAreas = serviceAreas.filter((_, i) => i !== index);
      setServiceAreas(updatedAreas);
    };
  
    return (
<>
<TopHeadPart title={'Update Service Areas'} />
<Layout isHeaderShow={false}>
      <View style={styles.container}>
    
  
        <ScrollView style={styles.content}>
          {error ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}
  
          <View style={styles.addSection}>
            <ServiceAbleArasAdd
              onPress={addServiceArea}
              onAddressChange={handleServiceAreaChange}
              errors={{}}
            />
          </View>
  
          <View style={styles.listContainer}>
            <Text style={styles.sectionTitle}>Your Service Areas</Text>
            {serviceAreas.length === 0 ? (
              <Text style={styles.emptyText}>No service areas added yet</Text>
            ) : (
              serviceAreas.map((area, index) => (
                <View key={index} style={styles.areaItem}>
                  <View style={styles.areaInfo}>
                    <Text style={styles.areaName}>{area.name}</Text>
                  </View>
                  <TouchableOpacity
                    style={styles.removeButton}
                    onPress={() => removeServiceArea(index)}
                  >
                    <Text style={styles.removeButtonText}>×</Text>
                  </TouchableOpacity>
                </View>
              ))
            )}
          </View>
  
          <TouchableOpacity
            style={[styles.updateButton, loading && styles.updateButtonDisabled]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.updateButtonText}>Update Service Areas</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </View>

</Layout>

</>

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
      backgroundColor: "#FEF2F2",
      padding: 16,
      borderRadius: 8,
      marginBottom: 16,
    },
    errorText: {
      color: "#EF4444",
      fontSize: 14,
    },
    addSection: {
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
    input: {
      backgroundColor: "#F8FAFC",
      borderRadius: 8,
      paddingHorizontal: 12,
      paddingVertical: 10,
      fontSize: 16,
      color: "#1E293B",
      marginBottom: 16,
    },
    addButton: {
      backgroundColor: "#0EA5E9",
      borderRadius: 8,
      paddingVertical: 12,
      alignItems: "center",
    },
    addButtonDisabled: {
      opacity: 0.7,
    },
    addButtonText: {
      color: "white",
      fontSize: 16,
      fontWeight: "600",
    },
    listContainer: {
      backgroundColor: "white",
      borderRadius: 12,
      padding: 16,
      borderWidth: 1,
      borderColor: "#E2E8F0",
      marginBottom: 16,
    },
    emptyText: {
      textAlign: "center",
      color: "#64748B",
      fontSize: 16,
      fontStyle: "italic",
    },
    areaItem: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: "#E2E8F0",
    },
    areaInfo: {
      flex: 1,
    },
    areaName: {
      fontSize: 16,
      color: "#1E293B",
    },
    removeButton: {
      padding: 8,
    },
    removeButtonText: {
      fontSize: 24,
      color: "#EF4444",
      fontWeight: "600",
    },
    updateButton: {
      backgroundColor: COLORS.dark,
      borderRadius: 8,
      paddingVertical: 16,
      alignItems: "center",
      marginBottom: 24,
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