
import { useCallback, useState, useEffect } from "react"
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Platform, Alert, Modal } from "react-native"
import { useRoute, useNavigation } from "@react-navigation/native"
import DateTimePicker from "@react-native-community/datetimepicker"
import { MaterialIcons, FontAwesome5, Ionicons } from "@expo/vector-icons"
import { fetchVehiclesCategory, fetchVehicles } from "../../../utils/Api_Fetchings"
import FormInput from "../../../components/FormInput"
import styles from "./styles.ts"

// Define COLORS object
const COLORS = {
    primary: "#007bff",
    darkPrimary: "#0056b3",
    secondary: "#6c757d",
    success: "#28a745",
    error: "#dc3545",
    warning: "#ffc107",
    info: "#17a2b8",
    light: "#f8f9fa",
    dark: "#343a40",
    white: "#fff",
    gray: "#6c757d",
    lightGray: "#ced4da",
}

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
    id: string
    title: string
}

interface Vehicle {
    id: string
    name: string
    vehicleType: string
    isAvailable: boolean
    categoryId: string
    createdAt: string
}

export default function Complete_Profile() {
    const route = useRoute()
    const navigation = useNavigation()
    const { data } = route.params || {}
    const { bhId, email, name, phone_number } = data || {}

    // State for data
    const [vehicles, setVehicles] = useState<Vehicle[]>([])
    const [categories, setCategories] = useState<Category[]>([])
    const [selectedCategory, setSelectedCategory] = useState<string>("")
    const [selectedVehicles, setSelectedVehicles] = useState<string[]>([])
    const [serviceAreas, setServiceAreas] = useState<string[]>([])
    const [newServiceArea, setNewServiceArea] = useState<string>("")

    // State for UI
    const [loading, setLoading] = useState<boolean>(false)
    const [submitting, setSubmitting] = useState<boolean>(false)
    const [error, setError] = useState<string>("")
    const [showCategoryModal, setShowCategoryModal] = useState<boolean>(false)
    const [showVehicleModal, setShowVehicleModal] = useState<boolean>(false)

    // State for time pickers
    const [showStartTimePicker, setShowStartTimePicker] = useState<boolean>(false)
    const [showEndTimePicker, setShowEndTimePicker] = useState<boolean>(false)
    const [startTime, setStartTime] = useState<Date>(new Date())
    const [endTime, setEndTime] = useState<Date>(new Date())

    // Form data
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

    // Fetch categories
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

    // Fetch vehicles when category is selected
    const fetchVehiclesByCategory = useCallback(async (categoryId: string) => {
        try {
            console.log("Vehicle category selected",categoryId)

            setLoading(true)
            const response = await fetchVehicles(categoryId)
            console.log("Vehicle category selected",response)

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

    // Time picker handlers
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

    function formatTime(date: Date): string {
        let hours = date.getHours()
        const minutes = date.getMinutes()
        const ampm = hours >= 12 ? "PM" : "AM"

        hours = hours % 12
        hours = hours ? hours : 12 // the hour '0' should be '12'

        const minutesStr = minutes < 10 ? "0" + minutes : minutes

        return `${hours}:${minutesStr} ${ampm}`
    }

    // Category selection
    const handleCategorySelect = (category: Category) => {
        setSelectedCategory(category._id)
        setShowCategoryModal(false)
    }

    // Vehicle selection
    const toggleVehicleSelection = (vehicleId: string) => {
        if (selectedVehicles.includes(vehicleId)) {
            setSelectedVehicles(selectedVehicles.filter((id) => id !== vehicleId))
        } else {
            setSelectedVehicles([...selectedVehicles, vehicleId])
        }
    }

    // Service area handlers
    const addServiceArea = () => {
        if (newServiceArea.trim() === "") {
            return
        }

        if (serviceAreas.includes(newServiceArea.trim())) {
            Alert.alert("Duplicate", "This service area is already added")
            return
        }

        setServiceAreas([...serviceAreas, newServiceArea.trim()])
        setNewServiceArea("")
    }

    const removeServiceArea = (area: string) => {
        setServiceAreas(serviceAreas.filter((a) => a !== area))
    }

    // Form submission
    const handleSubmit = () => {
        // Validate form
        if (!formData.Bh_Id.trim()) {
            setError("BH ID is required")
            return
        }

        if (!formData.name.trim()) {
            setError("Name is required")
            return
        }

        if (!formData.email.trim()) {
            setError("Email is required")
            return
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            setError("Please enter a valid email address")
            return
        }

        if (!formData.phone_number.trim()) {
            setError("Phone number is required")
            return
        } else if (!/^\d{10}$/.test(formData.phone_number.replace(/\D/g, ""))) {
            setError("Please enter a valid 10-digit phone number")
            return
        }

        if (selectedVehicles.length === 0) {
            setError("Please select at least one vehicle")
            return
        }

        if (serviceAreas.length === 0) {
            setError("Please add at least one service area")
            return
        }

        // Prepare final form data
        const finalFormData = {
            ...formData,
            vehicle_info: selectedVehicles.map((id) => {
                const vehicle = vehicles.find((v) => v.id === id)
                return {
                    id,
                    name: vehicle?.name || "",
                    vehicleType: vehicle?.vehicleType || "",
                }
            }),
            service_areas: serviceAreas,
        }

        // Submit form (mock implementation)
        setSubmitting(true)

        // Simulate API call
        setTimeout(() => {
            setSubmitting(false)
            Alert.alert("Profile Completed", "Your profile has been successfully updated!", [
                {
                    text: "OK",
                    onPress: () => navigation.goBack(),
                },
            ])
        }, 1500)

        console.log("Form submitted:", finalFormData)
    }

    const getCategoryTitle = () => {
        if (!selectedCategory) return "Select Vehicle Category"
        const category = categories.find((c) => c.id === selectedCategory)
        return category ? category.title : "Select Vehicle Category"
    }

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>


            {error ? (
                <View style={styles.errorContainer}>
                    <MaterialIcons name="error-outline" size={20} color={COLORS.error} />
                    <Text style={styles.errorText}>{error}</Text>
                </View>
            ) : null}

            <View style={styles.formSection}>
                <Text style={styles.sectionTitle}>Basic Information</Text>

                <FormInput
                    label="BH ID"
                    value={formData.Bh_Id}
                    onChangeText={(text) => setFormData({ ...formData, Bh_Id: text })}
                    placeholder="Enter BH ID"
                    editable={!bhId}
                    leftIcon={<MaterialIcons name="badge" size={20} color={COLORS.darkPrimary} />}
                />

                <FormInput
                    label="Full Name"
                    value={formData.name}
                    onChangeText={(text) => setFormData({ ...formData, name: text })}
                    placeholder="Enter your full name"
                    leftIcon={<MaterialIcons name="person" size={20} color={COLORS.darkPrimary} />}
                />

                <FormInput
                    label="Email"
                    value={formData.email}
                    onChangeText={(text) => setFormData({ ...formData, email: text })}
                    placeholder="Enter your email"
                    keyboardType="email-address"
                    leftIcon={<MaterialIcons name="email" size={20} color={COLORS.darkPrimary} />}
                />

                <FormInput
                    label="Phone Number"
                    value={formData.phone_number}
                    onChangeText={(text) => setFormData({ ...formData, phone_number: text })}
                    placeholder="Enter your phone number"
                    keyboardType="phone-pad"
                    leftIcon={<MaterialIcons name="phone" size={20} color={COLORS.darkPrimary} />}
                />
            </View>

            <View style={styles.formSection}>
                <Text style={styles.sectionTitle}>Vehicle Information</Text>

                <TouchableOpacity style={styles.dropdownButton} onPress={() => setShowCategoryModal(true)}>
                    <MaterialIcons name="category" size={20} color={COLORS.darkPrimary} />
                    <Text style={styles.dropdownButtonText}>{getCategoryTitle()}</Text>
                    <MaterialIcons name="arrow-drop-down" size={24} color={COLORS.dark} />
                </TouchableOpacity>

                {selectedCategory && vehicles.length > 0 && (
                    <TouchableOpacity style={styles.dropdownButton} onPress={() => setShowVehicleModal(true)}>
                        <FontAwesome5 name="truck" size={18} color={COLORS.darkPrimary} />
                        <Text style={styles.dropdownButtonText}>
                            {selectedVehicles.length > 0 ? `${selectedVehicles.length} vehicle(s) selected` : "Select Vehicles"}
                        </Text>
                        <MaterialIcons name="arrow-drop-down" size={24} color={COLORS.dark} />
                    </TouchableOpacity>
                )}

                {selectedVehicles.length > 0 && (
                    <View style={styles.selectedItemsContainer}>
                        {selectedVehicles.map((id) => {
                            const vehicle = vehicles.find((v) => v.id === id)
                            return vehicle ? (
                                <View key={id} style={styles.selectedItem}>
                                    <FontAwesome5 name="truck" size={14} color={COLORS.white} />
                                    <Text style={styles.selectedItemText}>{vehicle.name}</Text>
                                    <TouchableOpacity onPress={() => toggleVehicleSelection(id)}>
                                        <MaterialIcons name="close" size={16} color={COLORS.white} />
                                    </TouchableOpacity>
                                </View>
                            ) : null
                        })}
                    </View>
                )}
            </View>

            <View style={styles.formSection}>
                <Text style={styles.sectionTitle}>Service Areas</Text>

                <View style={styles.inputWithButton}>
                    <FormInput
                        label=""
                        value={newServiceArea}
                        onChangeText={setNewServiceArea}
                        placeholder="Add service area (e.g., City name)"
                        containerStyle={styles.serviceAreaInput}
                        leftIcon={<MaterialIcons name="location-on" size={20} color={COLORS.darkPrimary} />}
                    />
                    <TouchableOpacity style={styles.addButton} onPress={addServiceArea}>
                        <MaterialIcons name="add" size={24} color={COLORS.white} />
                    </TouchableOpacity>
                </View>

                {serviceAreas.length > 0 && (
                    <View style={styles.selectedItemsContainer}>
                        {serviceAreas.map((area, index) => (
                            <View key={index} style={styles.selectedItem}>
                                <MaterialIcons name="location-on" size={14} color={COLORS.white} />
                                <Text style={styles.selectedItemText}>{area}</Text>
                                <TouchableOpacity onPress={() => removeServiceArea(area)}>
                                    <MaterialIcons name="close" size={16} color={COLORS.white} />
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
                            <MaterialIcons name="access-time" size={20} color={COLORS.darkPrimary} />
                            <Text style={styles.timePickerText}>{formData.call_timing.start_time}</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.timePickerContainer}>
                        <Text style={styles.timePickerLabel}>End Time</Text>
                        <TouchableOpacity style={styles.timePicker} onPress={() => setShowEndTimePicker(true)}>
                            <MaterialIcons name="access-time" size={20} color={COLORS.darkPrimary} />
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
                    <ActivityIndicator color={COLORS.white} />
                ) : (
                    <>
                        <MaterialIcons name="check-circle" size={20} color={COLORS.white} />
                        <Text style={styles.submitButtonText}>Complete Profile</Text>
                    </>
                )}
            </TouchableOpacity>

            {/* Category Selection Modal */}
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
                                <Ionicons name="close" size={24} color={COLORS.dark} />
                            </TouchableOpacity>
                        </View>

                        {loading ? (
                            <ActivityIndicator size="large" color={COLORS.primary} style={styles.modalLoader} />
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
                                            color={selectedCategory === category._id ? COLORS.white : COLORS.darkPrimary}
                                        />
                                        <Text
                                            style={[styles.modalItemText, selectedCategory === category.id && styles.modalItemTextSelected]}
                                        >
                                            {category.title}
                                        </Text>
                                        {selectedCategory === category._id && <MaterialIcons name="check" size={20} color={COLORS.white} />}
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        )}
                    </View>
                </View>
            </Modal>

            {/* Vehicle Selection Modal */}
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
                                <Ionicons name="close" size={24} color={COLORS.dark} />
                            </TouchableOpacity>
                        </View>

                        {loading ? (
                            <ActivityIndicator size="large" color={COLORS.primary} style={styles.modalLoader} />
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
                                            color={selectedVehicles.includes(vehicle._id) ? COLORS.white : COLORS.darkPrimary}
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
                                            <MaterialIcons name="check" size={20} color={COLORS.white} />
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

