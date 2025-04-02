import axios, { AxiosResponse } from "axios";
import { API_URL_APP_LOCAL } from "../constant/Api";

interface Vehicle {
  id: string;
  name: string;
  vehicleType: string;
  isAvailable: boolean;
  categoryId: string;
  createdAt: string;
}

interface Category {
  id: string;
  title: string;
}

interface register {
  formData: Object;
}

interface RegisterRes {
  success: boolean;
  message: string;
  data?: any;
}
interface ResendOtp {
  phone_number: number;
}
interface token {
  token: String;
}

interface VerifyOtp {
  phone_number: number;
  otp: number;
}

export const fetchVehicles = async (id: string): Promise<Vehicle[]> => {
  try {
    const response: AxiosResponse<Vehicle[]> = await axios.get(
      `${API_URL_APP_LOCAL}/heavy/heavy-vehicle?categoryId=${id}&limit=50`
    );

    return response.data.data;
  } catch (error: any) {
    console.log(error);
    throw new Error(
      error.response?.data?.message || "Failed to fetch vehicles"
    );
  }
};

export const fetchVehiclesCategory = async (): Promise<Category[]> => {
  try {
    const response: AxiosResponse<Category[]> = await axios.get(
      `${API_URL_APP_LOCAL}/heavy/heavy-category?limit=50`
    );

    return response.data.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || "Failed to fetch vehicle categories"
    );
  }
};

export const RegisterVehiclesPartner = async (
  formData: register
): Promise<register[]> => {
  try {
    const response: AxiosResponse<register[]> = await axios.post(
      `${API_URL_APP_LOCAL}/heavy/heavy-vehicle-register`,
      formData
    );
    return response.data;
  } catch (error: any) {
    const errorMessage =
      error.response?.data?.message || "Failed to register vehicle";
    return Promise.reject({
      success: false,
      message: errorMessage,
      data: error.response?.data || null,
    });
  }
};

export const VerifyOtpOfPartner = async (
  formData: VerifyOtp
): Promise<RegisterRes> => {
  try {
    const response: AxiosResponse<RegisterRes> = await axios.post(
      `${API_URL_APP_LOCAL}/heavy/heavy-vehicle-verify-otp`,
      formData
    );
    console.log(response.data);

    return response.data;
  } catch (error: any) {
    const errorMessage =
      error.response?.data?.message || "Failed to verify OTP";
    return Promise.reject({
      success: false,
      message: errorMessage,
      data: error.response?.data || null,
    });
  }
};

export const resendOtpPartner = async (
  formData: ResendOtp
): Promise<RegisterRes> => {
  try {
    const response: AxiosResponse<RegisterRes> = await axios.post(
      `${API_URL_APP_LOCAL}/heavy/heavy-vehicle-resend-otp`,
      formData
    );
    console.log(response.data);
    return response.data;
  } catch (error: any) {
    const errorMessage =
      error.response?.data?.message || "Failed to resend OTP";
    return Promise.reject({
      success: false,
      message: errorMessage,
      data: error.response?.data || null,
    });
  }
};

export const getMyProfile = async (token: token): Promise<RegisterRes> => {

  try {
    const response: AxiosResponse<RegisterRes> = await axios.get(
      `${API_URL_APP_LOCAL}/heavy/heavy-vehicle-profile`,
      {
        headers: { Authorization: `Bearer ${token?.token}` },
      }
    );
    console.log(response.data);
    return response.data;
  } catch (error: any) {
    const errorMessage =
      error.response?.data?.message || "Failed to get profile";
    return Promise.reject({
      success: false,
      message: errorMessage,
      data: error.response?.data || null,
    });
  }
};
