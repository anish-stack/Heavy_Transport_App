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

export const fetchVehicles = async (id: string): Promise<Vehicle[]> => {
  console.log("id", id);
  try {
    const response: AxiosResponse<Vehicle[]> = await axios.get(
      `${API_URL_APP_LOCAL}/heavy/heavy-vehicle?categoryId=${id}&limit=50`
    );
    console.log(response.data);
    return response.data;
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
