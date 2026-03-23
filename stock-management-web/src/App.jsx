import { useEffect } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { getCurrentUser } from './redux/slices/authSlice'
import Snackbar from './components/Snackbar'
import ProtectedRoute from './components/ProtectedRoute'
import Login from './pages/Login'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import Dashboard from './pages/Dashboard'
import Profile from './pages/Profile'
import Stock from './pages/Stock'
import Inventory from './pages/Inventory'
import Reports from './pages/Reports'
import Users from './pages/Users'
import UserDetails from './pages/UserDetails'
import Settings from './pages/Settings'
import StockTransfer from './pages/StockTransfer'
import Customer from './pages/Customer'
import CustomerDetails from './pages/CustomerDetails'
import Sales from './pages/Sales'

function App() {
  const dispatch = useDispatch()
  const { isAuthenticated, token } = useSelector((state) => state.auth)

  useEffect(() => {
    // Try to get current user if token exists
    if (token) {
      dispatch(getCurrentUser())
    }
  }, [dispatch, token])

  return (
    <>
      <Snackbar />
      <Routes>
        <Route 
          path="/signin"
          element={!isAuthenticated ? <Login /> : <Navigate to="/" />} 
        />
        <Route path="/register" element={<Navigate to="/signin" replace />} />
        <Route 
          path="/forgot-password" 
          element={!isAuthenticated ? <ForgotPassword /> : <Navigate to="/" />} 
        />
        <Route 
          path="/reset-password/:token" 
          element={!isAuthenticated ? <ResetPassword /> : <Navigate to="/" />} 
        />
        <Route 
          path="/" 
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/profile" 
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/stock" 
          element={
            <ProtectedRoute>
              <Stock />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/inventory" 
          element={
            <ProtectedRoute>
              <Inventory />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/reports" 
          element={
            <ProtectedRoute>
              <Reports />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/users" 
          element={
            <ProtectedRoute>
              <Users />
            </ProtectedRoute>
          } 
        />
        <Route
          path="/users/:id"
          element={
            <ProtectedRoute>
              <UserDetails />
            </ProtectedRoute>
          }
        />
        <Route 
          path="/settings" 
          element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/stock-transfer" 
          element={
            <ProtectedRoute>
              <StockTransfer />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/customers" 
          element={
            <ProtectedRoute>
              <Customer />
            </ProtectedRoute>
          } 
        />
        <Route
          path="/customers/:id"
          element={
            <ProtectedRoute>
              <CustomerDetails />
            </ProtectedRoute>
          }
        />
        <Route 
          path="/sales" 
          element={
            <ProtectedRoute>
              <Sales />
            </ProtectedRoute>
          } 
        />
      </Routes>
    </>
  )
}

export default App
