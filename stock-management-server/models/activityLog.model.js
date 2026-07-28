import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const ActivityLogSchema = new Schema(
  {
    entityType: {
      type: String,
      required: true,
      enum: ['stock', 'stockTransfer', 'sale', 'producibleItem']
    },
    entityId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    },
    action: {
      type: String,
      required: true,
      enum: ['create', 'update', 'delete']
    },
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'user'
    },
    description: {
      type: String,
      trim: true
    },
    before: {
      type: mongoose.Schema.Types.Mixed,
      default: null
    },
    after: {
      type: mongoose.Schema.Types.Mixed,
      default: null
    }
  },
  { timestamps: true }
);

ActivityLogSchema.index({ entityType: 1, entityId: 1 });
ActivityLogSchema.index({ performedBy: 1 });
ActivityLogSchema.index({ createdAt: -1 });

const ActivityLog = mongoose.model('activityLog', ActivityLogSchema);

export default ActivityLog;
