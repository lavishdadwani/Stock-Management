import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const AttendanceSchema = new Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'user',
      index: true
    },
    itemId: {
      type: mongoose.Schema.Types.ObjectId,
      required: false,
      ref: 'ItemProduced',
      default: null,
      index: true
    },
    checkInTime: {
      type: Date,
      required: true,
      default: Date.now
    },
    checkOutTime: {
      type: Date,
      default: null
    },
    status: {
      type: String,
      enum: ['checked-in', 'checked-out'],
      default: 'checked-in',
      index: true
    }
  },
  { timestamps: true }
);

AttendanceSchema.index({ userId: 1, status: 1 });
AttendanceSchema.index({ itemId: 1 });
AttendanceSchema.index({ checkInTime: -1 });
AttendanceSchema.index({ userId: 1, createdAt: -1 });

AttendanceSchema.virtual('duration').get(function() {
  if (this.checkOutTime && this.checkInTime) {
    return this.checkOutTime - this.checkInTime;
  }
  return null;
});

AttendanceSchema.statics.isCheckedIn = async function(userId) {
  const attendance = await this.findOne({
    userId,
    status: 'checked-in'
  });
  return attendance ? attendance._id : null;
};

const Attendance = mongoose.model('Attendance', AttendanceSchema);

export default Attendance;

