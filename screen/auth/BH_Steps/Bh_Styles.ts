import { StyleSheet, Platform } from "react-native";
import {
  moderateScale,
  moderateVerticalScale,
  scale,
  verticalScale,
} from "react-native-size-matters";
import { COLORS, Sizes } from "../../../constant/Colors";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
    justifyContent: "center",
    alignItems: "center",
  },
  card: {
    width: "90%",
    padding: moderateScale(20),
    backgroundColor: COLORS.lightDark,
    borderRadius: Sizes.borderRadius,
    alignItems: "center",
    shadowColor: COLORS.dark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  logo: {
    width: scale(100),
    height: verticalScale(100),
    marginBottom: moderateVerticalScale(20),
  },
  title: {
    fontSize: moderateScale(24),
    fontWeight: "bold",
    color: COLORS.white,
    marginBottom: moderateVerticalScale(10),
  },
  subtitle: {
    fontSize: moderateScale(16),
    color: COLORS.lightPrimary,
    marginBottom: moderateVerticalScale(20),
    textAlign: "center",
  },
  input: {
    width: "100%",
    height: verticalScale(50),
    backgroundColor: COLORS.white,
    borderColor: COLORS.lightAccent,
    borderWidth: 1,
    borderRadius: Sizes.borderRadius,
    paddingHorizontal: moderateScale(15),
    marginBottom: moderateVerticalScale(20),
    color: COLORS.dark,
  },
  button: {
    backgroundColor: COLORS.white,
    paddingVertical: moderateVerticalScale(12),
    paddingHorizontal: moderateScale(20),
    borderRadius: Sizes.borderRadius,
    marginTop: moderateVerticalScale(10),
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    fontSize: moderateScale(16),
    color: COLORS.dark,
    fontWeight: "600",
  },
  successBox: {
    backgroundColor: COLORS.success,
    padding: moderateScale(10),
    marginTop: moderateVerticalScale(10),
    borderRadius: Sizes.borderRadius,
  },
  successText: {
    color: COLORS.white,
    fontSize: moderateScale(14),
  },
  errorBox: {
    backgroundColor: COLORS.error,
    padding: moderateScale(10),
    marginTop: moderateVerticalScale(10),
    borderRadius: Sizes.borderRadius,
  },
  errorText: {
    color: COLORS.white,
    fontSize: moderateScale(14),
  },
});

export default styles;
