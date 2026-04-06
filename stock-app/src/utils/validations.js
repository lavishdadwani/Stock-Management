export const validateEmail = (email) => {
  if (!email) {
    return "Email is required";
  }

  const emailRegex = /\S+@\S+\.\S+/;

  if (!emailRegex.test(email)) {
    return "Invalid email format";
  }

  return null;
};

export const validatePassword = (password) => {
  if (!password) {
    return "Password is required";
  }

  return null;
};

export const validateLogin = ({ email, password }) => {
  const errors = {};

  const emailError = validateEmail(email);
  if (emailError) {
    errors.email = emailError;
  }

  const passwordError = validatePassword(password);
  if (passwordError) {
    errors.password = passwordError;
  }

  return errors;
};
