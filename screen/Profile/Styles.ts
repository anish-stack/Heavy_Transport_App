import { StyleSheet } from "react-native"
import { moderateScale, scale, verticalScale } from "react-native-size-matters"
import { COLORS ,Sizes} from "../../constant/Colors"


const Styles = StyleSheet.create({
    profileContainer: {
        flexDirection: "row",
        alignItems: "center",
        margin: 20,
        padding: 20,
        borderRadius: 10,
        backgroundColor: "#f0fffe",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 3,
        elevation: 4,
      },
      imageSide: {
        marginRight: 20,
      },
      profileImage: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: "#ddd",
      },
      details: {
        flex: 1,
      },
      name: {
        fontSize: 20,
        fontWeight: "bold",
        color: "#003873",
      },
      email: {
        fontSize: 16,
        color: "#333",
      },
      phone: {
        fontSize: 16,
        color: "#4377a2",
      },
      status: {
        fontSize: 14,
        color: "#00aaa9",
      },
      workingStatus: {
        fontSize: 14,
        color: "#25d366",
      },
      serviceAreas: {
        marginHorizontal: 20,
        marginTop: 10,
      },
      sectionTitle: {
        fontSize: 18,
        fontWeight: "bold",
        marginBottom: 5,
        color: "#003873",
      },
      areaName: {
        fontSize: 16,
        color: "#555",
      },
      vehicleInfo: {
        marginHorizontal: 20,
        marginTop: 10,
      },
      vehicleName: {
        fontSize: 16,
        color: "#555",
      },
      actionLinks: {
        marginTop: 20,
        marginHorizontal: 20,
      },
      linkText: {
        fontSize: 16,
        marginVertical: 5,
        color: "#003873",
        textDecorationLine: "underline",
      },
      logoutLink: {
        fontSize: 18,
        marginVertical: 10,
        color: "#d64444",
        textAlign: "center",
        fontWeight: "bold",
      },
      loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      },
})

export default Styles
