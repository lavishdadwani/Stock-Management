import rateLimit from 'express-rate-limit';

const isProduction = process.env.NODE_ENV === 'production';

const tooManyRequestsHandler = (req, res) => {
  res.error(
    'Too many requests. Please try again later.',
    null,
    'Too many requests. Please try again later.',
    429
  );
};

// Applied globally as a basic ceiling against abusive traffic.
// Relaxed outside production so local dev/testing (HMR re-mounts, StrictMode
// double-effects, manual API testing) never trips it.
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: isProduction ? 300 : 100000,
  standardHeaders: true,
  legacyHeaders: false,
  handler: tooManyRequestsHandler
});

// Applied to login/forgot-password/reset-password to slow down brute-force
// and credential-stuffing attempts. Kept meaningfully strict in production;
// relaxed outside it for the same reason as apiLimiter above.
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: isProduction ? 20 : 100000,
  standardHeaders: true,
  legacyHeaders: false,
  handler: tooManyRequestsHandler
});

export { apiLimiter, authLimiter };
