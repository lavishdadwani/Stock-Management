import axios from 'axios'

import {create} from "apisauce"

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const customAxiosInstance = axios.create({
    baseURL: API_BASE_URL,
    headers: {
      'Content-Type': 'application/json',
    },
  });

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