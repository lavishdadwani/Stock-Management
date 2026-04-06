import Attendance from '../models/attendance.model.js';
import ItemProduced from '../models/itemProduced.model.js';
import StockTransfer from '../models/stockTransfer.model.js';
import { mongoose } from 'mongoose';
import { validateCheckoutData } from '../utils/validation.js';
import { getPaginationParams, formatPaginatedResponse } from '../utils/pagination.js';

const MAX_CHECKIN_PHOTO_CHARS = 2_500_000; // ~1.8MB base64 safety limit

// Check-in - Start work session (optional: checkInPhoto, lat, lng — app sends lat/lng)
export const checkIn = async (req, res) => {
  try {
    const userId = req.userId;

    const existingAttendance = await Attendance.isCheckedIn(userId);

    if (existingAttendance) {
      return res.error(
        'Already checked in',
        null,
        'You are already checked in. Please check out first.',
        400
      );
    }

    const { checkInPhoto, lat, lng, city, address } = req.body || {};

    let photo = null;
    if (checkInPhoto != null && typeof checkInPhoto === 'string' && checkInPhoto.trim() !== '') {
      if (checkInPhoto.length > MAX_CHECKIN_PHOTO_CHARS) {
        return res.error(
          'Photo too large',
          null,
          'Check-in photo exceeds maximum size. Try a lower camera quality.',
          400
        );
      }
      photo = checkInPhoto.trim();
    }

    const latNum =
      lat !== undefined && lat !== null && lat !== '' ? Number(lat) : null;
    const lngNum =
      lng !== undefined && lng !== null && lng !== '' ? Number(lng) : null;

    let checkInLatitude = null;
    let checkInLongitude = null;
    if (latNum != null && !Number.isNaN(latNum) && lngNum != null && !Number.isNaN(lngNum)) {
      if (latNum < -90 || latNum > 90 || lngNum < -180 || lngNum > 180) {
        return res.error('Invalid coordinates', null, 'Latitude must be -90–90 and longitude -180–180', 400);
      }
      checkInLatitude = latNum;
      checkInLongitude = lngNum;
    }

    const attendance = new Attendance({
      userId,
      checkInTime: new Date(),
      status: 'checked-in',
      checkInPhoto: photo,
      checkInLatitude,
      checkInLongitude,
      address,
      city
    });

    const savedAttendance = await attendance.save();

    res.success(
      'Checked in successfully',
      {
        attendanceId: savedAttendance._id,
        checkInTime: savedAttendance.checkInTime,
        status: savedAttendance.status
      },
      'You have been checked in successfully',
      201
    );
  } catch (error) {
    console.error('Error checking in:', error);
    res.error(
      error.message || 'Failed to check in',
      error,
      'An error occurred while checking in',
      500
    );
  }
};

// Check-out - End work session and record production
export const checkOut = async (req, res) => {
  try {
    const userId = req.userId;
    const {
      wireUsedType,
      wireUsedQuantity,
      itemProduced,
      scrapQuantity,
      description
    } = req.body;

    const validation = validateCheckoutData(req.body);
    if (!validation.isValid) {
      return res.error(
        'Validation failed',
        validation.errors,
        Object.values(validation.errors)[0],
        400
      );
    }

    const attendance = await Attendance.findOne({
      userId,
      status: 'checked-in'
    });

    if (!attendance) {
      return res.error(
        'No active check-in found',
        null,
        'Please check in first before checking out',
        400
      );
    }

    const wireUsedQuantityKg = parseFloat(wireUsedQuantity) || 0;
    const wireTypeForStock = wireUsedType === 'aluminium' ? 'aluminium' : 'copper';

    // Available wire for this core team member is tracked in StockTransfer (toUserId=user)
    const wireTransferAgg = await StockTransfer.aggregate([
      {
        $match: {
          toUserId: new mongoose.Types.ObjectId(userId),
          itemName: wireTypeForStock,
          status: 'completed'
        }
      },
      {
        $group: {
          _id: '$itemName',
          totalQuantity: { $sum: '$quantity' }
        }
      }
    ]);

    const availableWire = wireTransferAgg.length > 0 ? wireTransferAgg[0].totalQuantity : 0;

    if (availableWire < wireUsedQuantityKg) {
      return res.error(
        'Insufficient stock',
        {
          required: wireUsedQuantityKg,
          available: availableWire,
          wireType: wireTypeForStock
        },
        `Insufficient ${wireTypeForStock} available. Required: ${wireUsedQuantityKg} kg, Available: ${availableWire} kg`,
        400
      );
    }

    // Start transaction-like operations
    try {
      // 1. Deduct wire from the user's transferred stock (negative entry)
      const wireConsumptionTransfer = new StockTransfer({
        fromUserId: userId,
        toUserId: userId,
        itemName: wireTypeForStock,
        quantity: -wireUsedQuantityKg,
        unit: 'kg',    
        transferDate: new Date(),
        description: `Wire used for production - Check-out from ${attendance.checkInTime}`,
        status: 'completed',
        entryType: 'consume_wire'
      });
      await wireConsumptionTransfer.save();

      // 2. Add scrap to the user's transferred stock (positive entry)
      if (scrapQuantity && parseFloat(scrapQuantity) > 0) {
        const scrapTransfer = new StockTransfer({
          fromUserId: userId,
          toUserId: userId,
          itemName: 'scrap',
          quantity: parseFloat(scrapQuantity),
          unit: 'kg',
          transferDate: new Date(),
          description: `Scrap generated from production - Check-out from ${attendance.checkInTime}`,
          status: 'completed',
          entryType: 'generate_scrap'
        });
        await scrapTransfer.save();
      }

      // 3. Create item produced record
      let savedItemProduced = null;
      if (itemProduced && itemProduced.itemName) {
        const itemProducedRecord = new ItemProduced({
          source: 'produced',
          attendanceId: attendance._id,
          userId,
          itemName: itemProduced.itemName.trim(),
          quantity: parseFloat(itemProduced.quantity),
          unit: itemProduced.unit || 'pieces',
          productionDate: new Date(),
          description: description || itemProduced.description || null,
          wireUsedType: wireUsedType,
          wireUsedQuantity: wireUsedQuantityKg,
          scrapQuantity: scrapQuantity ? parseFloat(scrapQuantity) : null
        });
        savedItemProduced = await itemProducedRecord.save();
      }

      // 4. Update attendance record with itemId and checkout details
      attendance.itemId = savedItemProduced?._id || null;
      attendance.checkOutTime = new Date();
      attendance.status = 'checked-out';
      
      await attendance.save();


      res.success(
        'Checked out successfully',
        {
          itemProduced: savedItemProduced,
          wireUsed: {
            type: wireTypeForStock,
            quantity: wireUsedQuantityKg
          },
          scrapAdded: scrapQuantity || 0
        },
        'Check-out completed successfully',
        200
      );
    } catch (operationError) {
      console.error('Error during checkout operations:', operationError);
      throw operationError;
    }
  } catch (error) {
    console.error('Error checking out:', error);
    res.error(
      error.message || 'Failed to check out',
      error,
      'An error occurred while checking out',
      500
    );
  }
};

// Get current check-in status
export const getCheckInStatus = async (req, res) => {
  try {
    const userId = req.userId;

    const attendance = await Attendance.findOne({
      userId,
      status: 'checked-in'
    }).populate('userId', 'name email');

    if (!attendance) {
      return res.success(
        'Not checked in',
        {
          isCheckedIn: false,
          attendance: null
        },
        null,
        200
      );
    }

    res.success(
      'Check-in status fetched successfully',
      {
        isCheckedIn: true,
        attendance: {
          _id: attendance._id,
          checkInTime: attendance.checkInTime,
          status: attendance.status,
          userId: attendance.userId,
          checkInLatitude: attendance.checkInLatitude ?? null,
          checkInLongitude: attendance.checkInLongitude ?? null
        }
      },
      null,
      200
    );
  } catch (error) {
    console.error('Error fetching check-in status:', error);
    res.error(
      error.message || 'Failed to fetch check-in status',
      error,
      'An error occurred while fetching check-in status',
      500
    );
  }
};

// Get attendance history for the logged-in user
export const getMyAttendanceHistory = async (req, res) => {
  try {
    const userId = req.userId;
    const { page, limit, startDate, endDate } = req.query;

    const query = { userId };
    
    if (startDate || endDate) {
      query.checkInTime = {};
      if (startDate) {
        query.checkInTime.$gte = new Date(startDate);
      }
      if (endDate) {
        query.checkInTime.$lte = new Date(endDate);
      }
    }

    // Pagination
    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 10;
    const skip = (pageNum - 1) * limitNum;


      const attendanceRecords = await Attendance.find(query)
      .populate('userId', 'name email')
      .populate('itemId')
      .sort({ checkInTime: -1 })
      .skip(skip)
      .limit(limitNum);
      const total = attendanceRecords.length

      // Populate itemProduced using itemId reference
    //   const attendanceWithItems = attendanceRecords.map((attendance) => {
    //     return attendance.toObject();
    //   });
      
      // Populate itemProduced for each attendance record
    //   await Attendance.populate(attendanceWithItems, {
    //     path: 'itemId',
    //     select: '-__v'
    //   });
      
      // Rename itemId to itemProduced in response
    //   const formattedAttendance = attendanceWithItems.map((attendance) => {
    //     const { itemId, ...rest } = attendance;
    //     return {
    //       ...rest,
    //       itemProduced: itemId || null
    //     };
    //   });

    res.success(
      'Attendance history fetched successfully',
      attendanceRecords,
      null,
      200,
      {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum)
      }
    );
  } catch (error) {
    console.error('Error fetching attendance history:', error);
    res.error(
      error.message || 'Failed to fetch attendance history',
      error,
      'An error occurred while fetching attendance history',
      500
    );
  }
};

/**
 * Manager/owner: paginated attendance history for a user (no raw photo bytes — use hasCheckInPhoto + /record/:id).
 */
export const getAttendanceHistoryForUser = async (req, res) => {
  try {
    const { userId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.error('Invalid user id', null, null, 400);
    }

    const { page, limit } = req.query;
    const { page: pageNum, limit: limitNum, skip } = getPaginationParams({ page, limit });

    const match = { userId: new mongoose.Types.ObjectId(userId) };
    const total = await Attendance.countDocuments(match);

    const rows = await Attendance.aggregate([
      { $match: match },
    
      // 🔗 USER POPULATE
      {
        $lookup: {
          from: "users", // collection name in MongoDB
          localField: "userId",
          foreignField: "_id",
          as: "user",
        },
      },
      {
        $unwind: {
          path: "$user",
          preserveNullAndEmptyArrays: true,
        },
      },
      // {
      //   $addFields: {
      //     itemId: { $toObjectId: "$itemId" }
      //   }
      // },
    
      // 🔗 ITEM POPULATE
      {
        $lookup: {
          from: "itemproduceds", // ✅ correct
          localField: "itemId",
          foreignField: "_id",
          as: "item",
        },
      },
      {
        $unwind: {
          path: "$item",
          preserveNullAndEmptyArrays: true,
        },
      },
    
      { $sort: { checkInTime: -1 } },
      { $skip: skip },
      { $limit: limitNum },
    
      // 🎯 FINAL SHAPE
      {
        $project: {
          checkInTime: 1,
          checkOutTime: 1,
          address: 1,
          city: 1,
          status: 1,
          checkInLatitude: 1,
          checkInLongitude: 1,
          createdAt: 1,
          updatedAt: 1,
    
          // 👇 populated data
          user: {
            _id: "$user._id",
            name: "$user.name",
            email: "$user.email",
          },
    
          item: "$item",
    
          hasCheckInPhoto: {
            $gt: [{ $strLenCP: { $ifNull: ["$checkInPhoto", ""] } }, 0],
          },
        },
      },
    ]);

    const paginated = formatPaginatedResponse(rows, total, pageNum, limitNum);
    res.success(
      'Attendance history fetched successfully',
      paginated.data,
      null,
      200,
      paginated.pagination
    );
  } catch (error) {
    console.error('Error fetching user attendance history:', error);
    res.error(
      error.message || 'Failed to fetch attendance history',
      error,
      'An error occurred while fetching attendance history',
      500
    );
  }
};

/**
 * Manager/owner: single attendance row including check-in photo (for modal).
 */
export const getAttendanceRecordById = async (req, res) => {
  try {
    const { attendanceId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(attendanceId)) {
      return res.error('Invalid attendance id', null, null, 400);
    }

    const doc = await Attendance.findById(attendanceId).lean();
    if (!doc) {
      return res.error('Attendance not found', null, null, 404);
    }

    res.success('Attendance record fetched successfully', doc, null, 200);
  } catch (error) {
    console.error('Error fetching attendance record:', error);
    res.error(
      error.message || 'Failed to fetch attendance record',
      error,
      'An error occurred while fetching the attendance record',
      500
    );
  }
};

// Get list of producible items
export const getProducibleItems = async (req, res) => {
  try {
    const items = await ItemProduced.aggregate([
      {
        $group: {
          _id: '$itemName',
          totalProduced: { $sum: '$quantity' },
          lastProduced: { $max: '$productionDate' }
        }
      },
      {
        $project: {
          itemName: '$_id',
          totalProduced: 1,
          lastProduced: 1,
          _id: 0
        }
      },
      {
        $sort: { itemName: 1 }
      }
    ]);

    res.success(
      'Producible items fetched successfully',
      items,
      null,
      200
    );
  } catch (error) {
    console.error('Error fetching producible items:', error);
    res.error(
      error.message || 'Failed to fetch producible items',
      error,
      'An error occurred while fetching producible items',
      500
    );
  }
};

