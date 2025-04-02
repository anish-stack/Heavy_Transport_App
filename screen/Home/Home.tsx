import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { scale, verticalScale, moderateScale } from 'react-native-size-matters';
import Layout from '../../components/Layout/Layout';
import { useAuth } from '../../context/AuthContext';

export const colors = {
  primary: '#2563EB',
  secondary: '#3B82F6',
  background: '#F3F4F6',
  white: '#FFFFFF',
  black: '#1F2937',
  gray: '#6B7280',
  border: '#E5E7EB',
  success: '#10B981',
  error: '#EF4444',
  warning: '#F59E0B',
};

interface Vehicle {
  _id: string;
  name: string;
  vehicleType: string;
  isAvailable: boolean;
}

interface ServiceArea {
  _id: string;
  name: string;
  location: object;
}

export default function Home() {
  // Added static states for Calls and Position
  const [callsReceived, setCallsReceived] = useState(23);
  const [appPosition, setAppPosition] = useState(42);
  const { user } = useAuth()
  // const user = {
  //   Bh_Id: "BH436459",
  //   name: "Anish Jha",
  //   email: "anishjha123456@gmail.com",
  //   phone_number: "7217619794",
  //   status: "Active",
  //   call_timing: {
  //     start_time: "12:00 AM",
  //     end_time: "4:33 PM"
  //   },
  //   service_areas: [
  //     { _id: "67ed19a5a54318a527484549", name: "Rohini, Delhi, India", location: {} },
  //     { _id: "67ed19a5a54318a52748454a", name: "Naharpur, Naharpur Village, Rohini, Delhi, India", location: {} }
  //   ],
  //   vehicle_info: [
  //     { _id: "67eba3b514d39d1d121a000c", name: "Flatbed Champion", vehicleType: "Big", isAvailable: true },
  //     { _id: "67eba3b514d39d1d121a000d", name: "Lowbed Champion", vehicleType: "Big", isAvailable: true },
  //     { _id: "67eba3bf14d39d1d121a0011", name: "Crane Trucks", vehicleType: "Big", isAvailable: true }
  //   ]
  // };

  const renderVehicleCard = (vehicle: Vehicle) => (
    <View key={vehicle._id} style={styles.vehicleCard}>
      <View style={styles.vehicleInfo}>
        <Text style={styles.vehicleName}>{vehicle.name}</Text>
        <Text style={styles.vehicleType}>{vehicle.vehicleType}</Text>
        <View style={[styles.statusBadge, { backgroundColor: vehicle.isAvailable ? colors.success + '20' : colors.error + '20' }]}>
          <Text style={[styles.statusText, { color: vehicle.isAvailable ? colors.success : colors.error }]}>
            {vehicle.isAvailable ? 'Available' : 'Busy'}
          </Text>
        </View>
      </View>
    </View>
  );

  const renderServiceArea = (area: ServiceArea) => (
    <View key={area._id} style={styles.areaCard}>
      <Ionicons name="location" size={scale(20)} color={colors.primary} />
      <Text style={styles.areaText}>{area.name}</Text>
    </View>
  );

  return (
    <Layout>
      <View style={styles.header}>
        <View style={styles.profileSection}>
          <Image
            source={{ uri: 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=400' }}
            style={styles.profileImage}
          />
          <View style={styles.profileInfo}>
            <Text style={styles.name}>{user.name}</Text>
            <Text style={styles.partnerId}>Partner ID: {user.Bh_Id}</Text>
            <View style={[styles.statusBadge, { backgroundColor: colors.success + '20' }]}>
              <Text style={[styles.statusText, { color: colors.success }]}>{user.status}</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Stats Section */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Ionicons name="time" size={scale(20)} color={colors.primary} />
          <Text style={styles.statTitle}>Working Hours</Text>
          <Text style={styles.statValue}>{user.call_timing.start_time} - {user.call_timing.end_time}</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="car" size={scale(20)} color={colors.primary} />
          <Text style={styles.statTitle}>Total Vehicles</Text>
          <Text style={styles.statValue}>{user.vehicle_info.length}</Text>
        </View>
      </View>

      {/* Added new stats section for Calls and Position */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Ionicons name="call" size={scale(20)} color={colors.primary} />
          <Text style={styles.statTitle}>Calls You Get</Text>
          <Text style={styles.statValue}>{callsReceived} this month</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="trophy" size={scale(20)} color={colors.warning} />
          <Text style={styles.statTitle}>Position On App</Text>
          <Text style={styles.statValue}>#{appPosition} in Delhi</Text>
        </View>
      </View>

      {/* Vehicles Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Your Vehicles</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.vehiclesScroll}>
          {user.vehicle_info.map(renderVehicleCard)}
        </ScrollView>
      </View>

      {/* Service Areas Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Service Areas</Text>
        <View style={styles.areasContainer}>
          {user.service_areas.map(renderServiceArea)}
        </View>
      </View>
    </Layout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    backgroundColor: colors.white,
    padding: moderateScale(15),
    borderBottomWidth: scale(1),
    borderBottomColor: colors.border,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileImage: {
    width: scale(70),
    height: scale(70),
    borderRadius: scale(35),
    marginRight: scale(12),
  },
  profileInfo: {
    flex: 1,
  },
  name: {
    fontSize: scale(20),
    fontWeight: '600',
    color: colors.black,
    marginBottom: verticalScale(2),
  },
  partnerId: {
    fontSize: scale(12),
    color: colors.gray,
    marginBottom: verticalScale(6),
  },
  statsContainer: {
    flexDirection: 'row',
    padding: moderateScale(12),
    gap: scale(5),
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.white,
    padding: moderateScale(12),
    borderRadius: scale(12),
    alignItems: 'center',
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: verticalScale(2) },
    shadowOpacity: 0.1,
    shadowRadius: scale(4),
    elevation: 3,
  },
  statTitle: {
    fontSize: scale(12),
    color: colors.gray,
    marginTop: verticalScale(6),
  },
  statValue: {
    fontSize: scale(14),
    fontWeight: '600',
    color: colors.black,
    marginTop: verticalScale(2),
  },
  section: {
    padding: moderateScale(8),
  },
  sectionTitle: {
    fontSize: scale(18),
    fontWeight: '600',
    color: colors.black,
    marginBottom: verticalScale(12),
    paddingHorizontal: scale(4),
  },
  vehiclesScroll: {
    marginHorizontal: scale(-15),
    paddingHorizontal: scale(15),
    paddingBottom: verticalScale(30),
  },
  vehicleCard: {
    width: scale(250),
    backgroundColor: colors.white,
    borderRadius: scale(12),
    marginRight: scale(12),
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: verticalScale(2) },
    shadowOpacity: 0.1,
    shadowRadius: scale(4),
    elevation: 3,
  },
  vehicleInfo: {
    padding: moderateScale(12),
  },
  vehicleName: {
    fontSize: scale(16),
    fontWeight: '600',
    color: colors.black,
    marginBottom: verticalScale(2),
  },
  vehicleType: {
    fontSize: scale(12),
    color: colors.gray,
    marginBottom: verticalScale(6),
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: scale(10),
    paddingVertical: verticalScale(4),
    borderRadius: scale(16),
  },
  statusText: {
    fontSize: scale(10),
    fontWeight: '500',
  },
  areasContainer: {
    gap: verticalScale(8),
  },
  areaCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    padding: moderateScale(12),
    borderRadius: scale(12),
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: verticalScale(2) },
    shadowOpacity: 0.1,
    shadowRadius: scale(4),
    elevation: 3,
  },
  areaText: {
    fontSize: scale(14),
    color: colors.black,
    marginLeft: scale(8),
    flex: 1,
  },
});