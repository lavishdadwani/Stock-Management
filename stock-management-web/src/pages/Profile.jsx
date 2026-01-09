import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import { updateProfile, getCurrentUser } from '../redux/slices/authSlice';
import { showSnackbar } from '../redux/slices/snackbarSlice';
import userAPI from '../../services/user';
import Button from '../components/Button';
import Input from '../components/Input';
import Card from '../components/Card';
import Navbar from '../components/Navbar';

const Profile = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    mode: 'onChange',
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [isResendingVerification, setIsResendingVerification] = useState(false);
  const [isVerifyingEmail, setIsVerifyingEmail] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/signin');
      return;
    }

    // Load user data into form
    if (user) {
      reset({
        name: user.name || '',
        number: user.number || '',
        photo: user.photo || '',
      });
    } else {
      dispatch(getCurrentUser());
    }
  }, [isAuthenticated, user, navigate, dispatch, reset]);

  const onSubmit = async (data) => {
    setIsLoading(true);
    
    try {
      const result = await dispatch(updateProfile(data));
      if (updateProfile.fulfilled.match(result)) {
        dispatch(showSnackbar({ 
          message: 'Profile updated successfully', 
          severity: 'success' 
        }));
      } else {
        dispatch(showSnackbar({ 
          message: result.payload || 'Failed to update profile', 
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

  const handleResendVerification = async () => {
    if (!user?.email) return;

    setIsResendingVerification(true);
    try {
      const response = await userAPI.resendVerification(user.email);
      if (response.ok) {
        dispatch(showSnackbar({ 
          message: 'Verification email sent successfully. Please check your inbox.', 
          severity: 'success' 
        }));
      } else {
        dispatch(showSnackbar({ 
          message: response.data?.message || 'Failed to send verification email', 
          severity: 'error' 
        }));
      }
    } catch (error) {
      dispatch(showSnackbar({ 
        message: 'Failed to send verification email', 
        severity: 'error' 
      }));
    } finally {
      setIsResendingVerification(false);
    }
  };

  const handleVerifyEmail = async () => {
    setIsVerifyingEmail(true);
    try {
      const response = await userAPI.verifyEmailAuthenticated();
      if (response.ok) {
        dispatch(showSnackbar({ 
          message: 'Email verified successfully!', 
          severity: 'success' 
        }));
        // Refresh user data
        dispatch(getCurrentUser());
      } else {
        dispatch(showSnackbar({ 
          message: response.data?.message || 'Failed to verify email', 
          severity: 'error' 
        }));
      }
    } catch (error) {
      dispatch(showSnackbar({ 
        message: 'Failed to verify email', 
        severity: 'error' 
      }));
    } finally {
      setIsVerifyingEmail(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-8 pt-20">
          <div className="text-center">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
          <p className="text-gray-600 mt-1">Manage your account information</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Profile Info Card */}
          <Card className="md:col-span-1">
            <div className="text-center">
              <div className="mx-auto h-24 w-24 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                {user.photo ? (
                  <img
                    src={user.photo}
                    alt={user.name}
                    className="h-24 w-24 rounded-full object-cover"
                  />
                ) : (
                  <span className="text-3xl font-bold text-blue-600">
                    {user.name?.charAt(0).toUpperCase() || 'U'}
                  </span>
                )}
              </div>
              <h2 className="text-xl font-bold text-gray-900">{user.name}</h2>
              <p className="text-sm text-gray-600 mt-1">{user.email}</p>
              <p className="text-sm text-gray-600">{user.number}</p>
              
              <div className="mt-4 space-y-2">
                <div className="flex items-center justify-center space-x-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    user.role === 'owner' 
                      ? 'bg-purple-100 text-purple-800'
                      : user.role === 'core team'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                    {user.role}
                  </span>
                </div>
                
                {!user.isEmailVerified && (
                  <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg space-y-2">
                    <p className="text-xs text-yellow-800">
                      Your email is not verified
                    </p>
                    <Button
                      variant="primary"
                      size="small"
                      onClick={handleVerifyEmail}
                      loading={isVerifyingEmail}
                      fullWidth
                    >
                      Verify Email
                    </Button>
                    <Button
                      variant="outline"
                      size="small"
                      onClick={handleResendVerification}
                      loading={isResendingVerification}
                      fullWidth
                    >
                      Resend Verification Email
                    </Button>
                  </div>
                )}
                
                {user.isEmailVerified && (
                  <div className="mt-4 flex items-center justify-center space-x-2 text-green-600">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-sm font-medium">Email Verified</span>
                  </div>
                )}
              </div>
            </div>
          </Card>

          {/* Edit Profile Form */}
          <Card className="md:col-span-2">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Edit Profile</h3>
            
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <Input
                label="Full Name"
                name="name"
                type="text"
                register={register('name', {
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

              <div className="w-full">
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Email Address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={user.email}
                  disabled
                  placeholder="Email cannot be changed"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
                />
              </div>

              <Input
                label="Phone Number"
                name="number"
                type="tel"
                register={register('number', {
                  required: 'Phone number is required',
                  pattern: {
                    value: /^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{4,14}$/,
                    message: 'Please enter a valid phone number (10-15 digits)'
                  },
                  validate: (value) => {
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

              <Input
                label="Photo URL"
                name="photo"
                type="url"
                register={register('photo', {
                  pattern: {
                    value: /^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)$/i,
                    message: 'Please enter a valid image URL'
                  }
                })}
                error={errors.photo}
                placeholder="Enter photo URL (optional)"
              />

              <div className="pt-4">
                <Button
                  type="submit"
                  variant="primary"
                  size="large"
                  fullWidth
                  loading={isLoading}
                >
                  Update Profile
                </Button>
              </div>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Profile;

