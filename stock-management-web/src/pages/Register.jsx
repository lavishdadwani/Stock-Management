import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import { register } from '../redux/slices/authSlice';
import { showSnackbar } from '../redux/slices/snackbarSlice';
import Button from '../components/Button';
import Input from '../components/Input';
import InputPassword from '../components/InputPassword';
import Select from '../components/Select';
import Card from '../components/Card';
import PasswordStrength from '../components/PasswordStrength';

const Register = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((state) => state.auth);
  const { register: registerForm, handleSubmit, formState: { errors }, watch } = useForm({
    mode: 'onChange',
  });

  const [isLoading, setIsLoading] = useState(false);
  const password = watch('password', '');

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const onSubmit = async (data) => {
    // Additional validation for password match
    if (data.password !== data.confirmPassword) {
      return;
    }

    setIsLoading(true);
    
    try {
      const result = await dispatch(register(data));
      if (register.fulfilled.match(result)) {
        dispatch(showSnackbar({ 
          message: 'Registration successful! Please verify your email.', 
          severity: 'success' 
        }));
        navigate('/');
      } else {
        dispatch(showSnackbar({ 
          message: result.payload || 'Registration failed. Please try again.', 
          severity: 'error' 
        }));
      }
    } catch (err) {
      dispatch(showSnackbar({ 
        message: 'An error occurred. Please try again.', 
        severity: 'error' 
      }));
    } finally {
      setIsLoading(false);
    }
  };

  const roleOptions = [
    { value: 'manager', label: 'Manager' },
    { value: 'owner', label: 'Owner' },
    { value: 'core team', label: 'Core Team' },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-blue-600 mb-2">Stock Management</h1>
          <p className="text-gray-600">Create your account</p>
        </div>
        
        <Card>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="Full Name"
              name="name"
              type="text"
              register={registerForm('name', {
                required: 'Name is required',
                minLength: {
                  value: 2,
                  message: 'Name must be at least 2 characters'
                },
                maxLength: {
                  value: 100,
                  message: 'Name must be less than 100 characters'
                }
              })}
              error={errors.name}
              placeholder="Enter your full name"
              required
            />

            <Input
              label="Email Address"
              name="email"
              type="email"
              register={registerForm('email', {
                required: 'Email is required',
                pattern: {
                  value: /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
                  message: 'Please enter a valid email address'
                }
              })}
              error={errors.email}
              placeholder="Enter your email"
              required
            />

            <Input
              label="Phone Number"
              name="number"
              type="tel"
              register={registerForm('number', {
                required: 'Phone number is required',
                pattern: {
                  value: /^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{4,14}$/,
                  message: 'Please enter a valid phone number (10-15 digits)'
                },
                validate: (value) => {
                  // Remove all non-digit characters to count digits
                  const digitsOnly = value.replace(/\D/g, '');
                  if (digitsOnly.length < 10) {
                    return 'Phone number must have at least 10 digits';
                  }
                  if (digitsOnly.length > 15) {
                    return 'Phone number must not exceed 15 digits';
                  }
                  return true;
                }
              })}
              error={errors.number}
              placeholder="Enter your phone number"
              required
            />

            <Select
              label="Role"
              name="role"
              register={registerForm('role', {
                required: 'Role is required',
                validate: (value) => {
                  const validRoles = ['manager', 'owner', 'core team'];
                  if (!validRoles.includes(value)) {
                    return 'Role must be one of: manager, owner, core team';
                  }
                  return true;
                }
              })}
              options={roleOptions}
              error={errors.role}
              placeholder="Select your role"
              required
            />

            <div>
              <InputPassword
                label="Password"
                name="password"
                register={registerForm('password', {
                  required: 'Password is required',
                  minLength: {
                    value: 8,
                    message: 'Password must be at least 8 characters'
                  },
                  pattern: {
                    value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                    message: 'Password must contain at least one uppercase letter, one lowercase letter, and one number'
                  }
                })}
                error={errors.password}
                placeholder="Create a password"
                required
              />
              <PasswordStrength password={password} />
            </div>

            <InputPassword
              label="Confirm Password"
              name="confirmPassword"
              register={registerForm('confirmPassword', {
                required: 'Please confirm your password',
                validate: (value) => {
                  const passwordValue = watch('password');
                  if (value !== passwordValue) {
                    return 'Passwords do not match';
                  }
                  return true;
                }
              })}
              error={errors.confirmPassword}
              placeholder="Confirm your password"
              required
            />

            <Button
              type="submit"
              variant="primary"
              size="large"
              fullWidth
              loading={isLoading}
            >
              Create Account
            </Button>

            <div className="text-center">
              <p className="text-sm text-gray-600">
                Already have an account?{' '}
                <Link
                  to="/signin"
                  className="font-medium text-blue-600 hover:text-blue-500"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default Register;

