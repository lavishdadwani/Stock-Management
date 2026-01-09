import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import userAPI from '../../../services/user';

// Load user from localStorage on init
const loadUserFromStorage = () => {
  try {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    if (token && userStr) {
      return { token, user: JSON.parse(userStr) };
    }
  } catch (error) {
    console.error('Error loading user from storage:', error);
  }
  return { token: null, user: null };
};

const { token: initialToken, user: initialUser } = loadUserFromStorage();

const initialState = {
  user: initialUser,
  token: initialToken,
  isAuthenticated: !!initialToken,
  error: null,
};

// Async thunks
export const register = createAsyncThunk(
  'auth/register',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await userAPI.register(userData);
      if (response.ok && response.data) {
        const { user, token } = response.data.data || response.data;
        if (token) {
          localStorage.setItem('token', token);
        }
        if (user) {
          localStorage.setItem('user', JSON.stringify(user));
        }
        return { user, token };
      }
      return rejectWithValue(
        response.data?.message || response.data?.displayMessage || 'Registration failed'
      );
    } catch (error) {
      return rejectWithValue(
        error.message || 'Registration failed'
      );
    }
  }
);

export const login = createAsyncThunk(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await userAPI.login(credentials);
      if (response.ok && response.data) {
        const { user, token } = response.data.data || response.data;
        if (token) {
          localStorage.setItem('token', token);
        }
        if (user) {
          localStorage.setItem('user', JSON.stringify(user));
        }
        return { user, token };
      }
      return rejectWithValue(
        response.data?.message || response.data?.displayMessage || 'Login failed'
      );
    } catch (error) {
      return rejectWithValue(
        error.message || 'Login failed'
      );
    }
  }
);

export const logout = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      await userAPI.logout();
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      return null;
    } catch (error) {
      // Even if API call fails, clear local storage
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      return rejectWithValue(
        error.message || 'Logout failed'
      );
    }
  }
);

export const getCurrentUser = createAsyncThunk(
  'auth/getCurrentUser',
  async (_, { rejectWithValue }) => {
    try {
      const response = await userAPI.getCurrentUser();
      if (response.ok && response.data) {
        const user = response.data.data?.user || response.data.user;
        if (user) {
          localStorage.setItem('user', JSON.stringify(user));
        }
        return user;
      }
      return rejectWithValue(
        response.data?.message || response.data?.displayMessage || 'Failed to get user'
      );
    } catch (error) {
      return rejectWithValue(
        error.message || 'Failed to get user'
      );
    }
  }
);

export const updateProfile = createAsyncThunk(
  'auth/updateProfile',
  async (profileData, { rejectWithValue }) => {
    try {
      const response = await userAPI.updateProfile(profileData);
      if (response.ok && response.data) {
        const user = response.data.data?.user || response.data.user;
        if (user) {
          localStorage.setItem('user', JSON.stringify(user));
        }
        return user;
      }
      return rejectWithValue(
        response.data?.message || response.data?.displayMessage || 'Failed to update profile'
      );
    } catch (error) {
      return rejectWithValue(
        error.message || 'Failed to update profile'
      );
    }
  }
);

export const changePassword = createAsyncThunk(
  'auth/changePassword',
  async (passwordData, { rejectWithValue }) => {
    try {
      const response = await userAPI.changePassword(passwordData);
      if (response.ok) {
        return true;
      }
      return rejectWithValue(
        response.data?.message || response.data?.displayMessage || 'Failed to change password'
      );
    } catch (error) {
      return rejectWithValue(
        error.message || 'Failed to change password'
      );
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setUser: (state, action) => {
      state.user = action.payload;
      state.isAuthenticated = true;
    },
  },
  extraReducers: (builder) => {
    // Register
    builder
      .addCase(register.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(register.rejected, (state, action) => {
        state.error = action.payload;
      });

    // Login
    builder
      .addCase(login.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(login.rejected, (state, action) => {
        state.error = action.payload;
      });

    // Logout
    builder
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.error = null;
      });

    // Get Current User
    builder
      .addCase(getCurrentUser.fulfilled, (state, action) => {
        state.user = action.payload;
      });

    // Update Profile
    builder
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.user = action.payload;
      });
  },
});

export const { clearError, setUser } = authSlice.actions;
export default authSlice.reducer;

