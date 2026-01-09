import apiConfig from "./config.js"

const register = (userData) => apiConfig.client.post("user/register", userData)

const login = (credentials) => apiConfig.client.post("user/login", credentials)

const logout = () => apiConfig.client.delete("user/logout")

const verifyEmail = (token) => apiConfig.client.get(`user/verify-email/${token}`)

const verifyEmailAuthenticated = () => apiConfig.client.post("user/verify-email")

const resendVerification = (email) => apiConfig.client.post("user/resend-verification", { email })

const forgotPassword = (email) => apiConfig.client.post("user/forgot-password", { email })

const resetPassword = (token, password, confirmPassword) => apiConfig.client.post(`user/reset-password/${token}`, { 
      password,
      confirmPassword 
})

const changePassword = (passwordData) => apiConfig.client.patch("user/change-password", passwordData)

const getCurrentUser = () => apiConfig.client.get("user/me")

const updateProfile = (profileData) => apiConfig.client.patch("user/profile", profileData)


export default {
  register,
  login,
  logout,
  verifyEmail,
  verifyEmailAuthenticated,
  resendVerification,
  forgotPassword,
  resetPassword,
  changePassword,
  getCurrentUser,
  updateProfile
}
