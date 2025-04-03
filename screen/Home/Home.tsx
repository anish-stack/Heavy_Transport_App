import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { scale, verticalScale, moderateScale } from 'react-native-size-matters';
import Layout from '../../components/Layout/Layout';
import { useAuth } from '../../context/AuthContext';
import { COLORS } from '../../constant/Colors';
import { Upload } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { formatCurrency } from '../../utils/formatters';

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

  const [callsReceived, setCallsReceived] = useState(23);
  const [appPosition, setAppPosition] = useState(42);
  const { user } = useAuth()
  const navigation = useNavigation()

 
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
  // console.log()

  const renderServiceArea = (area: ServiceArea) => (
    <View key={area._id} style={styles.areaCard}>
      <Ionicons name="location" size={scale(20)} color={colors.primary} />
      <Text style={styles.areaText}>{area.name}</Text>
    </View>
  );

  return (
    <Layout>
      {(user?.documents.length === 0 || user?.documents.length < 6) && (
        <TouchableOpacity
          style={{
            paddingVertical: 8,
            paddingHorizontal: 16,
            borderRadius: 20,
            alignItems: "center",
            justifyContent: "center",
            margin: 10,
            borderWidth: 1,
            borderColor: COLORS.error,
            display: "flex",
            flexDirection: "row",
            gap: 8,
          }}
          activeOpacity={0.7}
          onPress={() => navigation.navigate('Upload_Documents')}
        >
          <Upload color={COLORS.darkSecondary} />
          <Text style={{ color: COLORS.darkSecondary, fontWeight: "bold" }}>
            Please Upload Your Documents
          </Text>
        </TouchableOpacity>
      )}

      {user?.documents?.some((item) => item.document_status === 'Pending') && (
        <TouchableOpacity
          style={styles.commonButtonStyle}
          activeOpacity={0.7}
          onPress={() => navigation.navigate('Upload_Documents')}
        >
          <Upload color={COLORS.darkSecondary} />
          <Text style={{ color: COLORS.darkSecondary, fontWeight: "bold" }}>
            Document verification is still pending. Please wait.
          </Text>
        </TouchableOpacity>
      )}


      {user?.documents.length === 6 && user.documents.some((item) => item.document_status === 'Rejected') && (
        <TouchableOpacity
          style={styles.commonButtonStyle}
          activeOpacity={0.7}
          onPress={() => navigation.navigate('Upload_Documents')}
        >
          <Upload color={COLORS.darkSecondary} />
          <Text style={{ color: COLORS.darkSecondary, fontWeight: "bold" }}>
            One or more documents have been rejected. Please check and re-upload.
          </Text>
        </TouchableOpacity>
      )}



      <View style={styles.header}>
        <View style={styles.profileSection}>
          <Image
            source={{ uri: 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=400' }}
            style={styles.profileImage}
          />
          <View style={styles.profileInfo}>

            <Text style={styles.partnerId}>Partner ID: {user?.Bh_Id || "ID"}</Text>
            <Text style={styles.partnerId}>Category: {user?.BH_DETAILS?.data.category?.title || "ID"}</Text>
            <Text style={styles.partnerId}>
              Plan Expires At: {new Date(user?.BH_DETAILS?.data?.payment_id?.end_date).toLocaleDateString()}
            </Text>
            <View style={[styles.statusBadge, { backgroundColor: `${colors.success}20` }]}>
              <Text style={[styles.statusText, { color: colors.success }]}>
                {user?.BH_DETAILS?.data?.isFreePlanActive ? "You're in Free Trial Upto One Year" : "Inactive"}
              </Text>
            </View>

            <View style={[styles.statusBadge, { backgroundColor: colors.success + '20' }]}>
              <Text style={[styles.statusText, { color: colors.success }]}>Account Status :- {user?.status || "Inactive"}</Text>
            </View>


          </View>
        </View>
      </View>

      {/* Stats Section */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Ionicons name="time" size={scale(20)} color={colors.primary} />
          <Text style={styles.statTitle}>Working Hours</Text>
          <Text style={styles.statValue}>{user?.call_timing?.start_time} - {user?.call_timing?.end_time}</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="car" size={scale(20)} color={colors.primary} />
          <Text style={styles.statTitle}>Money Earned Through Referral</Text>


          <Text style={styles.statValue}>{formatCurrency(user?.BH_DETAILS.data.wallet) || 0}</Text>
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
          {user?.vehicle_info.map(renderVehicleCard)}
        </ScrollView>
      </View>

      {/* Service Areas Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Service Areas</Text>
        <View style={styles.areasContainer}>
          {user?.service_areas.map(renderServiceArea)}
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
    marginBottom: verticalScale(4),
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
  commonButtonStyle: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    margin: 10,
    borderWidth: 1,
    borderColor: COLORS.error,
    display: "flex",
    flexDirection: "row",
    gap: 8,
  }
});