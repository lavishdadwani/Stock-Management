import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import User from '../models/user.model.js';
import { validatePassword } from '../utils/validation.js';

const requireEnv = (name) => {
  const value = process.env[name];
  if (!value || !String(value).trim()) {
    console.error(`Missing required env var: ${name}`);
    process.exit(1);
  }
  return value;
};

const run = async () => {
  const name = requireEnv('SEED_SUPER_ADMIN_NAME');
  const email = requireEnv('SEED_SUPER_ADMIN_EMAIL').toLowerCase().trim();
  const password = requireEnv('SEED_SUPER_ADMIN_PASSWORD');
  const number = requireEnv('SEED_SUPER_ADMIN_NUMBER');

  const passwordCheck = validatePassword(password);
  if (!passwordCheck.isValid) {
    console.error(`SEED_SUPER_ADMIN_PASSWORD is invalid: ${passwordCheck.error}`);
    process.exit(1);
  }

  if (!process.env.MONGODB_URL) {
    console.error('Missing required env var: MONGODB_URL');
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGODB_URL);

  try {
    const existing = await User.findOne({ email });
    if (existing) {
      if (existing.role === 'super_admin') {
        console.log(`A super_admin already exists with email ${email}. Nothing to do.`);
      } else {
        console.error(
          `A user with email ${email} already exists with role "${existing.role}". Refusing to overwrite - use a different SEED_SUPER_ADMIN_EMAIL or update the user's role manually.`
        );
        process.exit(1);
      }
      return;
    }

    const user = new User({
      name,
      email,
      number,
      password,
      role: 'super_admin',
      isEmailVerified: true,
      isActive: true
    });

    await user.save();
    console.log(`Super admin created successfully: ${email}`);
  } finally {
    await mongoose.disconnect();
  }
};

run().catch((error) => {
  console.error('Seed failed:', error);
  process.exit(1);
});
