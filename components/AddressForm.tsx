import React, { useState, useCallback, useMemo } from 'react';
import { 
  View, 
  StyleSheet, 
  TouchableOpacity, 
  Text,
  FlatList,
  ActivityIndicator
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import FormInput from './FormInput';
import axios from 'axios';

interface Location {
  type: string;
  coordinates: [number, number];
}

interface Address {
  area: string;
  street_address: string;
  landmark: string;
  pincode: string;
  location?: Location;
}

interface AddressSuggestion {
  description: string;
  place_id: string;
}

interface AddressErrors {
  pincode?: string;
  [key: string]: string | undefined;
}

interface AddressFormProps {
  address: Address;
  onAddressChange: (field: keyof Address, value: any) => void;
  errors: AddressErrors;
}

export default function AddressForm({ address, onAddressChange, errors }: AddressFormProps) {
  const [addressSuggestions, setAddressSuggestions] = useState<AddressSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showSuggestions, setShowSuggestions] = useState<boolean>(false);

  const fetchAddressSuggestions = useCallback(async (query: string) => {
    if (!query.trim()) {
      setAddressSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    
    setIsLoading(true);
    try {
      const res = await axios.get(
        `https://api.blueaceindia.com/api/v1/autocomplete?input=${encodeURIComponent(query)}`
      );
      setAddressSuggestions(res.data);
      setShowSuggestions(true);
    } catch (err) {
      console.error('Error fetching address suggestions:', err);
      setAddressSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchGeocode = useCallback(async (selectedAddress: AddressSuggestion | null) => {
    if (!selectedAddress) return;
    try {
      setIsLoading(true);
      const res = await axios.get(
        `https://api.blueaceindia.com/api/v1/geocode?address=${encodeURIComponent(
          selectedAddress.description
        )}`
      );
      const { latitude, longitude } = res.data;
      onAddressChange('location', {
        type: 'Point',
        coordinates: [longitude, latitude],
      });
    } catch (err) {
      console.error('Error fetching geocode:', err);
    } finally {
      setIsLoading(false);
    }
  }, [onAddressChange]);

  const handleAddressSuggestion = useCallback((item: AddressSuggestion) => {
    onAddressChange('street_address', item.description);
    fetchGeocode(item);
    setShowSuggestions(false);
  }, [onAddressChange, fetchGeocode]);

  const handleStreetAddressChange = useCallback((text: string) => {
    onAddressChange('street_address', text);
    fetchAddressSuggestions(text);
  }, [onAddressChange, fetchAddressSuggestions]);

  const handleAreaChange = useCallback((text: string) => {
    onAddressChange('area', text);
  }, [onAddressChange]);

  const handleLandmarkChange = useCallback((text: string) => {
    onAddressChange('landmark', text);
  }, [onAddressChange]);

  const handlePincodeChange = useCallback((text: string) => {
    onAddressChange('pincode', text);
  }, [onAddressChange]);

  const renderSuggestionItem = useCallback(({ item }: { item: AddressSuggestion }) => (
    <TouchableOpacity 
      style={styles.suggestionItem} 
      onPress={() => handleAddressSuggestion(item)}
    >
      <MaterialIcons name="place" size={20} color="#D62C27" style={styles.icon} />
      <Text style={styles.suggestionText} numberOfLines={1} ellipsizeMode="tail">
        {item.description}
      </Text>
      <MaterialIcons name="arrow-forward-ios" size={14} color="#999" />
    </TouchableOpacity>
  ), [handleAddressSuggestion]);
  
  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Address Details</Text>
      
      <FormInput
        label="Area"
        value={address.area}
        onChangeText={handleAreaChange}
        placeholder="Enter your area"
        leftIcon={<MaterialIcons name="location-city" size={20} color="#666" />}
      />
      
      <View style={styles.streetAddressContainer}>
        <FormInput
          label="Street Address"
          value={address.street_address}
          onChangeText={handleStreetAddressChange}
          placeholder="Enter street address"
          leftIcon={<MaterialIcons name="location-on" size={20} color="#666" />}
        />
        
        {isLoading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color="#D62C27" />
          </View>
        )}
        
        {/* {showSuggestions && addressSuggestions.length > 0 && (
          <View style={styles.suggestionsContainer}>
            <FlatList
              data={addressSuggestions}
              renderItem={renderSuggestionItem}
              keyExtractor={(item) => item.place_id}
              style={styles.suggestionsList}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
              initialNumToRender={4}
              maxToRenderPerBatch={5}
              windowSize={5}
            />
          </View>
        )} */}
      </View>

      <FormInput
        label="Landmark"
        value={address.landmark}
        onChangeText={handleLandmarkChange}
        placeholder="Enter landmark"
        leftIcon={<MaterialIcons name="bookmark" size={20} color="#666" />}
      />
      
      <FormInput
        label="Pincode"
        value={address.pincode}
        onChangeText={handlePincodeChange}
        placeholder="Enter pincode"
        keyboardType="numeric"
        error={errors.pincode}
        leftIcon={<MaterialIcons name="dialpad" size={20} color="#666" />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
    paddingHorizontal: 5,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  streetAddressContainer: {
    position: 'relative',
    zIndex: 1,
  },
  suggestionsContainer: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    zIndex: 2,
    maxHeight: 200,
    marginTop: 2,
  },
  suggestionsList: {
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 8,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  icon: {
    marginRight: 10,
  },
  suggestionText: {
    flex: 1,
    fontSize: 14,
    color: '#333',
  },
  loadingContainer: {
    position: 'absolute',
    right: 15,
    top: 45,
    zIndex: 2,
  },
  addressSuggestion: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
});