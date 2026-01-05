import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useDispatch } from 'react-redux';
import { showSnackbar } from '../redux/slices/snackbarSlice';
import { userAPI } from '../../services/user';
import Button from '../components/Button';
import Input from '../components/Input';
import Card from '../components/Card';

const ForgotPassword = () => {
  const dispatch = useDispatch();
  const { register, handleSubmit, formState: { errors } } = useForm({
    mode: 'onChange',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const onSubmit = async (data) => {
    setIsLoading(true);
    
    try {
      const response = await userAPI.forgotPassword(data.email);
      if (response.ok) {
        setIsSubmitted(true);
        dispatch(showSnackbar({ 
          message: response.data?.displayMessage || response.data?.message || 'Password reset email sent! Please check your inbox.', 
          severity: 'success' 
        }));
      } else {
        dispatch(showSnackbar({ 
          message: response.data?.message || response.data?.displayMessage || 'Failed to send reset email. Please try again.', 
          severity: 'error' 
        }));
      }
    } catch (error) {
      dispatch(showSnackbar({ 
        message: error.message || 'Failed to send reset email. Please try again.', 
        severity: 'error' 
      }));
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full">
          <Card>
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 mb-4">
                <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Check your email</h2>
              <p className="text-gray-600 mb-6">
                We've sent a password reset link to your email address. Please check your inbox and follow the instructions.
              </p>
              <Link
                to="/signin"
                className="font-medium text-blue-600 hover:text-blue-500"
              >
                Back to Sign In
              </Link>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-blue-600 mb-2">Stock Management</h1>
          <p className="text-gray-600">Reset your password</p>
        </div>
        
        <Card>
          <p className="text-sm text-gray-600 mb-6">
            Enter your email address and we'll send you a link to reset your password.
          </p>
          
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <Input
              label="Email Address"
              name="email"
              type="email"
              register={register('email', {
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

            <Button
              type="submit"
              variant="primary"
              size="large"
              fullWidth
              loading={isLoading}
            >
              Send Reset Link
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

export default ForgotPassword;

