import ActivityLog from '../models/activityLog.model.js';

// Records an activity log entry. Never throws - a failed log write must not
// break the operation it's describing.
const logActivity = async ({ entityType, entityId, action, performedBy, description, before = null, after = null }) => {
  try {
    await ActivityLog.create({ entityType, entityId, action, performedBy, description, before, after });
  } catch (error) {
    console.error(`Error logging activity (${entityType}/${action}):`, error);
  }
};

export { logActivity };
