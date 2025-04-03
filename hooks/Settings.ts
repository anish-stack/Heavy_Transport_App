import { useState, useEffect } from 'react';
import axios from 'axios'
import { API_URL_APP } from '../constant/Api';
const useSettings = () => {
    const [settings, setSettings] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const getSettings = async () => {
            setLoading(true)
            try {
                const response = await axios.get(`${API_URL_APP}/api/v1/admin/get_Setting`)
                setSettings(response.data);
            } catch (err) {
                setError(err);
            } finally {
                setLoading(false);
            }
        };

        getSettings();
    }, []);

    return { settings, loading, error };
};

export default useSettings;