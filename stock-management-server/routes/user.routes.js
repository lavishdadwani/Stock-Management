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
router.post('/register', register);
router.post('/login', login);
router.get('/verify-email/:token', verifyEmail);
router.post('/resend-verification', resendVerification);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);

// Protected routes
router.get('/me', Auth, getCurrentUser);
router.post('/verify-email', Auth, verifyEmailAuthenticated);
router.patch('/profile', Auth, updateProfile);
router.patch('/change-password', Auth, changePassword);
router.delete('/logout', Auth, logout);

export default router;
