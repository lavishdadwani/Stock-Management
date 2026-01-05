/**
 * Frontend validation helper functions
 */

export const validateEmail = (email) => {
  if (!email || typeof email !== 'string') {
    return { isValid: false, error: 'Email is required' };
  }
  
  const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
  const normalizedEmail = email.trim().toLowerCase();
  
  if (!emailRegex.test(normalizedEmail)) {
    return { isValid: false, error: 'Please enter a valid email address' };
  }
  
  return { isValid: true, value: normalizedEmail };
};

export const validatePassword = (password) => {
  if (!password || typeof password !== 'string') {
    return { isValid: false, error: 'Password is required' };
  }
  
  if (password.length < 8) {
    return { isValid: false, error: 'Password must be at least 8 characters long' };
  }
  
  if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
    return { isValid: false, error: 'Password must contain at least one uppercase letter, one lowercase letter, and one number' };
  }
  
  return { isValid: true, value: password };
};

export const validateName = (name) => {
  if (!name || typeof name !== 'string') {
    return { isValid: false, error: 'Name is required' };
  }
  
  const trimmedName = name.trim();
  
  if (trimmedName.length < 2) {
    return { isValid: false, error: 'Name must be at least 2 characters long' };
  }
  
  if (trimmedName.length > 100) {
    return { isValid: false, error: 'Name must be less than 100 characters' };
  }
  
  return { isValid: true, value: trimmedName };
};

export const validatePhoneNumber = (number) => {
  if (!number || typeof number !== 'string') {
    return { isValid: false, error: 'Phone number is required' };
  }
  
  const phoneRegex = /^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/;
  const trimmedNumber = number.trim();
  
  if (!phoneRegex.test(trimmedNumber)) {
    return { isValid: false, error: 'Please enter a valid phone number' };
  }
  
  return { isValid: true, value: trimmedNumber };
};

export const validateRole = (role, required = false) => {
  const validRoles = ['manager', 'owner', 'core team'];
  
  if (!role || role.trim() === '') {
    if (required) {
      return { isValid: false, error: 'Role is required' };
    }
    return { isValid: true, value: 'manager' };
  }
  
  if (!validRoles.includes(role)) {
    return { isValid: false, error: 'Role must be one of: manager, owner, core team' };
  }
  
  return { isValid: true, value: role };
};

export const validateRegisterForm = (data) => {
  const errors = {};
  
  const nameValidation = validateName(data.name);
  if (!nameValidation.isValid) errors.name = nameValidation.error;
  
  const emailValidation = validateEmail(data.email);
  if (!emailValidation.isValid) errors.email = emailValidation.error;
  
  const phoneValidation = validatePhoneNumber(data.number);
  if (!phoneValidation.isValid) errors.number = phoneValidation.error;
  
  const passwordValidation = validatePassword(data.password);
  if (!passwordValidation.isValid) errors.password = passwordValidation.error;
  
  if (data.confirmPassword && data.password !== data.confirmPassword) {
    errors.confirmPassword = 'Passwords do not match';
  }
  
  const roleValidation = validateRole(data.role, true);
  if (!roleValidation.isValid) errors.role = roleValidation.error;
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

export const validateLoginForm = (data) => {
  const errors = {};
  
  const emailValidation = validateEmail(data.email);
  if (!emailValidation.isValid) errors.email = emailValidation.error;
  
  if (!data.password || typeof data.password !== 'string' || data.password.trim().length === 0) {
    errors.password = 'Password is required';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

export const validateForgotPasswordForm = (data) => {
  const errors = {};
  
  const emailValidation = validateEmail(data.email);
  if (!emailValidation.isValid) errors.email = emailValidation.error;
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

export const validateResetPasswordForm = (data) => {
  const errors = {};
  
  const passwordValidation = validatePassword(data.password);
  if (!passwordValidation.isValid) errors.password = passwordValidation.error;
  
  if (data.confirmPassword && data.password !== data.confirmPassword) {
    errors.confirmPassword = 'Passwords do not match';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

export const validateChangePasswordForm = (data) => {
  const errors = {};
  
  if (!data.currentPassword || typeof data.currentPassword !== 'string' || data.currentPassword.trim().length === 0) {
    errors.currentPassword = 'Current password is required';
  }
  
  const passwordValidation = validatePassword(data.newPassword);
  if (!passwordValidation.isValid) errors.newPassword = passwordValidation.error;
  
  if (data.confirmPassword && data.newPassword !== data.confirmPassword) {
    errors.confirmPassword = 'Passwords do not match';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

