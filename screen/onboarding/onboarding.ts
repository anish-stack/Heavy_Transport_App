import { StyleSheet, Platform } from "react-native";
import {
  moderateScale,
  moderateVerticalScale,
  scale,
  verticalScale,
} from "react-native-size-matters";
import { COLORS, Sizes } from "../../constant/Colors";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
    justifyContent: "flex-start",
    alignItems: "center",
  },
  imageContainer: {
    width: "100%",
    height: moderateVerticalScale(400),
    justifyContent: "center",
    alignItems: "center",
  },
  image: {
    width: "100%",
    height: "100%",
    borderRadius: moderateScale(15),
  },
  textContainer: {
    paddingHorizontal: moderateScale(20),
    marginVertical: moderateVerticalScale(40),
    alignItems: "center",
  },
  title: {
    fontSize: moderateScale(24),
    fontWeight: "bold",
    color: COLORS.dark,
    textAlign: "center",
    marginBottom: moderateVerticalScale(5),
  },
  description: {
    fontSize: moderateScale(16),
    color: COLORS.lightDark,
    textAlign: "center",
    marginBottom: moderateVerticalScale(20),
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    width: "100%",
    paddingHorizontal: moderateScale(14),
  },
  button: {
    backgroundColor: COLORS.dark,
    paddingVertical: moderateVerticalScale(12),
    paddingHorizontal: moderateScale(35),
    flex: 1,
    borderRadius: Sizes.borderRadius,
    marginHorizontal: moderateScale(10),
    justifyContent: "center",
    alignItems: "center",
  },
  buttonText: {
    fontSize: moderateScale(16),
    color: COLORS.white,
    fontWeight: "600",
  },
});

export default styles;
