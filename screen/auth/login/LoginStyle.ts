import { StyleSheet } from "react-native"
import { moderateScale, scale, verticalScale } from "react-native-size-matters"
import { COLORS, Sizes } from "../../../constant/Colors"

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: COLORS.white,
  },
  imageContainer: {
    width: "100%",
    height: verticalScale(350),
    overflow: "hidden",
  },
  headerImage: {
    width: "100%",
    height: "100%",
  },
  contentContainer: {
    flex: 1,
    padding: Sizes.padding,
    paddingTop: Sizes.padding * 1.5,
  },
  title: {
    fontSize: moderateScale(24),
    fontWeight: "bold",
    color: COLORS.dark,
    marginBottom: Sizes.spacingMedium,
  },
  formContainer: {
    marginTop: Sizes.spacingMedium,
  },
  button: {
    backgroundColor: COLORS.primary,
    height: Sizes.buttonHeight,
    borderRadius: Sizes.borderRadius,
    justifyContent: "center",
    alignItems: "center",
    marginTop: Sizes.spacingLarge,
    shadowColor: COLORS.dark,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  disabledButton: {
    opacity: 0.7,
  },
  buttonText: {
    color: COLORS.dark,
    fontSize: moderateScale(16),
    fontWeight: "600",
  },
  errorContainer: {
    backgroundColor: COLORS.lightSecondary,
    padding: Sizes.spacingMedium,
    borderRadius: Sizes.borderRadius,
    marginBottom: Sizes.spacingMedium,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.error,
  },
  errorText: {
    color: COLORS.error,
    fontSize: moderateScale(14),
  },
  resendButton: {
    alignSelf: "center",
    marginTop: Sizes.spacingMedium,
    padding: Sizes.spacingSmall,
  },
  resendText: {
    color: COLORS.darkPrimary,
    fontSize: moderateScale(14),
    textDecorationLine: "underline",
  },
  successContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: Sizes.spacingXLarge,
  },
  successImage: {
    width: scale(150),
    height: scale(150),
    borderRadius: scale(75),
    marginBottom: Sizes.spacingLarge,
  },
  successText: {
    fontSize: moderateScale(22),
    fontWeight: "bold",
    color: COLORS.success,
    marginBottom: Sizes.spacingSmall,
  },
  successSubText: {
    fontSize: moderateScale(16),
    color: COLORS.dark,
    textAlign: "center",
  },
})

export default styles

