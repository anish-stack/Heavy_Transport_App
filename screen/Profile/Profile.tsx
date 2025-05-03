import React from 'react';
import {
  View,
  Text,
  Image,
  ActivityIndicator,
  ScrollView,
  Pressable,
  StyleSheet,
} from "react-native";
import {
  FontAwesome5,
  MaterialIcons,
  Feather
} from '@expo/vector-icons';
import { useAuth } from "../../context/AuthContext";
import { CommonActions, useNavigation } from "@react-navigation/native";
import TopHeadPart from "../../components/Layout/TopHeadPart";
import Layout from "../../components/Layout/Layout";

/**
 * Interface for user profile data
 */
interface User {
  name?: string;
  email?: string;
  profileImageUrl?: string;
  status?: string;
  service_areas?: any[];
  vehicle_info?: any[];
}

/**
 * Interface for profile link items
 */
interface ProfileLink {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  onPress: () => void;
  showChevron?: boolean;
  danger?: boolean;
}

/**
 * Interface for ProfileLinkProps component
 */
interface ProfileLinkProps extends ProfileLink { }

/**
 * Profile screen component
 */
export default function Profile() {
  const navigation = useNavigation();
  const { user, loading, deleteToken } = useAuth();

  // Show loading indicator when data is being fetched
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0EA5E9" />
      </View>
    );
  }
  const logout = async () => {
    await deleteToken()
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [
          { name: 'login' },
        ],
      })
    );
  }

  // Profile navigation links configuration
  const profileLinks: ProfileLink[] = [
    {
      icon: <FontAwesome5 name="user-edit" size={22} color="#64748B" />,
      title: "Edit Profile",
      subtitle: "Update your personal information",
      onPress: () => navigation.navigate("profile-edit"),
      showChevron: true,
    },
    {
      icon: <FontAwesome5 name="map-marker-alt" size={22} color="#64748B" />,
      title: "Service Areas",
      subtitle: `${user?.service_areas?.length || 0} areas configured`,
      onPress: () => navigation.navigate("profile-service-areas"),
      showChevron: true,
    },
    {
      icon: <FontAwesome5 name="truck" size={22} color="#64748B" />,
      title: "Vehicles",
      subtitle: `${user?.vehicle_info?.length || 0} vehicles registered`,
      onPress: () => navigation.navigate("profile-vehicles"),
      showChevron: true,
    },
    {
      icon: <Feather name="arrow-down-circle" size={22} color="#64748B" />,
      title: "Withdraw",
      subtitle: "Manage your withdrawal requests",
      onPress: () => navigation.navigate("Withdraw"),
      showChevron: true,
    },
    {
      icon: <Feather name="refresh-cw" size={22} color="#64748B" />,
      title: "Recharge",
      subtitle: "Recharge Your  account",
      onPress: () => navigation.navigate("Recharge"),
      showChevron: true,
    },

    {
      icon: <MaterialIcons name="logout" size={22} color="#EF4444" />,
      title: "Logout",
      onPress: () => logout(),
      danger: true,
    },
  ];

  return (
    <Layout isHeaderShow={false}>
      <TopHeadPart title="My Profile" />
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <ProfileHeader user={user} />
        <View style={styles.linksSection}>
          {profileLinks.map((link, index) => (
            <ProfileLinkItem key={index} {...link} />
          ))}
        </View>
      </ScrollView>
    </Layout>
  );
}

/**
 * Profile header component showing user information
 */
const ProfileHeader = ({ user }: { user?: User }) => (
  <View style={styles.header}>
    <Image
      source={{
        uri: user?.profile_image ||
          "https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=400&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
      }}
      style={styles.profileImage}
    />
    <View style={styles.headerText}>
      <Text style={styles.name}>{user?.name || "John Doe"}</Text>
      <Text style={styles.email}>{user?.email || "john@example.com"}</Text>
      <View style={styles.statusContainer}>
        <View
          style={[
            styles.statusBadge,
            user?.status === "Active" && styles.statusBadgeActive,
          ]}
        >
          <Text
            style={[
              styles.statusText,
              user?.status === "Active" && styles.statusTextActive
            ]}
          >
            {user?.status || "Pending"}
          </Text>
        </View>
      </View>
    </View>
  </View>
);

/**
 * ProfileLinkItem component for navigation options
 */
const ProfileLinkItem = ({
  icon,
  title,
  subtitle,
  onPress,
  showChevron,
  danger,
}: ProfileLinkProps) => (
  <Pressable
    style={({ pressed }) => [
      styles.linkContainer,
      pressed && styles.linkPressed,
    ]}
    onPress={onPress}
    android_ripple={{ color: '#F1F5F9' }}
  >
    <View style={styles.linkContent}>
      <View style={styles.linkIcon}>{icon}</View>
      <View style={styles.linkText}>
        <Text style={[styles.linkTitle, danger && styles.dangerText]}>
          {title}
        </Text>
        {subtitle && <Text style={styles.linkSubtitle}>{subtitle}</Text>}
      </View>
      {showChevron && (
        <MaterialIcons name="chevron-right" size={22} color="#94A3B8" />
      )}
    </View>
  </Pressable>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  contentContainer: {
    paddingBottom: 32,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
  },
  header: {
    padding: 24,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2.22,
    elevation: 2,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 16,
    borderWidth: 2,
    borderColor: "#E2E8F0",
  },
  headerText: {
    flex: 1,
  },
  name: {
    fontSize: 24,
    fontWeight: "600",
    color: "#1E293B",
    marginBottom: 4,
  },
  email: {
    fontSize: 16,
    color: "#64748B",
    marginBottom: 8,
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  statusBadge: {
    backgroundColor: "#FEF3C7",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusBadgeActive: {
    backgroundColor: "#DCFCE7",
  },
  statusText: {
    fontSize: 14,
    color: "#92400E",
    fontWeight: "500",
  },
  statusTextActive: {
    color: "#166534",
  },
  linksSection: {
    marginTop: 16,
    backgroundColor: "white",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginHorizontal: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2.22,
    elevation: 2,
  },
  linkContainer: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  linkPressed: {
    backgroundColor: "#F1F5F9",
  },
  linkContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  linkIcon: {
    marginRight: 16,
    width: 24,
    alignItems: "center",
  },
  linkText: {
    flex: 1,
  },
  linkTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: "#1E293B",
    marginBottom: 2,
  },
  linkSubtitle: {
    fontSize: 14,
    color: "#64748B",
  },
  dangerText: {
    color: "#EF4444",
  },
});