import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { API_URL_APP } from "../constant/Api";
import { useAuth } from "../context/AuthContext";

const useGetCoupons = () => {
  const [coupons, setCoupons] = useState([]);

  const [loading, setLoading] = useState(false);
  const { appUser } = useAuth();

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const userId = appUser?._id;
      if (!userId) return;

      const response = await axios.get(
        `${API_URL_APP}/api/v1/admin/personal-coupon/${userId}`
      );

      console.log(response?.data.data)
      const allData = response.data?.data || [];

      setCoupons(allData);
    } catch (error) {
      console.error("Error fetching call and message data:", error);
    } finally {
      setLoading(false);
    }
  }, [appUser]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { coupons, loading, refresh: fetchData };
};

export default useGetCoupons;
