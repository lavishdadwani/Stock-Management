import User from '../models/user.model.js';
import jwt from 'jsonwebtoken';

const Auth = async function (req, res, next) {
  try {
    const authToken = req.header('Authorization') || req.header('authorization');
    
    if (!authToken) {
      return res.unauthorized('No token provided. Authorization denied.');
    }

    // Remove 'Bearer ' prefix if present
    const token = authToken.startsWith('Bearer ') ? authToken.slice(7) : authToken;

    // Find user by token
    const user = await User.findOne({ token: token });
    
    if (!user) {
      return res.unauthorized('Invalid token. Authorization denied.');
    }

    if (!user.isActive) {
      return res.unauthorized('Account is deactivated.');
    }

    // Verify token signature
    const SecretKey = process.env.JWT_SECRET || `${user.email}-${new Date(user.createdAt).getTime()}`;
    
    try {
      const decoded = jwt.verify(token, SecretKey);
      
      // Verify token matches user
      if (decoded.id !== user._id.toString()) {
        return res.unauthorized('Token does not match user.');
      }

      req.user = user;
      req.userId = user._id;
      req.userRole = user.role;
      next();
    } catch (jwtError) {
      // Token is invalid or expired
      user.token = null;
      await user.save();
      return res.unauthorized('Token is invalid or expired.');
    }
  } catch (err) {
    console.error('Auth middleware error:', err);
    return res.error('Server error during authentication.', err, null, 500);
  }
};

// Role-based authorization middleware
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.unauthorized('Authentication required.');
    }

    if (!roles.includes(req.user.role)) {
      return res.accessDenied();
    }

    next();
  };
};

export { Auth, authorize };
export default Auth;