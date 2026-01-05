import User from '../models/user.model.js';
import { compare } from 'bcrypt';
import {
  validateRegisterData,
  validateLoginData,
  validateChangePasswordData,
  validateResetPasswordData,
  validateProfileUpdateData,
  validateEmail,
} from '../utils/validation.js';
import {
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendWelcomeEmail,
} from '../utils/emailService.js';

/**
 * @route   POST /user/register
 * @desc    Register a new user
 * @access  Public
 */
const register = async (req, res) => {
  try {
    const validation = validateRegisterData(req.body);
    
    if (!validation.isValid) {
      return res.error(
        Object.values(validation.errors)[0],
        validation.errors,
        null,
        422
      );
    }

    const { email, password, name, number, role } = validation.data;

    // Check if user already exists
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.error(
        'User with this email already exists',
        null,
        null,
        409
      );
    }

    // Create new user
    const user = new User({
      name,
      email,
      number,
      password,
      role: role || 'manager',
    });

    await user.save();

    const verificationToken = await user.generateEmailVerificationToken();

    // Send verification email
    try {
      await sendVerificationEmail(user.email, user.name, verificationToken);
    } catch (emailError) {
      console.error('Email sending failed:', emailError);
      // Continue even if email fails - user can request resend
    }

    // Generate auth token
    const token = await user.generateToken();

    return res.success(
      'User registered successfully. Please verify your email.',
      {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          number: user.number,
          role: user.role,
          isEmailVerified: user.isEmailVerified,
        },
        token,
      },
      'Registration successful',
      201
    );
  } catch (err) {
    console.error('Registration error:', err);
    if (err.name === 'ValidationError') {
      return res.error('Validation error', err.message, null, 400);
    }
    if (err.code === 11000) {
      return res.error('User with this email already exists', null, null, 409);
    }
    return res.error('Server error during registration', err, null, 500);
  }
};

/**
 * @route   POST /user/login
 * @desc    Login user
 * @access  Public
 */
const login = async (req, res) => {
  try {
    const validation = validateLoginData(req.body);
    
    if (!validation.isValid) {
      return res.error(
        Object.values(validation.errors)[0],
        validation.errors,
        null,
        422
      );
    }

    const { email, password } = validation.data;

    const user = await User.findByEmailAndPassword(email, password);
    const token = await user.generateToken();

    return res.success(
      'Login successful',
      {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          number: user.number,
          role: user.role,
          photo: user.photo,
          isEmailVerified: user.isEmailVerified,
        },
        token,
      },
      'Welcome back!'
    );
  } catch (err) {
    console.error('Login error:', err);
    if (err.message === 'User not found' || err.message === 'Invalid password') {
      return res.error('Invalid email or password', null, null, 401);
    }
    if (err.message === 'Account is deactivated') {
      return res.unauthorized('Account is deactivated. Please contact administrator.');
    }
    return res.error('Server error during login', err, null, 500);
  }
};

/**
 * @route   GET /user/verify-email/:token
 * @desc    Verify user email
 * @access  Public
 */
const verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;

    const user = await User.findUserByEmailVerificationToken(token);

    if (user.isEmailVerified) {
      return res.error('Email already verified', null, null, 400);
    }

    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();

    // Send welcome email
    try {
      await sendWelcomeEmail(user.email, user.name);
    } catch (emailError) {
      console.error('Welcome email failed:', emailError);
    }

    return res.success('Email verified successfully', null, 'Email verified');
  } catch (err) {
    console.error('Email verification error:', err);
    return res.error(
      err.message || 'Invalid or expired verification token',
      null,
      null,
      400
    );
  }
};

/**
 * @route   POST /user/resend-verification
 * @desc    Resend email verification
 * @access  Public
 */
const resendVerification = async (req, res) => {
  try {
    const emailValidation = validateEmail(req.body.email);
    
    if (!emailValidation.isValid) {
      return res.error(emailValidation.error, null, null, 422);
    }

    const { value: email } = emailValidation;
    const user = await User.findByEmail(email);

    if (!user) {
      return res.error('User not found', null, null, 404);
    }

    if (user.isEmailVerified) {
      return res.error('Email already verified', null, null, 400);
    }

    const verificationToken = await user.generateEmailVerificationToken();

    try {
      await sendVerificationEmail(user.email, user.name, verificationToken);
      return res.success('Verification email sent successfully', null, 'Email sent');
    } catch (emailError) {
      return res.error('Failed to send verification email', emailError, null, 500);
    }
  } catch (err) {
    console.error('Resend verification error:', err);
    return res.error('Server error', err, null, 500);
  }
};

/**
 * @route   POST /user/verify-email
 * @desc    Verify email for authenticated user
 * @access  Private
 */
const verifyEmailAuthenticated = async (req, res) => {
  try {
    const user = req.user;

    if (!user) {
      return res.error('User not found', null, null, 404);
    }

    if (user.isEmailVerified) {
      return res.error('Email already verified', null, null, 400);
    }

    // Verify the email
    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();

    // Send welcome email
    try {
      await sendWelcomeEmail(user.email, user.name);
    } catch (emailError) {
      console.error('Welcome email failed:', emailError);
    }

    return res.success(
      'Email verified successfully',
      { user },
      'Email verified'
    );
  } catch (err) {
    console.error('Email verification error:', err);
    return res.error(
      err.message || 'Failed to verify email',
      null,
      null,
      500
    );
  }
};

/**
 * @route   POST /user/forgot-password
 * @desc    Request password reset
 * @access  Public
 */
const forgotPassword = async (req, res) => {
  try {
    const emailValidation = validateEmail(req.body.email);
    
    if (!emailValidation.isValid) {
      return res.error(emailValidation.error, null, null, 422);
    }

    const { value: email } = emailValidation;
    const user = await User.findByEmail(email);

    // Don't reveal if user exists or not for security
    if (!user) {
      return res.success(
        'If an account exists with this email, a password reset link has been sent.',
        null,
        'Check your email'
      );
    }

    const resetToken = await user.generatePasswordResetToken();

    try {
      await sendPasswordResetEmail(user.email, user.name, resetToken);
      return res.success('Password reset email sent successfully', null, 'Check your email');
    } catch (emailError) {
      return res.error('Failed to send password reset email', emailError, null, 500);
    }
  } catch (err) {
    console.error('Forgot password error:', err);
    return res.error('Server error', err, null, 500);
  }
};

/**
 * @route   POST /user/reset-password/:token
 * @desc    Reset password with token
 * @access  Public
 */
const resetPassword = async (req, res) => {
  try {
    const validation = validateResetPasswordData(req.body);
    
    if (!validation.isValid) {
      return res.error(
        Object.values(validation.errors)[0],
        validation.errors,
        null,
        422
      );
    }

    const { token } = req.params;
    const { password } = validation.data;

    const user = await User.findUserByPasswordResetToken(token);

    // Set password directly - pre-save hook will hash it
    user.password = password;
    await user.clearPasswordResetToken();

    // Invalidate all existing tokens (force re-login)
    user.token = null;
    await user.save();

    return res.success(
      'Password reset successfully. Please login with your new password.',
      null,
      'Password reset successful'
    );
  } catch (err) {
    console.error('Reset password error:', err);
    return res.error(
      err.message || 'Invalid or expired reset token',
      null,
      null,
      400
    );
  }
};

/**
 * @route   PATCH /user/change-password
 * @desc    Change password (authenticated user)
 * @access  Private
 */
const changePassword = async (req, res) => {
  try {
    const validation = validateChangePasswordData(req.body);
    
    if (!validation.isValid) {
      return res.error(
        Object.values(validation.errors)[0],
        validation.errors,
        null,
        422
      );
    }

    const user = req.user;
    const { currentPassword, newPassword } = validation.data;

    // Verify current password
    const isMatch = await compare(currentPassword, user.password);
    if (!isMatch) {
      return res.error('Current password is incorrect', null, null, 401);
    }

    // Check if new password is same as current
    const isSame = await compare(newPassword, user.password);
    if (isSame) {
      return res.error(
        'New password must be different from current password',
        null,
        null,
        400
      );
    }

    // Update password
    user.password = newPassword;
    await user.save();

    return res.success('Password changed successfully', null, 'Password updated');
  } catch (err) {
    console.error('Change password error:', err);
    return res.error('Server error', err, null, 500);
  }
};

/**
 * @route   GET /user/me
 * @desc    Get current user profile
 * @access  Private
 */
const getCurrentUser = async (req, res) => {
  try {
    const user = req.user;
    return res.success(
      'User profile retrieved successfully',
      {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          number: user.number,
          role: user.role,
          photo: user.photo,
          isEmailVerified: user.isEmailVerified,
          isActive: user.isActive,
          createdAt: user.createdAt,
          lastLogin: user.lastLogin,
        },
      },
      'Profile loaded'
    );
  } catch (err) {
    console.error('Get user error:', err);
    return res.error('Server error', err, null, 500);
  }
};

/**
 * @route   PATCH /user/profile
 * @desc    Update user profile
 * @access  Private
 */
const updateProfile = async (req, res) => {
  try {
    const validation = validateProfileUpdateData(req.body);
    
    if (!validation.isValid) {
      return res.error(
        Object.values(validation.errors)[0],
        validation.errors,
        null,
        422
      );
    }

    const user = req.user;
    const { name, number, photo } = validation.data;

    const updateFields = {};
    if (name) updateFields.name = name;
    if (number) updateFields.number = number;
    if (photo !== undefined) updateFields.photo = photo;

    Object.assign(user, updateFields);
    await user.save();

    return res.success(
      'Profile updated successfully',
      {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          number: user.number,
          role: user.role,
          photo: user.photo,
          isEmailVerified: user.isEmailVerified,
        },
      },
      'Profile updated'
    );
  } catch (err) {
    console.error('Update profile error:', err);
    return res.error('Server error', err, null, 500);
  }
};

/**
 * @route   DELETE /user/logout
 * @desc    Logout user
 * @access  Private
 */
const logout = async (req, res) => {
  try {
    const user = req.user;
    user.token = null;
    await user.save();

    return res.success('Logged out successfully', null, 'Goodbye!');
  } catch (err) {
    console.error('Logout error:', err);
    return res.error('Server error', err, null, 500);
  }
};

export {
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
};

