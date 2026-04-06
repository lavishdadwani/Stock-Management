import ItemProduced from '../models/itemProduced.model.js';
import Customer from '../models/customer.model.js';
import { getPaginationParams, formatPaginatedResponse } from '../utils/pagination.js';

const buildStockVisibilityQuery = (userId, userRole, extra = {}) => {
  const query = { ...extra };
  if (userRole === 'core_team') {
    query.$or = [{ userId }, { source: 'purchased' }];
  }
  return query;
};

// Get produced / purchased finished items (core team: own production + all purchases)
export const getAllItemProduced = async (req, res) => {
  try {
    const { page, limit, itemName, startDate, endDate } = req.query;

    const userId = req.userId;
    const userRole = req.userRole;

    const { page: pageNum, limit: limitNum, skip } = getPaginationParams({ page, limit });

    const query = buildStockVisibilityQuery(userId, userRole);

    if (itemName) {
      query.itemName = itemName;
    }

    if (startDate || endDate) {
      query.productionDate = {};
      if (startDate) query.productionDate.$gte = new Date(startDate);
      if (endDate) query.productionDate.$lte = new Date(endDate);
    }

    const pipeline = [
      { $match: query },
      { $sort: { productionDate: -1 } },
      {
        $facet: {
          metadata: [{ $count: 'total' }],
          data: [
            { $skip: skip },
            { $limit: limitNum },
            {
              $lookup: {
                from: 'users',
                localField: 'userId',
                foreignField: '_id',
                as: 'user'
              }
            },
            {
              $lookup: {
                from: 'customers',
                localField: 'customerId',
                foreignField: '_id',
                as: 'customer'
              }
            },
            { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } },
            { $unwind: { path: '$customer', preserveNullAndEmptyArrays: true } },
            {
              $project: {
                _id: 1,
                itemName: 1,
                quantity: 1,
                unit: 1,
                source: { $ifNull: ['$source', 'produced'] },
                customerId: '$customer._id',
                customerName: '$customer.name',
                companyName: '$customer.companyName',
                wireUsedType: 1,
                wireUsedQuantity: { $ifNull: ['$wireUsedQuantity', 0] },
                scrapQuantity: { $ifNull: ['$scrapQuantity', 0] },
                productionDate: 1,
                createdByName: { $ifNull: ['$user.name', 'Unknown'] },
                pricePerPiece: 1,
                totalPurchaseAmount: 1,
                description: 1
              }
            }
          ]
        }
      }
    ];
    
    const result = await ItemProduced.aggregate(pipeline);
    
    const total = result[0].metadata[0]?.total || 0;
    const formatted = result[0].data;
    
    const paginatedData = formatPaginatedResponse(formatted, total, pageNum, limitNum);

    res.success(
      'Finished stock entries fetched successfully',
      paginatedData.data,
      null,
      200,
      paginatedData.pagination
    );
  } catch (error) {
    res.error(
      error.message || 'Failed to fetch finished stock',
      error,
      'An error occurred while fetching finished stock',
      500
    );
  }
};

// Item-wise totals with produced vs purchased split (pieces)
export const getItemProducedTotals = async (req, res) => {
  try {
    const userId = req.userId;
    const userRole = req.userRole;
    const { startDate, endDate, month, year } = req.query;

    const baseMatch = { unit: 'pieces' };
    const match =
      userRole === 'core_team'
        ? {
            ...baseMatch,
            $or: [{ userId }, { source: 'purchased' }]
          }
        : baseMatch;

    const hasMonth = month !== undefined && month !== null && month !== '';
    const hasYear = year !== undefined && year !== null && year !== '';
    if (hasMonth || hasYear || startDate || endDate) {
      match.productionDate = {};
      if (hasMonth) {
        const m = Number(month);
        const y = hasYear ? Number(year) : new Date().getFullYear();
        if (!m || m < 1 || m > 12 || !y) {
          return res.error('Invalid month/year', null, 'Month must be 1-12 and year must be valid', 400);
        }
        const start = new Date(y, m - 1, 1, 0, 0, 0, 0);
        const end = new Date(y, m, 0, 23, 59, 59, 999);
        match.productionDate.$gte = start;
        match.productionDate.$lte = end;
      } else {
        if (startDate) match.productionDate.$gte = new Date(startDate);
        if (endDate) match.productionDate.$lte = new Date(endDate);
      }
    }

    const totals = await ItemProduced.aggregate([
      { $match: match },
      {
        $group: {
          _id: '$itemName',
          quantity: { $sum: '$quantity' },
          producedQuantity: {
            $sum: {
              $cond: [{ $eq: [{ $ifNull: ['$source', 'produced'] }, 'purchased'] }, 0, '$quantity']
            }
          },
          purchasedQuantity: {
            $sum: {
              $cond: [{ $eq: [{ $ifNull: ['$source', 'produced'] }, 'purchased'] }, '$quantity', 0]
            }
          }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    const formatted = totals.map((item) => ({
      name: item._id,
      quantity: Math.round((item.quantity || 0) * 100) / 100,
      producedQuantity: Math.round((item.producedQuantity || 0) * 100) / 100,
      purchasedQuantity: Math.round((item.purchasedQuantity || 0) * 100) / 100,
      unit: 'pieces'
    }));

    res.success('Finished stock totals fetched successfully', formatted, null, 200);
  } catch (error) {
    res.error(
      error.message || 'Failed to fetch finished stock totals',
      error,
      'An error occurred while fetching finished stock totals',
      500
    );
  }
};

/**
 * Record finished goods bought back from a customer (adds to sellable stock).
 */
// export const createPurchasedFromCustomer = async (req, res) => {
//   try {
//     const {
//       customerId,
//       itemName,
//       quantity,
//       productionDate,
//       description,
//       pricePerPiece,
//       totalPurchaseAmount
//     } = req.body;

//     if (!customerId || !itemName || quantity === undefined || quantity === null) {
//       return res.error(
//         'Missing required fields',
//         null,
//         'Please provide customerId, itemName and quantity',
//         400
//       );
//     }

//     const qty = Number(quantity);
//     if (!qty || qty <= 0) {
//       return res.error('Invalid quantity', null, 'Quantity must be greater than 0', 400);
//     }

//     const customer = await Customer.findById(customerId);
//     if (!customer || !customer.isActive) {
//       return res.error('Invalid customer', null, 'Customer not found or inactive', 400);
//     }

//     const name = String(itemName).trim();
//     if (!name) {
//       return res.error('Invalid item name', null, 'Item name is required', 400);
//     }

//     let ppp =
//       pricePerPiece !== undefined && pricePerPiece !== null && pricePerPiece !== ''
//         ? Number(pricePerPiece)
//         : null;
//     let total =
//       totalPurchaseAmount !== undefined &&
//       totalPurchaseAmount !== null &&
//       totalPurchaseAmount !== ''
//         ? Number(totalPurchaseAmount)
//         : null;

//     if (ppp !== null && Number.isNaN(ppp)) ppp = null;
//     if (total !== null && Number.isNaN(total)) total = null;

//     if (ppp !== null && total === null) {
//       total = Number((ppp * qty).toFixed(2));
//     }

//     const doc = await ItemProduced.create({
//       source: 'purchased',
//       attendanceId: null,
//       customerId,
//       userId: req.userId,
//       itemName: name,
//       quantity: qty,
//       unit: 'pieces',
//       productionDate: productionDate ? new Date(productionDate) : new Date(),
//       description: description ? String(description).trim() : null,
//       wireUsedType: null,
//       wireUsedQuantity: null,
//       scrapQuantity: null,
//       pricePerPiece: ppp,
//       totalPurchaseAmount: total
//     });

//     const populated = await ItemProduced.findById(doc._id)
//       .populate('userId', 'name email role')
//       .populate('customerId', 'name companyName phone');

//     const item = populated;
//     const formatted = {
//       _id: item._id,
//       itemName: item.itemName,
//       quantity: item.quantity,
//       unit: item.unit,
//       source: item.source,
//       customerId: item.customerId?._id,
//       customerName: item.customerId?.name || null,
//       companyName: item.customerId?.companyName || null,
//       wireUsedType: item.wireUsedType,
//       wireUsedQuantity: item.wireUsedQuantity ?? 0,
//       scrapQuantity: item.scrapQuantity ?? 0,
//       productionDate: item.productionDate,
//       createdByName: item.userId?.name || 'Unknown',
//       pricePerPiece: item.pricePerPiece,
//       totalPurchaseAmount: item.totalPurchaseAmount,
//       description: item.description
//     };

//     res.success(
//       'Purchase from customer recorded',
//       formatted,
//       'Finished stock updated',
//       201
//     );
//   } catch (error) {
//     res.error(
//       error.message || 'Failed to record purchase',
//       error,
//       'An error occurred while recording the purchase',
//       500
//     );
//   }
// };

export const createPurchasedFromCustomer = async (req, res) => {
  try {
    const {
      customerId,
      itemName,
      quantity,
      productionDate,
      description,
      pricePerPiece,
      totalPurchaseAmount
    } = req.body;

    // ✅ Basic validation
    if (!customerId || !itemName || quantity == null) {
      return res.error(
        'Missing required fields',
        null,
        'Provide customerId, itemName, and quantity',
        400
      );
    }

    const qty = Number(quantity);
    if (isNaN(qty) || qty <= 0) {
      return res.error('Invalid quantity', null, 'Quantity must be > 0', 400);
    }

    // ✅ Validate customer exists
    const customerExists = await Customer.exists({ _id: customerId, isActive: true });
    if (!customerExists) {
      return res.error('Invalid customer', null, 'Customer not found or inactive', 400);
    }

    const name = itemName.trim();
    if (!name) {
      return res.error('Invalid item name', null, 'Item name is required', 400);
    }

    // ✅ Price handling
    let ppp = pricePerPiece ? Number(pricePerPiece) : null;
    let total = totalPurchaseAmount ? Number(totalPurchaseAmount) : null;

    if (isNaN(ppp)) ppp = null;
    if (isNaN(total)) total = null;

    if (ppp !== null && total === null) {
      total = Number((ppp * qty).toFixed(2));
    }

    // ✅ Create record
    const item = await ItemProduced.create({
      source: 'purchased',
      customerId,
      userId: req.userId,
      itemName: name,
      quantity: qty,
      unit: 'pieces',
      productionDate: productionDate ? new Date(productionDate) : new Date(),
      description: description?.trim() || null,
      pricePerPiece: ppp,
      totalPurchaseAmount: total
    });

    // ✅ Direct response (no populate)
    return res.success(
      'Purchase recorded successfully',
      item,
      'Finished stock updated',
      201
    );

  } catch (error) {
    return res.error(
      error.message || 'Failed to record purchase',
      error,
      'Error while recording purchase',
      500
    );
  }
};
