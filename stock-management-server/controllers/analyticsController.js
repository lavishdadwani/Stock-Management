import Sale from '../models/sale.model.js';
import StockTransfer from '../models/stockTransfer.model.js';
import ItemProduced from '../models/itemProduced.model.js';
import Attendance from '../models/attendance.model.js';

const DEFAULT_RANGE_DAYS = 30;

const getDateRange = (query) => {
  const endDate = query.endDate ? new Date(query.endDate) : new Date();
  endDate.setHours(23, 59, 59, 999);

  const startDate = query.startDate
    ? new Date(query.startDate)
    : new Date(endDate.getTime() - (DEFAULT_RANGE_DAYS - 1) * 24 * 60 * 60 * 1000);
  startDate.setHours(0, 0, 0, 0);

  return { startDate, endDate };
};

// KPI row: revenue, sales count, items produced, attendance hours for the selected range
export const getOverview = async (req, res) => {
  try {
    const { startDate, endDate } = getDateRange(req.query);

    const [salesAgg] = await Sale.aggregate([
      { $match: { status: 'completed', saleDate: { $gte: startDate, $lte: endDate } } },
      { $group: { _id: null, totalRevenue: { $sum: '$totalAmount' }, totalSalesCount: { $sum: 1 } } }
    ]);

    const [producedAgg] = await ItemProduced.aggregate([
      { $match: { source: 'produced', productionDate: { $gte: startDate, $lte: endDate } } },
      { $group: { _id: null, totalProduced: { $sum: '$quantity' } } }
    ]);

    const attendanceRecords = await Attendance.find({
      checkInTime: { $gte: startDate, $lte: endDate },
      checkOutTime: { $ne: null }
    }).select('checkInTime checkOutTime');

    const totalHours = attendanceRecords.reduce(
      (sum, r) => sum + (new Date(r.checkOutTime) - new Date(r.checkInTime)) / 3600000,
      0
    );

    res.success(
      'Overview stats fetched successfully',
      {
        totalRevenue: Math.round((salesAgg?.totalRevenue || 0) * 100) / 100,
        totalSalesCount: salesAgg?.totalSalesCount || 0,
        totalItemsProduced: Math.round((producedAgg?.totalProduced || 0) * 100) / 100,
        totalAttendanceHours: Math.round(totalHours * 10) / 10,
        startDate,
        endDate
      },
      null,
      200
    );
  } catch (error) {
    console.error('Error fetching overview stats:', error);
    res.error(
      error.message || 'Failed to fetch overview stats',
      error,
      'An error occurred while fetching overview stats',
      500
    );
  }
};

// Daily revenue trend for the selected range
export const getSalesTrend = async (req, res) => {
  try {
    const { startDate, endDate } = getDateRange(req.query);

    const rows = await Sale.aggregate([
      { $match: { status: 'completed', saleDate: { $gte: startDate, $lte: endDate } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$saleDate' } },
          revenue: { $sum: '$totalAmount' },
          quantity: { $sum: '$quantity' }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    const data = rows.map((r) => ({
      date: r._id,
      revenue: Math.round((r.revenue || 0) * 100) / 100,
      quantity: r.quantity || 0
    }));

    res.success('Sales trend fetched successfully', data, null, 200);
  } catch (error) {
    console.error('Error fetching sales trend:', error);
    res.error(
      error.message || 'Failed to fetch sales trend',
      error,
      'An error occurred while fetching sales trend',
      500
    );
  }
};

// Daily material (aluminium/copper/scrap) transfer volume for the selected range
export const getMaterialUsageTrend = async (req, res) => {
  try {
    const { startDate, endDate } = getDateRange(req.query);

    const rows = await StockTransfer.aggregate([
      { $match: { transferDate: { $gte: startDate, $lte: endDate } } },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: '%Y-%m-%d', date: '$transferDate' } },
            itemName: '$itemName'
          },
          quantity: { $sum: '$quantity' }
        }
      },
      { $sort: { '_id.date': 1 } }
    ]);

    const byDate = {};
    rows.forEach((r) => {
      const date = r._id.date;
      if (!byDate[date]) {
        byDate[date] = { date, aluminium: 0, copper: 0, scrap: 0 };
      }
      byDate[date][r._id.itemName] = Math.round((r.quantity || 0) * 100) / 100;
    });

    const data = Object.values(byDate).sort((a, b) => a.date.localeCompare(b.date));

    res.success('Material usage trend fetched successfully', data, null, 200);
  } catch (error) {
    console.error('Error fetching material usage trend:', error);
    res.error(
      error.message || 'Failed to fetch material usage trend',
      error,
      'An error occurred while fetching material usage trend',
      500
    );
  }
};

// Items produced by item name for the selected range
export const getProductionSummary = async (req, res) => {
  try {
    const { startDate, endDate } = getDateRange(req.query);

    const rows = await ItemProduced.aggregate([
      { $match: { source: 'produced', productionDate: { $gte: startDate, $lte: endDate } } },
      { $group: { _id: '$itemName', totalQuantity: { $sum: '$quantity' } } },
      { $sort: { totalQuantity: -1 } }
    ]);

    const data = rows.map((r) => ({
      itemName: r._id,
      totalQuantity: Math.round((r.totalQuantity || 0) * 100) / 100
    }));

    res.success('Production summary fetched successfully', data, null, 200);
  } catch (error) {
    console.error('Error fetching production summary:', error);
    res.error(
      error.message || 'Failed to fetch production summary',
      error,
      'An error occurred while fetching production summary',
      500
    );
  }
};
