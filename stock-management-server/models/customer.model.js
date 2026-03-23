import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const CustomerSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      index: true
    },
    phone: {
      type: Number,
      trim: true,
      default: null
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      default: null
    },
    address: {
      type: String,
      trim: true,
      default: null
    },
    companyName: {
      type: String,
      trim: true,
      default: null
    },
    gstNumber: {
      type: String,
      trim: true,
      uppercase: true,
      default: null
    },
    notes: {
      type: String,
      trim: true,
      default: null
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'user',
      index: true
    }
  },
  { timestamps: true }
);

CustomerSchema.index({ name: 1, phone: 1 });
CustomerSchema.index({ createdAt: -1 });

const Customer = mongoose.model('customer', CustomerSchema);

export default Customer;

