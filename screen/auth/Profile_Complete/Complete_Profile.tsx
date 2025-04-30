import { useCallback, useState, useEffect } from "react"
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Platform, Alert, Modal } from "react-native"
import { useRoute, useNavigation } from "@react-navigation/native"
import DateTimePicker from "@react-native-community/datetimepicker"
import { MaterialIcons, FontAwesome5, Ionicons } from "@expo/vector-icons"
import { fetchVehiclesCategory, fetchVehicles, RegisterVehiclesPartner } from "../../../utils/Api_Fetchings"

import styles from "./styles"
import ServiceAbleArasAdd from "../../../components/ServiceArea"
import FormInput from "../../../components/FormInput"

interface CallTiming {
    start_time: string
    end_time: string
}

interface FormData {
    Bh_Id: string
    name: string
    email: string
    phone_number: string
    vehicle_info: any[]
    service_areas: string[]
    call_timing: CallTiming
}

interface Category {
    _id: string
    id: string
    title: string
}

interface Vehicle {
    _id: string
    id: string
    name: string
    vehicleType: string
    isAvailable: boolean
    categoryId: string
    createdAt: string
}

interface Location {
    type: string
    coordinates: [number, number]
    places?: string
    Area?: string
    name?: string
}

interface ServiceArea {
    location: Location
    name: string
}

export default function CompleteProfile() {
    const route = useRoute()
    const navigation = useNavigation()
    const { data } = route.params || {}
    const { bhId, email, name, phone_number } = data || {}

    const [vehicles, setVehicles] = useState<Vehicle[]>([])
    const [categories, setCategories] = useState<Category[]>([])
    const [selectedCategory, setSelectedCategory] = useState<string>("")
    const [selectedVehicles, setSelectedVehicles] = useState<string[]>([])
    const [serviceAreas, setServiceAreas] = useState<ServiceArea[]>([])
    const [currentServiceArea, setCurrentServiceArea] = useState<Location>({
        type: "Point",
        coordinates: [0, 0],
        places: "",
    })

    const [loading, setLoading] = useState<boolean>(false)
    const [submitting, setSubmitting] = useState<boolean>(false)
    const [error, setError] = useState<string>("")
    const [showCategoryModal, setShowCategoryModal] = useState<boolean>(false)
    const [showVehicleModal, setShowVehicleModal] = useState<boolean>(false)
    const [showAddVehicleModal, setShowAddVehicleModal] = useState<boolean>(false)

    const [showStartTimePicker, setShowStartTimePicker] = useState<boolean>(false)
    const [showEndTimePicker, setShowEndTimePicker] = useState<boolean>(false)
    const [startTime, setStartTime] = useState<Date>(new Date())
    const [endTime, setEndTime] = useState<Date>(new Date())

    const [newVehicle, setNewVehicle] = useState({
        name: "",
        vehicleType: "",
        categoryId: "",
    })
    const [addingVehicle, setAddingVehicle] = useState(false)

    const [formData, setFormData] = useState<FormData>({
        Bh_Id: bhId || "",
        name: name || "",
        email: email || "",
        phone_number: phone_number || "",
        vehicle_info: [],
        service_areas: [],
        call_timing: {
            start_time: formatTime(new Date()),
            end_time: formatTime(new Date()),
        },
    })

    const fetchData = useCallback(async () => {
        try {
            setLoading(true)
            const response = await fetchVehiclesCategory()

            if (response) {
                setCategories(response)
            } else {
                setError("Failed to fetch vehicle categories")
            }
        } catch (err) {
            console.error("Error fetching categories:", err)
            setError("An error occurred while fetching vehicle categories")
        } finally {
            setLoading(false)
        }
    }, [])

    const fetchVehiclesByCategory = useCallback(async (categoryId: string) => {
        try {
            setLoading(true)
            const response = await fetchVehicles(categoryId)

            if (response) {
                setVehicles(response)
            } else {
                setError("Failed to fetch vehicles")
            }
        } catch (err) {
            console.error("Error fetching vehicles:", err)
            setError("An error occurred while fetching vehicles")
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        fetchData()
    }, [fetchData])

    useEffect(() => {
        if (selectedCategory) {
            fetchVehiclesByCategory(selectedCategory)
        }
    }, [selectedCategory, fetchVehiclesByCategory])

    function formatTime(date: Date): string {
        let hours = date.getHours()
        const minutes = date.getMinutes()
        const ampm = hours >= 12 ? "PM" : "AM"

        hours = hours % 12
        hours = hours ? hours : 12

        const minutesStr = minutes < 10 ? "0" + minutes : minutes

        return `${hours}:${minutesStr} ${ampm}`
    }

    const onStartTimeChange = (event: any, selectedDate?: Date) => {
        const currentDate = selectedDate || startTime
        setShowStartTimePicker(Platform.OS === "ios")
        setStartTime(currentDate)

        setFormData({
            ...formData,
            call_timing: {
                ...formData.call_timing,
                start_time: formatTime(currentDate),
            },
        })
    }

    const onEndTimeChange = (event: any, selectedDate?: Date) => {
        const currentDate = selectedDate || endTime
        setShowEndTimePicker(Platform.OS === "ios")
        setEndTime(currentDate)

        setFormData({
            ...formData,
            call_timing: {
                ...formData.call_timing,
                end_time: formatTime(currentDate),
            },
        })
    }

    const handleCategorySelect = (category: Category) => {
        setSelectedCategory(category._id)
        setShowCategoryModal(false)
    }

    const toggleVehicleSelection = (vehicleId: string) => {
        if (selectedVehicles.includes(vehicleId)) {
            setSelectedVehicles(selectedVehicles.filter((id) => id !== vehicleId))
        } else {
            setSelectedVehicles([...selectedVehicles, vehicleId])
        }
    }

    const handleServiceAreaChange = (field: keyof Location, value: any) => {
        setCurrentServiceArea((prev) => {
            const updatedState = { ...prev, [field]: value };
            // console.log("Updated Service Area:", JSON.stringify(updatedState, null, 2));
            return updatedState;
        });
    };


    const addServiceArea = () => {
        setCurrentServiceArea((prev) => {
            if (!prev.coordinates || prev.coordinates[0] === 0 || prev.coordinates[1] === 0) {
                Alert.alert("Error", "Please select a valid service area")
                return prev
            }

            const newServiceArea = {
                location: { ...prev },
                name: prev.places || prev.Area || "",
            }

            const updatedServiceAreas = [...serviceAreas, newServiceArea]
            setServiceAreas(updatedServiceAreas)

            setFormData((prevForm) => ({
                ...prevForm,
                service_areas: updatedServiceAreas,
            }))

            // console.log("Added Service Area:", JSON.stringify(newServiceArea, null, 2))

            return {
                type: "Point",
                coordinates: [0, 0],
                places: "",
            }
        })
    }


    const removeServiceArea = (index: number) => {
        const updatedAreas = [...serviceAreas]
        updatedAreas.splice(index, 1)
        setServiceAreas(updatedAreas)
    }

    const validateForm = () => {
        if (!formData.Bh_Id.trim()) {
            setError("BH ID is required")
            return false
        }

        if (!formData.name.trim()) {
            setError("Name is required")
            return false
        }

        if (!formData.email.trim()) {
            setError("Email is required")
            return false
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            setError("Please enter a valid email address")
            return false
        }

        if (!formData.phone_number.trim()) {
            setError("Phone number is required")
            return false
        } else if (!/^\d{10}$/.test(formData.phone_number.replace(/\D/g, ""))) {
            setError("Please enter a valid 10-digit phone number")
            return false
        }

        if (selectedVehicles.length === 0) {
            alert("Please select at least one vehicle")
            setError("Please select at least one vehicle")
            return false
        }

        if (serviceAreas.length === 0) {
            alert("Please add at least one service area")
            setError("Please add at least one service area")
            return false
        }

        return true
    }

    const handleSubmit = async () => {
        if (!validateForm()) return;

        const finalFormData = {
            ...formData,
            vehicle_info: selectedVehicles.map((id) => {
                const vehicle = vehicles.find((v) => v._id === id);
                return {
                    id,
                    name: vehicle?.name || "",
                    vehicleType: vehicle?.vehicleType || "",
                };
            }),
        };

        setSubmitting(true);

        try {
            const register = await RegisterVehiclesPartner({ formData: finalFormData });
            console.log("Vehicle Registration Success:", register);

            if (register?.success === true) {
                Alert.alert(
                    "Profile Completed",
                    `Your profile has been successfully updated! ${register?.data?.phone_number} OTP sent for verification on WhatsApp.`,
                    [
                        {
                            text: "OK",
                            onPress: () =>
                                navigation.navigate("verify_complete_profile_otp", {
                                    name: register?.data?.name || "",
                                    email: register?.data?.email || "",
                                    phone_number: register?.data?.phone_number || "",
                                }),
                        },
                    ]
                );
            } else {
                const errorMessage = register?.message || "Something went wrong. Please try again.";
                console.error("Registration Failed:", errorMessage);
            
                Alert.alert(
                    "Registration Failed",
                    errorMessage,
                    [
                        {
                            text: "OK",
                        },
                    ]
                );
                setError(errorMessage);
            }
            
        } catch (error: any) {
            console.error("Vehicle Registration Error:", error);

            const errorMessage = error?.message || "Failed to register. Please try again.";
            Alert.alert("Registration Failed", errorMessage, [
                {
                    text: "OK",
                },
            ]);

            setError(errorMessage);
        } finally {
            setSubmitting(false);
        }
    };


    const getCategoryTitle = () => {
        if (!selectedCategory) return "Select Vehicle Category"
        const category = categories.find((c) => c._id === selectedCategory)
        return category ? category.title : "Select Vehicle Category"
    }

    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false} contentContainerStyle={styles.contentContainer}>
            {error ? (
                <View style={styles.errorContainer}>
                    <MaterialIcons name="error-outline" size={20} color="#dc3545" />
                    <Text style={styles.errorText}>{error}</Text>
                </View>
            ) : null}

            <View style={styles.formSection}>
                <Text style={styles.sectionTitle}>Basic Information (Not Editable) </Text>

                <FormInput
                    label="BH ID"
                    value={formData.Bh_Id}
                    onChangeText={(text) => setFormData({ ...formData, Bh_Id: text })}
                    placeholder="Enter BH ID"
                    editable={!bhId}
                    leftIcon={<MaterialIcons name="badge" size={20} color="#0056b3" />}
                />

                <FormInput
                    label="Full Name"
                    value={formData.name}
                    editable={!name}
                    onChangeText={(text) => setFormData({ ...formData, name: text })}
                    placeholder="Enter your full name"
                    leftIcon={<MaterialIcons name="person" size={20} color="#0056b3" />}
                />

                <FormInput
                    label="Email"
                    value={formData.email}
                    onChangeText={(text) => setFormData({ ...formData, email: text })}
                    placeholder="Enter your email"
                    editable={!email}
                    keyboardType="email-address"
                    leftIcon={<MaterialIcons name="email" size={20} color="#0056b3" />}
                />

                <FormInput
                    label="Phone Number"
                    value={formData.phone_number}
                    onChangeText={(text) => setFormData({ ...formData, phone_number: text })}
                    placeholder="Enter your phone number"
                    keyboardType="phone-pad"
                    editable={!phone_number}
                    leftIcon={<MaterialIcons name="phone" size={20} color="#0056b3" />}
                />
            </View>

            <View style={styles.formSection}>
                <Text style={styles.sectionTitle}>Vehicle Information</Text>

                <TouchableOpacity style={styles.dropdownButton} onPress={() => setShowCategoryModal(true)}>
                    <MaterialIcons name="category" size={20} color="#0056b3" />
                    <Text style={styles.dropdownButtonText}>{getCategoryTitle()}</Text>
                    <MaterialIcons name="arrow-drop-down" size={24} color="#343a40" />
                </TouchableOpacity>

                {selectedCategory && vehicles.length > 0 && (
                    <TouchableOpacity style={styles.dropdownButton} onPress={() => setShowVehicleModal(true)}>
                        <FontAwesome5 name="truck" size={18} color="#0056b3" />
                        <Text style={styles.dropdownButtonText}>
                            {selectedVehicles.length > 0 ? `${selectedVehicles.length} vehicle(s) selected` : "Select Vehicles"}
                        </Text>
                        <MaterialIcons name="arrow-drop-down" size={24} color="#343a40" />
                    </TouchableOpacity>
                )}

                {selectedCategory && (
                    <TouchableOpacity style={styles.addNewButton} onPress={() => setShowAddVehicleModal(true)}>
                        <MaterialIcons name="add-circle-outline" size={18} color="#fff" />
                        <Text style={styles.addNewButtonText}>Add New Vehicle</Text>
                    </TouchableOpacity>
                )}

                {selectedVehicles.length > 0 && (
                    <View style={styles.selectedItemsContainer}>
                        {selectedVehicles.map((id) => {
                            const vehicle = vehicles.find((v) => v._id === id)
                            return vehicle ? (
                                <View key={id} style={styles.selectedItem}>
                                    <FontAwesome5 name="truck" size={14} color="#fff" />
                                    <Text style={styles.selectedItemText}>{vehicle.name}</Text>
                                    <TouchableOpacity onPress={() => toggleVehicleSelection(id)}>
                                        <MaterialIcons name="close" size={16} color="#fff" />
                                    </TouchableOpacity>
                                </View>
                            ) : null
                        })}
                    </View>
                )}
            </View>

            <View style={styles.formSection}>
                <Text style={styles.sectionTitle}>Service Areas</Text>

                <ServiceAbleArasAdd onPress={addServiceArea} onAddressChange={handleServiceAreaChange} errors={{}} />

                <TouchableOpacity style={styles.addNewButton} onPress={addServiceArea}>
                    <MaterialIcons name="add-circle-outline" size={18} color="#fff" />
                    <Text style={styles.addNewButtonText}>Add Service Area</Text>
                </TouchableOpacity>

                {serviceAreas.length > 0 && (
                    <View style={styles.selectedItemsContainer}>
                        {serviceAreas.map((area, index) => (
                            <View key={index} style={styles.selectedItem}>
                                <MaterialIcons name="location-on" size={14} color="#fff" />
                                <Text style={styles.selectedItemText}>{area.name}</Text>
                                <TouchableOpacity onPress={() => removeServiceArea(index)}>
                                    <MaterialIcons name="close" size={16} color="#fff" />
                                </TouchableOpacity>
                            </View>
                        ))}
                    </View>
                )}
            </View>

            <View style={styles.formSection}>
                <Text style={styles.sectionTitle}>Call Timing</Text>

                <View style={styles.timePickerRow}>
                    <View style={styles.timePickerContainer}>
                        <Text style={styles.timePickerLabel}>Start Time</Text>
                        <TouchableOpacity style={styles.timePicker} onPress={() => setShowStartTimePicker(true)}>
                            <MaterialIcons name="access-time" size={20} color="#0056b3" />
                            <Text style={styles.timePickerText}>{formData.call_timing.start_time}</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.timePickerContainer}>
                        <Text style={styles.timePickerLabel}>End Time</Text>
                        <TouchableOpacity style={styles.timePicker} onPress={() => setShowEndTimePicker(true)}>
                            <MaterialIcons name="access-time" size={20} color="#0056b3" />
                            <Text style={styles.timePickerText}>{formData.call_timing.end_time}</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {showStartTimePicker && (
                    <DateTimePicker
                        value={startTime}
                        mode="time"
                        is24Hour={false}
                        display={Platform.OS === "ios" ? "spinner" : "default"}
                        onChange={onStartTimeChange}
                    />
                )}

                {showEndTimePicker && (
                    <DateTimePicker
                        value={endTime}
                        mode="time"
                        is24Hour={false}
                        display={Platform.OS === "ios" ? "spinner" : "default"}
                        onChange={onEndTimeChange}
                    />
                )}
            </View>

            <TouchableOpacity
                style={[styles.submitButton, submitting && styles.disabledButton]}
                onPress={handleSubmit}
                disabled={submitting}
            >
                {submitting ? (
                    <ActivityIndicator color="#fff" />
                ) : (
                    <>
                        <MaterialIcons name="check-circle" size={20} color="#fff" />
                        <Text style={styles.submitButtonText}>Complete Profile</Text>
                    </>
                )}
            </TouchableOpacity>

            <Modal
                visible={showCategoryModal}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setShowCategoryModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Select Vehicle Category</Text>
                            <TouchableOpacity onPress={() => setShowCategoryModal(false)}>
                                <Ionicons name="close" size={24} color="#343a40" />
                            </TouchableOpacity>
                        </View>

                        {loading ? (
                            <ActivityIndicator size="large" color="#007bff" style={styles.modalLoader} />
                        ) : (
                            <ScrollView style={styles.modalList}>
                                {categories.map((category) => (
                                    <TouchableOpacity
                                        key={category._id}
                                        style={[styles.modalItem, selectedCategory === category._id && styles.modalItemSelected]}
                                        onPress={() => handleCategorySelect(category)}
                                    >
                                        <MaterialIcons
                                            name="category"
                                            size={20}
                                            color={selectedCategory === category._id ? "#fff" : "#0056b3"}
                                        />
                                        <Text
                                            style={[styles.modalItemText, selectedCategory === category._id && styles.modalItemTextSelected]}
                                        >
                                            {category.title}
                                        </Text>
                                        {selectedCategory === category._id && <MaterialIcons name="check" size={20} color="#fff" />}
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        )}
                    </View>
                </View>
            </Modal>

            <Modal
                visible={showVehicleModal}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setShowVehicleModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Select Vehicles</Text>
                            <TouchableOpacity onPress={() => setShowVehicleModal(false)}>
                                <Ionicons name="close" size={24} color="#343a40" />
                            </TouchableOpacity>
                        </View>

                        {loading ? (
                            <ActivityIndicator size="large" color="#007bff" style={styles.modalLoader} />
                        ) : (
                            <ScrollView style={styles.modalList}>
                                {vehicles.map((vehicle) => (
                                    <TouchableOpacity
                                        key={vehicle._id}
                                        style={[styles.modalItem, selectedVehicles.includes(vehicle._id) && styles.modalItemSelected]}
                                        onPress={() => toggleVehicleSelection(vehicle._id)}
                                    >
                                        <FontAwesome5
                                            name="truck"
                                            size={18}
                                            color={selectedVehicles.includes(vehicle._id) ? "#fff" : "#0056b3"}
                                        />
                                        <Text
                                            style={[
                                                styles.modalItemText,
                                                selectedVehicles.includes(vehicle._id) && styles.modalItemTextSelected,
                                            ]}
                                        >
                                            {vehicle.name}
                                        </Text>
                                        {selectedVehicles.includes(vehicle._id) && (
                                            <MaterialIcons name="check" size={20} color="#fff" />
                                        )}
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        )}

                        <TouchableOpacity style={styles.modalDoneButton} onPress={() => setShowVehicleModal(false)}>
                            <Text style={styles.modalDoneButtonText}>Done</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </ScrollView>
    )
}