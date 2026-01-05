import mongoose from 'mongoose';
import { compare, hash } from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
const Schema = mongoose.Schema;

const UserSchema = new Schema(
  {
    name: { 
      type: String, 
      required: true, 
      trim: true
    },
    email: { 
      type: String, 
      required: true,
      trim: true,
      unique: true,
      lowercase: true
    },
    number: {
      type: String,
      required: true,
      trim: true
    },
    role: {
      type: String,
      required: true,
      enum: ['manager', 'owner', 'core team'],
      default: 'manager'
    },
    password: { 
      type: String, 
      required: true
    },
    photo: {
      type: String,
      default: null
    },
    token: { 
      type: String, 
      trim: true 
    },
    isEmailVerified: {
      type: Boolean,
      default: false
    },
    emailVerificationToken: {
      type: String,
      default: null
    },
    emailVerificationExpires: {
      type: Date,
      default: null
    },
    passwordResetToken: {
      type: String,
      default: null
    },
    passwordResetExpires: {
      type: Date,
      default: null
    },
    isActive: {
      type: Boolean,
      default: true
    },
    lastLogin: {
      type: Date,
      default: null
    }
  },
  { timestamps: true }
);

UserSchema.statics.findByEmailAndPassword = async (email, password) => {
  try {
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) throw new Error("User not found");
    if (!user.isActive) throw new Error("Account is deactivated");
    const isMatched = await compare(password, user.password);
    if (!isMatched) throw new Error('Invalid password');
    // Update last login
    user.lastLogin = new Date();
    await user.save();
    return user;
  } catch (err) {
    throw err;
  }
};

UserSchema.statics.findUserByToken = async (token) => {
  try {
    const user = await User.findOne({ token: token });
    if (!user) throw new Error("Invalid token");
    if (!user.isActive) throw new Error("Account is deactivated");
    return user;
  } catch (err) {
    throw err;
  }
};

UserSchema.statics.findUserByEmailVerificationToken = async (token) => {
  try {
    const user = await User.findOne({
      emailVerificationToken: token,
      emailVerificationExpires: { $gt: Date.now() }
    });
    if (!user) throw new Error("Invalid or expired verification token");
    return user;
  } catch (err) {
    throw err;
  }
};

UserSchema.statics.findUserByPasswordResetToken = async (token) => {
  try {
    const user = await User.findOne({
      passwordResetToken: token,
      passwordResetExpires: { $gt: Date.now() }
    });
    if (!user) throw new Error("Invalid or expired reset token");
    return user;
  } catch (err) {
    throw err;
  }
};


UserSchema.statics.findByEmail = async (email) => {
  try {
    const user = await User.findOne({ email: email.toLowerCase() });
    return user;
  } catch (err) {
    throw err;
  }
};

// new Date("2021-09-28T15:21:21.446+00:00").getTime()
//=> 1632842481446

UserSchema.methods.generateToken = async function () {
  try {
    const user = this;
    const SecretKey = process.env.JWT_SECRET || `${user.email}-${new Date(user.createdAt).getTime()}`;
    const token = await jwt.sign(
      { 
        id: user._id,
        email: user.email,
        role: user.role
      }, 
      SecretKey, 
      { expiresIn: '30d' }
    );
    user.token = token;
    await user.save();
    return token;
  } catch (err) {
    throw err;
  }
};
UserSchema.methods.generateEmailVerificationToken = async function () {
  try {
    const user = this;
    const token = crypto.randomBytes(32).toString('hex');
    user.emailVerificationToken = token;
    user.emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
    await user.save();
    return token;
  } catch (err) {
    throw err;
  }
};

UserSchema.methods.generatePasswordResetToken = async function () {
  try {
    const user = this;
    const token = crypto.randomBytes(32).toString('hex');
    user.passwordResetToken = token;
    user.passwordResetExpires = Date.now() + 60 * 60 * 1000; // 1 hour
    await user.save();
    return token;
  } catch (err) {
    throw err;
  }
};

UserSchema.methods.clearPasswordResetToken = async function () {
  try {
    this.passwordResetToken = undefined;
    this.passwordResetExpires = undefined;
    await this.save();
  } catch (err) {
    throw err;
  }
};

UserSchema.methods.verifyToken = function (token) {
  try {
    const SecretKey = process.env.JWT_SECRET || `${this.email}-${new Date(this.createdAt).getTime()}`;
    const decoded = jwt.verify(token, SecretKey);
    return decoded;
  } catch (err) {
    return null;
  }
};

UserSchema.pre('save', async function (next) {
  try {
    const user = this;
    if (user.isModified('password')) {
      const hashPassword = await hash(user.password, 10);
      user.password = hashPassword;
    }
    if (user.isModified('email')) {
      user.email = user.email.toLowerCase();
    }
    next();
  } catch (err) {
    next(err);
  }
});

// Remove sensitive data when converting to JSON
UserSchema.methods.toJSON = function () {
  const userObject = this.toObject();
  delete userObject.password;
  delete userObject.token;
  delete userObject.passwordResetToken;
  delete userObject.emailVerificationToken;
  return userObject;
};

const User = mongoose.model('user', UserSchema);

export default User;