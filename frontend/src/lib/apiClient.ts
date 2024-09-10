import { parseCookies } from 'nookies';
import axios, { InternalAxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { toast } from 'sonner';

const getToken = () => {
    const cookies = parseCookies();
    return cookies.access;
};

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
});

apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

export const apiRequest = async (
  method: 'get' | 'post' | 'delete',
  url: string,
  handleErrors: boolean,
  data?: any,
  config?: InternalAxiosRequestConfig,
): Promise<any> => {
  try {
    const response: AxiosResponse = await apiClient({ method, url, data, ...config });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (!handleErrors) {
        throw error;
      }
      
      let errorDetail = error.response?.data.detail || error.response?.data.details || 'Internal server error. Please try again later.';

      toast.error('An error occurred', { description: errorDetail });
    }
    
    throw error;
  }
};
