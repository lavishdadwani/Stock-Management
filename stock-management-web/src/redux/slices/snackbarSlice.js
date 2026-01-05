import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  isOpen: false,
  message: '',
  severity: 'info', // 'success', 'error', 'warning', 'info'
  duration: 4000,
};

const snackbarSlice = createSlice({
  name: 'snackbar',
  initialState,
  reducers: {
    showSnackbar: (state, action) => {
      state.isOpen = true;
      state.message = action.payload.message;
      state.severity = action.payload.severity || 'info';
      state.duration = action.payload.duration || 4000;
    },
    closeSnackbar: (state) => {
      state.isOpen = false;
      state.message = '';
    },
  },
});

export const { showSnackbar, closeSnackbar } = snackbarSlice.actions;
export default snackbarSlice.reducer;

