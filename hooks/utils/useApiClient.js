import { useState, useCallback } from 'react';
import { apiClient, axiosAuth } from '../../utils/apiClient';

export function useApiClient() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Para fetch
  const fetchWithAuth = useCallback(async (endpoint, options = {}) => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiClient.fetchWithAuth(endpoint, options);
      return data;
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Para axios (ya configurado automáticamente)
  const axiosWithAuth = axiosAuth;

  return { fetchWithAuth, axiosWithAuth, loading, error };
}


