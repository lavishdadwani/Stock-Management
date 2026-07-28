import { Router } from 'express';
import { Auth, authorize } from '../middleware/auth.js';
import { authLimiter } from '../middleware/rateLimit.js';
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
  getAllUsers,
  getUserById,
  updateUserByAdmin,
  deleteUserByAdmin,
  createUserCredentials,
} from '../controllers/userController.js';

const router = Router();

// Public routes
// router.post('/register', register); // Disabled: credentials are created from Users module by manager/owner
router.post('/login', authLimiter, login);
router.get('/verify-email/:token', verifyEmail);
router.post('/resend-verification', authLimiter, resendVerification);
router.post('/forgot-password', authLimiter, forgotPassword);
router.post('/reset-password/:token', authLimiter, resetPassword);

// Protected routes
router.get('/me', Auth, getCurrentUser);
router.get('/get-all', Auth, authorize('manager', 'owner', 'super_admin'), getAllUsers);
router.post('/create-credentials', Auth, authorize('manager', 'owner', 'super_admin'), createUserCredentials);
router.post('/verify-email', Auth, verifyEmailAuthenticated);
router.patch('/profile', Auth, updateProfile);
router.patch('/change-password', Auth, changePassword);
router.delete('/logout', Auth, logout);
router.get('/:id', Auth, authorize('manager', 'owner', 'super_admin'), getUserById);
router.patch('/:id', Auth, authorize('manager', 'owner', 'super_admin'), updateUserByAdmin);
router.delete('/:id', Auth, authorize('manager', 'owner', 'super_admin'), deleteUserByAdmin);

export default router;
