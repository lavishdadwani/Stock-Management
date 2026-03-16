/**
 * Validation helper functions
 */

const validateEmail = (email) => {
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

const validatePassword = (password) => {
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

const validateName = (name) => {
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

const validatePhoneNumber = (number) => {
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

const validateRole = (role) => {
  const validRoles = ['manager', 'owner', 'core team'];
  
  if (!role) {
    return { isValid: true, value: 'manager' }; // Default role
  }
  
  if (!validRoles.includes(role)) {
    return { isValid: false, error: 'Role must be one of: manager, owner, core team' };
  }
  
  return { isValid: true, value: role };
};

const validateRegisterData = (data) => {
  const errors = {};
  const validated = {};
  
  // Validate name
  const nameValidation = validateName(data.name);
  if (!nameValidation.isValid) {
    errors.name = nameValidation.error;
  } else {
    validated.name = nameValidation.value;
  }
  
  // Validate email
  const emailValidation = validateEmail(data.email);
  if (!emailValidation.isValid) {
    errors.email = emailValidation.error;
  } else {
    validated.email = emailValidation.value;
  }
  
  // Validate phone number
  const phoneValidation = validatePhoneNumber(data.number);
  if (!phoneValidation.isValid) {
    errors.number = phoneValidation.error;
  } else {
    validated.number = phoneValidation.value;
  }
  
  // Validate password
  const passwordValidation = validatePassword(data.password);
  if (!passwordValidation.isValid) {
    errors.password = passwordValidation.error;
  } else {
    validated.password = passwordValidation.value;
  }
  
  // Validate role (optional)
  const roleValidation = validateRole(data.role);
  if (!roleValidation.isValid) {
    errors.role = roleValidation.error;
  } else {
    validated.role = roleValidation.value;
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    data: validated,
  };
};

const validateLoginData = (data) => {
  const errors = {};
  const validated = {};
  
  // Validate email
  const emailValidation = validateEmail(data.email);
  if (!emailValidation.isValid) {
    errors.email = emailValidation.error;
  } else {
    validated.email = emailValidation.value;
  }
  
  // Validate password
  if (!data.password || typeof data.password !== 'string' || data.password.trim().length === 0) {
    errors.password = 'Password is required';
  } else {
    validated.password = data.password;
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    data: validated,
  };
};

const validateChangePasswordData = (data) => {
  const errors = {};
  const validated = {};
  
  if (!data.currentPassword || typeof data.currentPassword !== 'string' || data.currentPassword.trim().length === 0) {
    errors.currentPassword = 'Current password is required';
  } else {
    validated.currentPassword = data.currentPassword;
  }
  
  const passwordValidation = validatePassword(data.newPassword);
  if (!passwordValidation.isValid) {
    errors.newPassword = passwordValidation.error;
  } else {
    validated.newPassword = passwordValidation.value;
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    data: validated,
  };
};

const validateResetPasswordData = (data) => {
  const errors = {};
  const validated = {};
  
  // Validate password
  const passwordValidation = validatePassword(data.password);
  if (!passwordValidation.isValid) {
    errors.password = passwordValidation.error;
  } else {
    validated.password = passwordValidation.value;
  }
  
  // Validate confirmPassword
  if (!data.confirmPassword || typeof data.confirmPassword !== 'string') {
    errors.confirmPassword = 'Please confirm your password';
  } else if (data.password !== data.confirmPassword) {
    errors.confirmPassword = 'Passwords do not match';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    data: validated,
  };
};

const validateProfileUpdateData = (data) => {
  const errors = {};
  const validated = {};
  
  if (data.name !== undefined) {
    const nameValidation = validateName(data.name);
    if (!nameValidation.isValid) {
      errors.name = nameValidation.error;
    } else {
      validated.name = nameValidation.value;
    }
  }
  
  if (data.number !== undefined) {
    const phoneValidation = validatePhoneNumber(data.number);
    if (!phoneValidation.isValid) {
      errors.number = phoneValidation.error;
    } else {
      validated.number = phoneValidation.value;
    }
  }
  
  if (data.photo !== undefined) {
    validated.photo = typeof data.photo === 'string' ? data.photo.trim() : null;
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    data: validated,
  };
};

const validateQuantity = (quantity, fieldName = 'Quantity') => {
  if (quantity === undefined || quantity === null || quantity === '') {
    return { isValid: false, error: `${fieldName} is required` };
  }
  
  const numValue = parseFloat(quantity);
  
  if (isNaN(numValue)) {
    return { isValid: false, error: `${fieldName} must be a valid number` };
  }
  
  if (numValue < 0) {
    return { isValid: false, error: `${fieldName} cannot be negative` };
  }
  
  return { isValid: true, value: numValue };
};

const validateWireType = (wireType) => {
  const validTypes = ['aluminium', 'copper'];
  
  if (!wireType || typeof wireType !== 'string') {
    return { isValid: false, error: 'Wire type is required' };
  }
  
  const normalizedType = wireType.toLowerCase().trim();
  
  if (!validTypes.includes(normalizedType)) {
    return { isValid: false, error: 'Wire type must be either "aluminium" or "copper"' };
  }
  
  return { isValid: true, value: normalizedType };
};

const validateItemProduced = (item) => {
  const errors = {};
  
  if (!item.itemName || typeof item.itemName !== 'string' || item.itemName.trim().length === 0) {
    errors.itemName = 'Item name is required';
  }
  
  const quantityValidation = validateQuantity(item.quantity, 'Item quantity');
  if (!quantityValidation.isValid) {
    errors.quantity = quantityValidation.error;
  }
  
  // Validate unit if provided
  if (item.unit) {
    const validUnits = ['kg', 'g', 'ton'];
    if (!validUnits.includes(item.unit.toLowerCase())) {
      errors.unit = `Unit must be one of: ${validUnits.join(', ')}`;
    }
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

const validateCheckoutData = (data) => {
  const errors = {};
  const validated = {};
  
  // Validate wire used type
  const wireTypeValidation = validateWireType(data.wireUsedType);
  if (!wireTypeValidation.isValid) {
    errors.wireUsedType = wireTypeValidation.error;
  } else {
    validated.wireUsedType = wireTypeValidation.value;
  }
  
  // Validate wire used quantity
  const wireQuantityValidation = validateQuantity(data.wireUsedQuantity, 'Wire used quantity');
  if (!wireQuantityValidation.isValid) {
    errors.wireUsedQuantity = wireQuantityValidation.error;
  } else {
    validated.wireUsedQuantity = wireQuantityValidation.value;
  }
  
  // Validate item produced (required object)
  if (!data.itemProduced || typeof data.itemProduced !== 'object') {
    errors.itemProduced = 'Item produced is required';
  } else {
    const itemValidation = validateItemProduced(data.itemProduced);
    if (!itemValidation.isValid) {
      errors.itemProduced = itemValidation.errors;
    } else {
      validated.itemProduced = {
        itemName: data.itemProduced.itemName.trim(),
        quantity: parseFloat(data.itemProduced.quantity),
        unit: (data.itemProduced.unit || 'kg').toLowerCase(),
        description: data.itemProduced.description ? data.itemProduced.description.trim() : null
      };
    }
  }
  
  // Validate scrap quantity (optional)
  if (data.scrapQuantity !== undefined && data.scrapQuantity !== null && data.scrapQuantity !== '') {
    const scrapValidation = validateQuantity(data.scrapQuantity, 'Scrap quantity');
    if (!scrapValidation.isValid) {
      errors.scrapQuantity = scrapValidation.error;
    } else {
      validated.scrapQuantity = scrapValidation.value;
    }
  }
  
  // Validate description (optional)
  if (data.description !== undefined && data.description !== null) {
    validated.description = typeof data.description === 'string' ? data.description.trim() : null;
  }
   
  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    data: validated,
  };
};

const validateStockTransferData = (data) => {
  const errors = {};
  const validated = {};
  
  if (!data.toUserId) {
    errors.toUserId = 'Recipient user ID is required';
  } else {
    validated.toUserId = data.toUserId;
  }
  
  if (!data.itemName || typeof data.itemName !== 'string') {
    errors.itemName = 'Item name is required';
  } else {
    const validItems = ['Aluminium', 'Copper', 'Scrap'];
    const normalizedItem = data.itemName.trim();
    if (!validItems.includes(normalizedItem)) {
      errors.itemName = `Item name must be one of: ${validItems.join(', ')}`;
    } else {
      validated.itemName = normalizedItem;
    }
  }
  
  const quantityValidation = validateQuantity(data.quantity, 'Quantity');
  if (!quantityValidation.isValid) {
    errors.quantity = quantityValidation.error;
  } else {
    validated.quantity = quantityValidation.value;
  }
  
  if (data.unit) {
    const validUnits = ['kg', 'g', 'ton'];
    const normalizedUnit = data.unit.toLowerCase();
    if (!validUnits.includes(normalizedUnit)) {
      errors.unit = `Unit must be one of: ${validUnits.join(', ')}`;
    } else {
      validated.unit = normalizedUnit;
    }
  } else {
    validated.unit = 'kg'; // Default unit
  }
  
  // Validate description (optional)
  if (data.description !== undefined && data.description !== null) {
    validated.description = typeof data.description === 'string' ? data.description.trim() : null;
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    data: validated,
  };
};

export {
  validateEmail,
  validatePassword,
  validateName,
  validatePhoneNumber,
  validateRole,
  validateRegisterData,
  validateLoginData,
  validateChangePasswordData,
  validateResetPasswordData,
  validateProfileUpdateData,
  validateCheckoutData,
  validateQuantity,
  validateWireType,
  validateItemProduced,
  validateStockTransferData,
};

