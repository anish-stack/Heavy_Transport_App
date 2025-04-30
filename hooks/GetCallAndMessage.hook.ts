import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { API_URL_APP } from '../constant/Api';
import { useAuth } from '../context/AuthContext';

const useCallAndMessage = () => {
  const [message, setMessage] = useState([]);
  const [calls, setCalls] = useState([]);
  const [loading, setLoading] = useState(false);
  const { appUser } = useAuth();

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const userId = appUser?._id;
      if (!userId) return;

      const response = await axios.get(
        `${API_URL_APP}/api/v1/heavy/get-all-call-and-message-request-by-partner/${userId}`
      );

      const allData = response.data?.data || [];

      const filteredCalls = allData.filter(item => item?.requestType === 'call');
    //   console.log("filteredCalls",filteredCalls)
      const filteredMessages = allData.filter(item => item?.requestType !== 'call');

      setCalls(filteredCalls);
      setMessage(filteredMessages);
    } catch (error) {
      console.error('Error fetching call and message data:', error);
    } finally {
      setLoading(false);
    }
  }, [appUser]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { message, calls, loading, refresh: fetchData };
};

export default useCallAndMessage;
