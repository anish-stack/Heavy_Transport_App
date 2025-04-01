import { StyleSheet, Platform } from "react-native"
import { moderateScale, scale, verticalScale } from "react-native-size-matters"
import { COLORS, Sizes } from "../../../constant/Colors"

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  contentContainer: {
    paddingBottom: verticalScale(30),
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: Sizes.padding,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightPrimary,
    backgroundColor: COLORS.white,
    ...Platform.select({
      ios: {
        shadowColor: COLORS.dark,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  headerTitle: {
    fontSize: moderateScale(18),
    fontWeight: "bold",
    color: COLORS.dark,
    marginLeft: Sizes.spacingMedium,
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.lightSecondary,
    padding: Sizes.spacingMedium,
    borderRadius: Sizes.borderRadius,
    margin: Sizes.margin,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.error,
  },
  errorText: {
    color: COLORS.error,
    fontSize: moderateScale(14),
    marginLeft: Sizes.spacingSmall,
    flex: 1,
  },
  formSection: {
    margin: Sizes.margin,
    marginBottom: Sizes.spacingLarge,
    backgroundColor: COLORS.white,
    borderRadius: Sizes.borderRadius,
    padding: Sizes.padding,
    ...Platform.select({
      ios: {
        shadowColor: COLORS.dark,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  sectionTitle: {
    fontSize: moderateScale(16),
    fontWeight: "bold",
    color: COLORS.dark,
    marginBottom: Sizes.spacingMedium,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightPrimary,
    paddingBottom: Sizes.spacingSmall,
  },
  dropdownButton: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.lightPrimary,
    borderRadius: Sizes.borderRadius,
    padding: Sizes.spacingMedium,
    marginBottom: Sizes.spacingMedium,
    backgroundColor: COLORS.white,
  },
  dropdownButtonText: {
    flex: 1,
    marginLeft: Sizes.spacingSmall,
    color: COLORS.dark,
    fontSize: moderateScale(14),
  },
  selectedItemsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: Sizes.spacingSmall,
  },
  selectedItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.darkPrimary,
    borderRadius: Sizes.borderRadius / 2,
    paddingHorizontal: Sizes.spacingSmall,
    paddingVertical: Sizes.xs,
    margin: Sizes.xs,
  },
  selectedItemText: {
    color: COLORS.white,
    fontSize: moderateScale(12),
    marginHorizontal: Sizes.xs,
  },
  inputWithButton: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Sizes.spacingMedium,
  },
  serviceAreaInput: {
    flex: 1,
    marginRight: Sizes.spacingSmall,
  },
  addButton: {
    backgroundColor: COLORS.darkPrimary,
    borderRadius: Sizes.borderRadius,
    width: scale(40),
    height: scale(40),
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "flex-end",
  },
  timePickerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  timePickerContainer: {
    width: "48%",
  },
  timePickerLabel: {
    fontSize: moderateScale(14),
    color: COLORS.dark,
    marginBottom: Sizes.spacingSmall,
  },
  timePicker: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.lightPrimary,
    borderRadius: Sizes.borderRadius,
    padding: Sizes.spacingMedium,
    backgroundColor: COLORS.white,
  },
  timePickerText: {
    marginLeft: Sizes.spacingSmall,
    color: COLORS.dark,
    fontSize: moderateScale(14),
  },
  submitButton: {
    flexDirection: "row",
    backgroundColor: COLORS.darkPrimary,
    borderRadius: Sizes.borderRadius,
    padding: Sizes.spacingMedium,
    margin: Sizes.margin,
    justifyContent: "center",
    alignItems: "center",
    ...Platform.select({
      ios: {
        shadowColor: COLORS.dark,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  disabledButton: {
    opacity: 0.7,
  },
  submitButtonText: {
    color: COLORS.white,
    fontSize: moderateScale(16),
    fontWeight: "bold",
    marginLeft: Sizes.spacingSmall,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: Sizes.borderRadius * 2,
    borderTopRightRadius: Sizes.borderRadius * 2,
    paddingBottom: Platform.OS === "ios" ? verticalScale(30) : verticalScale(20),
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: Sizes.padding,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightPrimary,
  },
  modalTitle: {
    fontSize: moderateScale(18),
    fontWeight: "bold",
    color: COLORS.dark,
  },
  modalList: {
    padding: Sizes.padding,
    maxHeight: verticalScale(400),
  },
  modalItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: Sizes.spacingMedium,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightPrimary,
  },
  modalItemSelected: {
    backgroundColor: COLORS.darkPrimary,
    borderRadius: Sizes.borderRadius,
    borderBottomWidth: 0,
  },
  modalItemText: {
    flex: 1,
    marginLeft: Sizes.spacingSmall,
    color: COLORS.dark,
    fontSize: moderateScale(14),
  },
  modalItemTextSelected: {
    color: COLORS.white,
  },
  modalLoader: {
    padding: Sizes.padding * 2,
  },
  modalDoneButton: {
    backgroundColor: COLORS.primary,
    margin: Sizes.margin,
    padding: Sizes.spacingMedium,
    borderRadius: Sizes.borderRadius,
    alignItems: "center",
  },
  modalDoneButtonText: {
    color: COLORS.dark,
    fontSize: moderateScale(16),
    fontWeight: "bold",
  },
})

export default styles

