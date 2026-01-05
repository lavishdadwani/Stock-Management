import { Router } from 'express';
import { Auth } from '../middleware/auth.js';
import {
  register,
  login,
  verifyEmail,
  verifyEmailAuthenticated,
  resendVerification,
  forgotPassword,
  resetPassword,
  changePassword,
  getCurrentUser,
  updateProfile,
  logout,
} from '../controllers/userController.js';

const router = Router();

// Public routes
router.post('/user/register', register);
router.post('/user/login', login);
router.get('/user/verify-email/:token', verifyEmail);
router.post('/user/resend-verification', resendVerification);
router.post('/user/forgot-password', forgotPassword);
router.post('/user/reset-password/:token', resetPassword);

// Protected routes
router.get('/user/me', Auth, getCurrentUser);
router.post('/user/verify-email', Auth, verifyEmailAuthenticated);
router.patch('/user/profile', Auth, updateProfile);
router.patch('/user/change-password', Auth, changePassword);
router.delete('/user/logout', Auth, logout);

export default router;
