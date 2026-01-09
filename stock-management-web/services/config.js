import axios from 'axios'

import {create} from "apisauce"

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/';

const customAxiosInstance = axios.create({
    baseURL: API_BASE_URL,
    headers: {
      'Content-Type': 'application/json',
    },
  });

// Add request interceptor to automatically attach token from localStorage
customAxiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = token;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

const client = create({axiosInstance:customAxiosInstance})

export const normalizeAxiosResponse = (axiosResponse) => {
    const status = axiosResponse.status
    const ok = status >= 200 && status < 300

    return {
        ok,
        status,
        data: axiosResponse.data,
        problem: ok ? null : 'CLIENT_ERROR',
        originalError: ok ? null : axiosResponse
    }
}

export default {client}