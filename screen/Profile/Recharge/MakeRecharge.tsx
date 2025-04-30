

import { useState, useEffect, useCallback } from "react"
import {
  View,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  Alert,
  Dimensions,
  RefreshControl,
  ActivityIndicator,
  Modal,
  StatusBar,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { useNavigation } from "@react-navigation/native"
import axios from "axios"
import RazorpayCheckout from "react-native-razorpay"
import { LinearGradient } from "expo-linear-gradient"
import Icon from "react-native-vector-icons/MaterialCommunityIcons"
import LottieView from "lottie-react-native"
import { useAuth } from "../../../context/AuthContext"
import { API_URL_APP, API_URL_WEB } from "../../../constant/Api"


const { width } = Dimensions.get("window")
const CARD_WIDTH = width * 0.85

interface MembershipPlan {
  _id: string
  title: string
  price: number
  description: string
  validityDays: number
  whatIsThis: string
  category: string
  features?: string[]
}

type PaymentStatus = "idle" | "loading" | "success" | "failed" | "cancelled"

const MakeRechargeScreen = () => {
  const navigation = useNavigation()
  const { user, getToken: refreshUserData } = useAuth()

  // State
  const [refreshing, setRefreshing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [memberships, setMemberships] = useState<MembershipPlan[]>([])
  const [selectedPlan, setSelectedPlan] = useState<MembershipPlan | null>(null)
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>("idle")
  const [statusMessage, setStatusMessage] = useState("")
  const [showPaymentModal, setShowPaymentModal] = useState(false)

  // Fetch membership plans
  const fetchMembershipPlans = useCallback(async () => {
    try {
      setLoading(true)
      const { data } = await axios.get(`${API_URL_WEB}/api/v1/membership-plans`)

   
      const filter = data.data.filter((item)=> item.category === 'transport')
      console.log(filter)
      // Add some features to each plan for better UI
      const enhancedPlans = filter.map((plan) => ({
        ...plan,
        features: [
          `Valid for ${plan.validityDays} ${plan.whatIsThis}`,
          "Unlimited bookings",
          "Priority customer support",
     
        ],
      }))

      setMemberships(enhancedPlans)
    } catch (error) {
      console.error("Error fetching plans:", error)
      Alert.alert(
        "Connection Error",
        "Unable to fetch membership plans. Please check your internet connection and try again.",
      )
    } finally {
      setLoading(false)
    }
  }, [])

  // Initial load
  useEffect(() => {
    fetchMembershipPlans()
  }, [fetchMembershipPlans])

  // Pull to refresh
  const onRefresh = useCallback(async () => {
    setRefreshing(true)
    await fetchMembershipPlans()
    setRefreshing(false)
  }, [fetchMembershipPlans])

  // Handle plan selection
  const handlePlanSelect = useCallback((plan: MembershipPlan) => {
    setSelectedPlan(plan)
  }, [])

  // Display payment status modal
  const displayPaymentModal = useCallback(
    (status: PaymentStatus, message: string) => {
      setPaymentStatus(status)
      setStatusMessage(message)
      setShowPaymentModal(true)

      // Auto-hide success/cancel modals after 2.5 seconds
      if (status === "success" || status === "cancelled") {
        setTimeout(() => {
          setShowPaymentModal(false)

          // Navigate back on success after modal closes
          if (status === "success") {
            setTimeout(() => {
              navigation.goBack()
            }, 500)
          }
        }, 2500)
      }
    },
    [navigation],
  )

  // Initiate Razorpay payment
  const initiatePayment = useCallback(async () => {
    if (!selectedPlan) {
      Alert.alert("Error", "Please select a membership plan")
      return
    }
    console.log("user",)

    setLoading(true)

    try {
      const response = await axios.get(
        `http://192.168.1.11:3100/api/v1/rider/recharge-wallet/${selectedPlan._id}/${user.BH_DETAILS?.BH_ID}`,
      )

      if (!response.data || !response.data.order) {
        throw new Error("Invalid response from server")
      }

      const options = {
        description: `${selectedPlan.title} Membership`,
        image: "https://www.olyox.com/assets/logo-CWkwXYQ_.png",
        currency: response.data.order.currency,
        // key: "rzp_live_zD1yAIqb2utRwp",
        key: "rzp_test_7atYe4nCssW6Po",

        amount: response.data.order.amount,
        name: "Olyox",
        order_id: response.data.order.id,
        prefill: {
          email: user?.BH_DETAILS?.data?.email,
          contact: user?.BH_DETAILS?.data?.number,
          name: user?.BH_DETAILS?.data?.name,
        },
        theme: { color: "#4F46E5" },
      }

      const paymentResponse = await RazorpayCheckout.open(options)

      const verifyResponse = await axios.post(`http://192.168.1.11:3100/api/v1/rider/recharge-verify/${user?.BH_ID}`, {
        razorpay_order_id: paymentResponse.razorpay_order_id,
        razorpay_payment_id: paymentResponse.razorpay_payment_id,
        razorpay_signature: paymentResponse.razorpay_signature,
      })

      const rechargeStatus = verifyResponse?.data?.rechargeData

      if (verifyResponse?.data?.message?.includes("successful") && rechargeStatus?.payment_approved) {
        await refreshUserData()
        displayPaymentModal("success", "Your payment was successful! Your membership has been activated.")
      } else {
        displayPaymentModal("failed", "Payment processed but verification failed. Please contact support.")
      }
    } catch (error) {
      console.error("Payment error:", error.response.data)

      if (error?.description === "Payment Cancelled" || error?.code === "PAYMENT_CANCELLED") {
        displayPaymentModal("cancelled", "You cancelled the payment. Please try again when you're ready.")
      } else {
        displayPaymentModal("failed", "Payment failed. Please check your payment method and try again.")
      }
    } finally {
      setLoading(false)
    }
  }, [selectedPlan, user, displayPaymentModal, refreshUserData])

  // Render membership plan card
  const renderPlanCard = useCallback(
    (plan: MembershipPlan, index: number) => {
      const isSelected = selectedPlan?._id === plan._id

      return (
        <View key={plan._id} style={[styles.planCard, isSelected && styles.selectedPlanCard]}>
          <TouchableOpacity activeOpacity={0.8} onPress={() => handlePlanSelect(plan)} style={styles.planCardTouchable}>
            {/* Plan header */}
            <LinearGradient
              colors={isSelected ? ["#4F46E5", "#7C3AED"] : ["#64748B", "#475569"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.planHeader}
            >
              <Text style={styles.planTitle}>{plan.title}</Text>
              <View style={styles.priceBadge}>
                <Text style={styles.priceText}>₹{plan.price}</Text>
              </View>
            </LinearGradient>

            {/* Plan features */}
            <View style={styles.planContent}>
              <Text style={styles.validityText}>
                {plan.validityDays} {plan.whatIsThis} membership
              </Text>
              <Text style={[styles.validityText,{fontSize:12}]}>
                {plan?.description}
              </Text>

              {plan.features?.map((feature, idx) => (
                <View key={idx} style={styles.featureRow}>
                  <Icon name="check-circle" size={18} color="#4F46E5" />
                  <Text style={styles.featureText}>{feature}</Text>
                </View>
              ))}
            </View>

            {/* Selection indicator */}
            {isSelected && (
              <View style={styles.selectedIndicator}>
                <Icon name="check-circle" size={24} color="#4F46E5" />
              </View>
            )}
          </TouchableOpacity>
        </View>
      )
    },
    [selectedPlan, handlePlanSelect],
  )

  // Payment status modal
  const renderPaymentStatusModal = () => (
    <Modal
      visible={showPaymentModal}
      transparent
      animationType="fade"
      onRequestClose={() => {
        if (paymentStatus !== "loading") {
          setShowPaymentModal(false)
        }
      }}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {paymentStatus === "loading" && (
            <>
              <LottieView
                source={require("./payment-loading.json")}
                autoPlay
                loop
                style={styles.lottieAnimation}
              />
              <Text style={styles.modalTitle}>Processing Payment</Text>
              <Text style={styles.modalMessage}>Please wait while we process your payment...</Text>
            </>
          )}

          {paymentStatus === "success" && (
            <>
              <LottieView
                source={require("./payment-success.json")}
                autoPlay
                loop={false}
                style={styles.lottieAnimation}
              />
              <Text style={styles.modalTitle}>Payment Successful!</Text>
              <Text style={styles.modalMessage}>{statusMessage}</Text>
            </>
          )}

          {paymentStatus === "failed" && (
            <>
              <LottieView
                source={require("./payment-failed.json")}
                autoPlay
                loop={false}
                style={styles.lottieAnimation}
              />
              <Text style={styles.modalTitle}>Payment Failed</Text>
              <Text style={styles.modalMessage}>{statusMessage}</Text>
              <TouchableOpacity style={styles.modalButton} onPress={() => setShowPaymentModal(false)}>
                <Text style={styles.modalButtonText}>Try Again</Text>
              </TouchableOpacity>
            </>
          )}

          {paymentStatus === "cancelled" && (
            <>
              <Icon name="close-circle-outline" size={70} color="#64748B" />
              <Text style={styles.modalTitle}>Payment Cancelled</Text>
              <Text style={styles.modalMessage}>{statusMessage}</Text>
            </>
          )}
        </View>
      </View>
    </Modal>
  )

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={24} color="#0F172A" />
        </TouchableOpacity>
        <View>
          <Text style={styles.headerTitle}>Membership Plans</Text>
          <Text style={styles.headerSubtitle}>Choose a plan that suits your needs</Text>
        </View>
      </View>

      {/* Wallet balance */}
      <View style={styles.walletContainer}>
        <Icon name="wallet-outline" size={20} color="#4F46E5" />
        <Text style={styles.walletText}>
          Current Balance: <Text style={styles.walletAmount}>₹{user?.data?.wallet || 0}</Text>
        </Text>
      </View>

      {/* Content */}
      {loading && !refreshing && memberships.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4F46E5" />
          <Text style={styles.loadingText}>Loading membership plans...</Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#4F46E5"]} />}
        >
          {/* Plans section */}
          <Text style={styles.sectionTitle}>Available Plans</Text>

          {memberships.length === 0 && !loading ? (
            <View style={styles.emptyStateContainer}>
              <Icon name="package-variant" size={60} color="#CBD5E1" />
              <Text style={styles.emptyStateTitle}>No Plans Available</Text>
              <Text style={styles.emptyStateMessage}>
                We couldn't find any membership plans. Pull down to refresh or try again later.
              </Text>
            </View>
          ) : (
            <View style={styles.plansContainer}>{memberships.map(renderPlanCard)}</View>
          )}

          {/* Spacer for bottom button */}
          <View style={{ height: 100 }} />
        </ScrollView>
      )}

      {/* Payment button */}
      {selectedPlan && (
        <View style={styles.paymentButtonContainer}>
          <TouchableOpacity
            style={[styles.paymentButton, loading && styles.paymentButtonDisabled]}
            onPress={initiatePayment}
            disabled={loading}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={["#4F46E5", "#7C3AED"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.paymentButtonGradient}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <Icon name="credit-card-outline" size={20} color="#FFFFFF" />
                  <Text style={styles.paymentButtonText}>Pay ₹{selectedPlan.price} with Razorpay</Text>
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </View>
      )}

      {/* Payment status modal */}
      {renderPaymentStatusModal()}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#64748B",
  },
  walletContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F1F5F9",
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 20,
    marginTop: 16,
    borderRadius: 12,
  },
  walletText: {
    fontSize: 14,
    color: "#334155",
    marginLeft: 8,
  },
  walletAmount: {
    fontWeight: "700",
    color: "#4F46E5",
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 40,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#0F172A",
    marginBottom: 16,
  },
  plansContainer: {
    alignItems: "center",
  },
  planCard: {
    width: CARD_WIDTH,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    marginBottom: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  selectedPlanCard: {
    borderWidth: 2,
    borderColor: "#4F46E5",
  },
  planCardTouchable: {
    width: "100%",
  },
  planHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  planTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  priceBadge: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  priceText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  planContent: {
    padding: 16,
  },
  validityText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#334155",
    marginBottom: 12,
  },
  featureRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  featureText: {
    fontSize: 14,
    color: "#475569",
    marginLeft: 8,
  },
  selectedIndicator: {
    position: "absolute",
    top: 12,
    right: 12,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 2,
  },
  paymentButtonContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 8,
  },
  paymentButton: {
    borderRadius: 12,
    overflow: "hidden",
  },
  paymentButtonDisabled: {
    opacity: 0.7,
  },
  paymentButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
  },
  paymentButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
    marginLeft: 8,
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  loadingText: {
    fontSize: 16,
    color: "#64748B",
    marginTop: 12,
  },
  emptyStateContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    marginTop: 20,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#334155",
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateMessage: {
    fontSize: 14,
    color: "#64748B",
    textAlign: "center",
    lineHeight: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  modalContent: {
    width: "90%",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
  },
  lottieAnimation: {
    width: 120,
    height: 120,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#0F172A",
    marginTop: 16,
    marginBottom: 8,
    textAlign: "center",
  },
  modalMessage: {
    fontSize: 14,
    color: "#64748B",
    textAlign: "center",
    lineHeight: 20,
  },
  modalButton: {
    backgroundColor: "#4F46E5",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 20,
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
})

export default MakeRechargeScreen
