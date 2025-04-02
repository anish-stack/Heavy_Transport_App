import {
  View,
  Text,
  Image,
  ActivityIndicator,
  ScrollView,
  Pressable,
} from "react-native";
import { StyleSheet } from "react-native";
import {
  User,
  Settings,
  MapPin,
  Truck,
  ChevronRight,
  LogOut,
  Lock,
} from "lucide-react-native";
import { useAuth } from "../../context/AuthContext";
import { useNavigation } from "@react-navigation/native";
import TopHeadPart from "../../components/Layout/TopHeadPart";
import Layout from "../../components/Layout/Layout";

interface ProfileLink {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  onPress: () => void;
  showChevron?: boolean;
  danger?: boolean;
}

export default function Profile() {
  const router = useNavigation();
  const { user, loading, deleteToken } = useAuth();
  console.log(user);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0EA5E9" />
      </View>
    );
  }

  const profileLinks: ProfileLink[] = [
    {
      icon: <User size={24} color="#64748B" />,
      title: "Edit Profile",
      subtitle: "Update your personal information",
      onPress: () => router.navigate("profile-edit"),
      showChevron: true,
    },
    {
      icon: <MapPin size={24} color="#64748B" />,
      title: "Service Areas",
      subtitle: `${user?.service_areas?.length || 0} areas configured`,
      onPress: () => router.navigate("profile-service-areas"),
      showChevron: true,
    },
    {
      icon: <Truck size={24} color="#64748B" />,
      title: "Vehicles",
      subtitle: `${user?.vehicle_info?.length || 0} vehicles registered`,
      onPress: () => router.navigate("profile-vehicles"),
      showChevron: true,
    },
    {
      icon: <Settings size={24} color="#64748B" />,
      title: "Settings",
      subtitle: "App preferences and notifications",
      onPress: () => router.navigate("profile-settings"),
      showChevron: true,
    },

    {
      icon: <Lock size={24} color="#64748B" />,
      title: "Policy",
      subtitle: "App Term And Conditions",
      onPress: () => router.navigate("App-Policy"),
      showChevron: true,
    },
    {
      icon: <LogOut size={24} color="#EF4444" />,
      title: "Logout",
      onPress: () => deleteToken(),
      danger: true,
    },
  ];

  const ProfileLink = ({
    icon,
    title,
    subtitle,
    onPress,
    showChevron,
    danger,
  }: ProfileLink) => (
    <Pressable
      style={({ pressed }) => [
        styles.linkContainer,
        pressed && styles.linkPressed,
      ]}
      onPress={onPress}
    >
      <View style={styles.linkContent}>
        <View style={styles.linkIcon}>{icon}</View>
        <View style={styles.linkText}>
          <Text style={[styles.linkTitle, danger && styles.dangerText]}>
            {title}
          </Text>
          {subtitle && <Text style={styles.linkSubtitle}>{subtitle}</Text>}
        </View>
        {showChevron && <ChevronRight size={20} color="#94A3B8" />}
      </View>
    </Pressable>
  );

  return (
    <>
      <Layout isHeaderShow={false}>
      <TopHeadPart title={"My Profile"} />
        <ScrollView
          style={styles.container}
          contentContainerStyle={styles.contentContainer}
        >
          <View style={styles.header}>
            <Image
              source={{
                uri:
                  user?.profileImageUrl ||
                  "https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=400&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
              }}
              style={styles.profileImage}
            />
            <View style={styles.headerText}>
              <Text style={styles.name}>{user?.name || "John Doe"}</Text>
              <Text style={styles.email}>
                {user?.email || "john@example.com"}
              </Text>
              <View style={styles.statusContainer}>
                <View
                  style={[
                    styles.statusBadge,
                    user?.status === "Active" && styles.statusBadgeActive,
                  ]}
                >
                  <Text style={styles.statusText}>{user?.status}</Text>
                </View>
              </View>
            </View>
          </View>

          <View style={styles.linksSection}>
            {profileLinks.map((link, index) => (
              <ProfileLink key={index} {...link} />
            ))}
          </View>
        </ScrollView>
      </Layout>
    </>
  );
}

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
  },
  header: {
    padding: 24,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
    flexDirection: "row",
    alignItems: "center",
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 16,
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
  linksSection: {
    marginTop: 24,
    backgroundColor: "white",
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#E2E8F0",
  },
  linkContainer: {
    paddingVertical: 16,
    paddingHorizontal: 24,
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
