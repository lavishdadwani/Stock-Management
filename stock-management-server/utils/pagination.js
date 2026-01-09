/**
 * Pagination helper function
 * @param {Object} options - Pagination options
 * @param {Number} options.page - Current page number (default: 1)
 * @param {Number} options.limit - Items per page (default: 20)
 * @returns {Object} - Pagination metadata and skip value
 */
export const getPaginationParams = ({ page = 1, limit = 20 }) => {
  const pageNum = Math.max(1, parseInt(page) || 1);
  const limitNum = Math.max(1, parseInt(limit) || 20);
  const skip = (pageNum - 1) * limitNum;

  return {
    page: pageNum,
    limit: limitNum,
    skip,
  };
};

/**
 * Format paginated response
 * @param {Array} data - Array of data items
 * @param {Number} total - Total number of items
 * @param {Number} page - Current page number
 * @param {Number} limit - Items per page
 * @returns {Object} - Formatted paginated response
 */
export const formatPaginatedResponse = (data, total, page, limit) => {
  const totalPages = Math.ceil(total / limit);

  return {
    data,
    pagination: {
      currentPage: page,
      totalPages,
      totalItems: total,
      itemsPerPage: limit,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    },
  };
};

