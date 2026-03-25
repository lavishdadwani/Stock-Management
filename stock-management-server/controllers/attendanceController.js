 import Attendance from '../models/attendance.model.js';
import ItemProduced from '../models/itemProduced.model.js';
import StockTransfer from '../models/stockTransfer.model.js';
import { mongoose } from 'mongoose';
import { validateCheckoutData } from '../utils/validation.js';

// Check-in - Start work session
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

    const attendance = new Attendance({
      userId,
      checkInTime: new Date(),
      status: 'checked-in'
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
          userId: attendance.userId
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

