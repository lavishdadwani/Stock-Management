import apiConfig, { normalizeAxiosResponse } from "./config.js";

const client = apiConfig.client;

// Set auth token in request headers
const setAuthToken = (token) => {
  if (token) {
    client.setHeader('Authorization', token);
  } else {
    client.deleteHeader('Authorization');
  }
};

// Get token from localStorage
const getToken = () => {
  return localStorage.getItem('token');
};

// User API functions
export const userAPI = {
  // Register a new user
  register: async (userData) => {
    const token = getToken();
    if (token) setAuthToken(token);
    
    const response = await client.post('/user/register', userData);
    return normalizeAxiosResponse(response);
  },

  // Login user
  login: async (credentials) => {
    const token = getToken();
    if (token) setAuthToken(token);
    
    const response = await client.post('/user/login', credentials);
    return normalizeAxiosResponse(response);
  },

  // Logout user
  logout: async () => {
    const token = getToken();
    if (token) setAuthToken(token);
    
    const response = await client.delete('/user/logout');
    return normalizeAxiosResponse(response);
  },

  // Verify email (with token)
  verifyEmail: async (token) => {
    const response = await client.get(`/user/verify-email/${token}`);
    return normalizeAxiosResponse(response);
  },

  // Verify email (authenticated user)
  verifyEmailAuthenticated: async () => {
    const token = getToken();
    if (token) setAuthToken(token);
    
    const response = await client.post('/user/verify-email');
    return normalizeAxiosResponse(response);
  },

  // Resend verification email
  resendVerification: async (email) => {
    const response = await client.post('/user/resend-verification', { email });
    return normalizeAxiosResponse(response);
  },

  // Forgot password
  forgotPassword: async (email) => {
    const response = await client.post('/user/forgot-password', { email });
    return normalizeAxiosResponse(response);
  },

  // Reset password
  resetPassword: async (token, password, confirmPassword) => {
    const response = await client.post(`/user/reset-password/${token}`, { 
      password,
      confirmPassword 
    });
    return normalizeAxiosResponse(response);
  },

  // Change password (authenticated)
  changePassword: async (passwordData) => {
    const token = getToken();
    if (token) setAuthToken(token);
    
    const response = await client.patch('/user/change-password', passwordData);
    return normalizeAxiosResponse(response);
  },

  // Get current user
  getCurrentUser: async () => {
    const token = getToken();
    if (token) setAuthToken(token);
    
    const response = await client.get('/user/me');
    return normalizeAxiosResponse(response);
  },

  // Update user profile
  updateProfile: async (profileData) => {
    const token = getToken();
    if (token) setAuthToken(token);
    
    const response = await client.patch('/user/profile', profileData);
    return normalizeAxiosResponse(response);
  },
};

// Initialize token on module load
const initToken = () => {
  const token = getToken();
  if (token) {
    setAuthToken(token);
  }
};

initToken();

export default userAPI;
