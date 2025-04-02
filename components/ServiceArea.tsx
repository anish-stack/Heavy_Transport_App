import { useState, useCallback } from "react"
import { View, StyleSheet, TouchableOpacity, Text, FlatList, ActivityIndicator, Alert } from "react-native"
import { MaterialIcons } from "@expo/vector-icons"
import axios from "axios"
import FormInput from "./FormInput"

interface Location {
  type: string
  coordinates: [number, number]
  places?: string
}

interface AddressSuggestion {
  description: string
  place_id: string
}

interface AddressErrors {
  area?: string
  places?: string
}

interface AddressFormProps {
  onAddressChange: (field: keyof Location, value: any) => void
  errors: AddressErrors
  onPress: () => void
}

export default function ServiceAbleArasAdd({ onAddressChange, errors, onPress }: AddressFormProps) {
  const [addressSuggestions, setAddressSuggestions] = useState<AddressSuggestion[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [showSuggestions, setShowSuggestions] = useState<boolean>(false)
  const [area, setArea] = useState<string>("")

  const fetchAddressSuggestions = useCallback(async (query: string) => {
    if (!query.trim()) {
      setAddressSuggestions([])
      setShowSuggestions(false)
      return
    }

    setIsLoading(true)
    try {
      const res = await axios.get(
        `https://api.blueaceindia.com/api/v1/autocomplete?input=${encodeURIComponent(query)}`
      )
      setAddressSuggestions(res.data)
      setShowSuggestions(true)
    } catch (err) {
      console.error("Error fetching address suggestions:", err)
      setAddressSuggestions([])
    } finally {
      setIsLoading(false)
    }
  }, [])

  const fetchGeocode = useCallback(async (selectedAddress: AddressSuggestion) => {
    if (!selectedAddress) return
    setIsLoading(true)
    try {
      const res = await axios.get(
        `https://api.blueaceindia.com/api/v1/geocode?address=${encodeURIComponent(selectedAddress.description)}`
      )
      const { latitude, longitude } = res.data

      if (latitude && longitude) {
        onAddressChange("coordinates", [longitude, latitude])
        onAddressChange("type", "Point")
        onAddressChange("places", selectedAddress.description)
        onAddressChange("name", selectedAddress.description)
        onPress()
        setArea('')
      } else {
        Alert.alert("Geocode Error", "Latitude and Longitude not found. Please retry.")
      }
    } catch (err) {
      console.error("Error fetching geocode:", err)
      Alert.alert("Geocode Error", "Failed to fetch latitude and longitude. Please retry.")
    } finally {
      setIsLoading(false)
    }
  }, [onAddressChange, onPress])

  const handleAddressSuggestion = useCallback((item: AddressSuggestion) => {
    onAddressChange("Area", item.description)
    fetchGeocode(item)
    setShowSuggestions(false)
  }, [onAddressChange, fetchGeocode])

  const handleStreetAddressChange = useCallback((text: string) => {
    setArea(text)
    onAddressChange("Area", text)
    fetchAddressSuggestions(text)
  }, [onAddressChange, fetchAddressSuggestions])

  const renderSuggestionItem = useCallback(({ item }: { item: AddressSuggestion }) => (
    <TouchableOpacity style={styles.suggestionItem} onPress={() => handleAddressSuggestion(item)}>
      <MaterialIcons name="place" size={20} color="#D62C27" style={styles.icon} />
      <Text style={styles.suggestionText} numberOfLines={2} ellipsizeMode="tail">
        {item.description}
      </Text>
      <MaterialIcons name="arrow-forward-ios" size={14} color="#999" />
    </TouchableOpacity>
  ), [handleAddressSuggestion])

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Service Places Details</Text>
      <View style={styles.formWrapper}>
        <View style={styles.streetAddressContainer}>
          <FormInput
            label="Service Location"
            value={area}
            onChangeText={handleStreetAddressChange}
            placeholder="Enter service location"
            error={errors?.places}
          />

          {isLoading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color="#D62C27" />
            </View>
          )}
        </View>

        {showSuggestions && addressSuggestions.length > 0 && (
          <View style={styles.suggestionsWrapper}>
            <FlatList
              data={addressSuggestions}
              renderItem={renderSuggestionItem}
              keyExtractor={(item) => item.place_id}
              style={styles.suggestionsList}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={true}
              initialNumToRender={10}
              maxToRenderPerBatch={10}
              windowSize={10}
              nestedScrollEnabled={true}
            />
          </View>
        )}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
    paddingHorizontal: 5,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
    color: "#333",
  },
  formWrapper: {
    position: "relative",
    zIndex: 9999,
    elevation: 9999,
  },
  streetAddressContainer: {
    position: "relative",
  },
  suggestionsWrapper: {
    backgroundColor: "#fff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#eee",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 9999,
    zIndex: 9999,
    marginTop: 4,
    marginBottom: 20,
    maxHeight: 300,
  },
  suggestionsList: {
    width: "100%",
  },
  suggestionItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    backgroundColor: "#fff",
  },
  icon: {
    marginRight: 12,
  },
  suggestionText: {
    flex: 1,
    fontSize: 15,
    color: "#333",
    paddingRight: 8,
  },
  loadingContainer: {
    position: "absolute",
    right: 15,
    top: 45,
    zIndex: 9999,
    elevation: 9999,
  },
  addressSuggestion: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
})