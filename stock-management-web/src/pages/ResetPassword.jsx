import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useDispatch } from 'react-redux';
import { showSnackbar } from '../redux/slices/snackbarSlice';
import { userAPI } from '../../services/user';
import Button from '../components/Button';
import InputPassword from '../components/InputPassword';
import Card from '../components/Card';
import PasswordStrength from '../components/PasswordStrength';

const ResetPassword = () => {
  const navigate = useNavigate();
  const { token } = useParams();
  const dispatch = useDispatch();
  const { register, handleSubmit, formState: { errors }, watch } = useForm({
    mode: 'onChange',
  });
  const [isLoading, setIsLoading] = useState(false);
  const password = watch('password', '');

  useEffect(() => {
    if (!token) {
      navigate('/forgot-password');
    }
  }, [token, navigate]);

  const onSubmit = async (data) => {
    setIsLoading(true);
    
    try {
      const response = await userAPI.resetPassword(token, data.password, data.confirmPassword);
      if (response.ok) {
        dispatch(showSnackbar({ 
          message: response.data?.displayMessage || response.data?.message || 'Password reset successful! Please login with your new password.', 
          severity: 'success' 
        }));
        navigate('/signin');
      } else {
        dispatch(showSnackbar({ 
          message: response.data?.message || response.data?.displayMessage || 'Failed to reset password. The link may have expired.', 
          severity: 'error' 
        }));
      }
    } catch (error) {
      dispatch(showSnackbar({ 
        message: error.message || 'Failed to reset password. The link may have expired.', 
        severity: 'error' 
      }));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-blue-600 mb-2">Stock Management</h1>
          <p className="text-gray-600">Set your new password</p>
        </div>
        
        <Card>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <InputPassword
                label="New Password"
                name="password"
                register={register('password', {
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
                placeholder="Enter your new password"
                required
              />
              <PasswordStrength password={password} />
            </div>

            <InputPassword
              label="Confirm New Password"
              name="confirmPassword"
              register={register('confirmPassword', {
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
              placeholder="Confirm your new password"
              required
            />

            <Button
              type="submit"
              variant="primary"
              size="large"
              fullWidth
              loading={isLoading}
            >
              Reset Password
            </Button>

            <div className="text-center">
              <Link
                to="/signin"
                className="text-sm font-medium text-blue-600 hover:text-blue-500"
              >
                Back to Sign In
              </Link>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default ResetPassword;

