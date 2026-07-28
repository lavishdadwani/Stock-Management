import ActivityLog from '../models/activityLog.model.js';
import { getPaginationParams, formatPaginatedResponse } from '../utils/pagination.js';

export const getActivityLog = async (req, res) => {
  try {
    const { entityType, action, performedBy, startDate, endDate, page, limit } = req.query;
    const { page: pageNum, limit: limitNum, skip } = getPaginationParams({ page, limit });

    const query = {};
    if (entityType) query.entityType = entityType;
    if (action) query.action = action;
    if (performedBy) query.performedBy = performedBy;
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const total = await ActivityLog.countDocuments(query);
    const logs = await ActivityLog.find(query)
      .populate('performedBy', 'name email role')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    const paginated = formatPaginatedResponse(logs, total, pageNum, limitNum);
    res.success('Activity log fetched successfully', paginated.data, null, 200, paginated.pagination);
  } catch (error) {
    console.error('Error fetching activity log:', error);
    res.error(
      error.message || 'Failed to fetch activity log',
      error,
      'An error occurred while fetching the activity log',
      500
    );
  }
};
