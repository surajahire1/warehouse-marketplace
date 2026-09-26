import { Booking, BOOKING_STATUS } from '../models/Booking.js';
import { Warehouse } from '../models/Warehouse.js';
import { ApiResponse } from '../utils/apiResponse.js';

/**
 * Controller to compute comprehensive revenue, occupancy, and operational analytics for a warehouse host.
 */
export const getManagerAnalytics = async (req, res, next) => {
  try {
    const managerId = req.user._id;
    const { warehouseId, period = '6m' } = req.query;

    // 1. Get manager's warehouses
    let warehouseQuery = { managerId };
    if (warehouseId) {
      warehouseQuery._id = warehouseId;
    }
    const warehouses = await Warehouse.find(warehouseQuery).select(
      'title address totalCapacity capacityUnit pricePerUnitPerDay currency verificationStatus'
    );

    const warehouseIds = warehouses.map((w) => w._id);

    // 2. Fetch all bookings for these facilities
    const bookings = await Booking.find({ warehouseId: { $in: warehouseIds } })
      .populate('warehouseId', 'title capacityUnit totalCapacity')
      .sort({ createdAt: 1 });

    const now = new Date();

    // 3. Compute Monthly Revenue Series (default past 6 months)
    const monthCount = period === '30d' ? 1 : period === '1y' ? 12 : period === 'all' ? 24 : 6;
    const monthlySeries = [];
    const monthMap = new Map();

    for (let i = monthCount - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const label = d.toLocaleString('en-US', { month: 'short', year: '2-digit' });
      const item = {
        key,
        label,
        grossRevenue: 0,
        netPayout: 0,
        bookingCount: 0,
      };
      monthMap.set(key, item);
      monthlySeries.push(item);
    }

    // Populate monthly series
    for (const b of bookings) {
      if (b.status === BOOKING_STATUS.CONFIRMED || b.status === BOOKING_STATUS.ACTIVE || b.status === BOOKING_STATUS.COMPLETED) {
        const bDate = new Date(b.createdAt || b.startDate);
        const key = `${bDate.getFullYear()}-${String(bDate.getMonth() + 1).padStart(2, '0')}`;
        if (monthMap.has(key)) {
          const entry = monthMap.get(key);
          const gross = b.totalAmount || 0;
          const net = b.hostPayoutAmount || Math.round(gross * 0.9 * 100) / 100;
          entry.grossRevenue += gross;
          entry.netPayout += net;
          entry.bookingCount += 1;
        }
      }
    }

    // 4. Calculate Current Facility Occupancy Rates
    const warehouseOccupancy = warehouses.map((w) => {
      const activeBookings = bookings.filter((b) => {
        const matchesWarehouse = b.warehouseId?._id?.toString() === w._id.toString() || b.warehouseId?.toString() === w._id.toString();
        const isActiveState = b.status === BOOKING_STATUS.CONFIRMED || b.status === BOOKING_STATUS.ACTIVE;
        const bStart = new Date(b.startDate);
        const bEnd = new Date(b.endDate);
        const isCurrent = bStart <= now && bEnd >= now;
        return matchesWarehouse && isActiveState && isCurrent;
      });

      const currentOccupied = activeBookings.reduce((sum, b) => sum + (b.quantityBooked || 0), 0);
      const occupancyRate = w.totalCapacity > 0 ? Math.min(100, Math.round((currentOccupied / w.totalCapacity) * 100)) : 0;

      return {
        warehouseId: w._id,
        title: w.title,
        city: w.address?.city || '',
        totalCapacity: w.totalCapacity,
        capacityUnit: w.capacityUnit,
        currentOccupied,
        availableCapacity: Math.max(0, w.totalCapacity - currentOccupied),
        occupancyRate,
        activeBookingsCount: activeBookings.length,
      };
    });

    const portfolioTotalCapacity = warehouseOccupancy.reduce((sum, w) => sum + (w.totalCapacity || 0), 0);
    const portfolioOccupied = warehouseOccupancy.reduce((sum, w) => sum + (w.currentOccupied || 0), 0);
    const portfolioOccupancyRate =
      portfolioTotalCapacity > 0 ? Math.min(100, Math.round((portfolioOccupied / portfolioTotalCapacity) * 100)) : 0;

    // 5. Overall Booking & Revenue Metrics
    let totalGrossRevenue = 0;
    let totalNetPayout = 0;
    let totalDurationDays = 0;
    let validDurationCount = 0;

    let confirmedCount = 0;
    let pendingCount = 0;
    let cancelledCount = 0;

    for (const b of bookings) {
      if (b.status === BOOKING_STATUS.PENDING) {
        pendingCount++;
      } else if (b.status === BOOKING_STATUS.CONFIRMED || b.status === BOOKING_STATUS.ACTIVE || b.status === BOOKING_STATUS.COMPLETED) {
        confirmedCount++;
        const gross = b.totalAmount || 0;
        const net = b.hostPayoutAmount || Math.round(gross * 0.9 * 100) / 100;
        totalGrossRevenue += gross;
        totalNetPayout += net;

        if (b.startDate && b.endDate) {
          const s = new Date(b.startDate);
          const e = new Date(b.endDate);
          const days = Math.max(1, Math.ceil((e - s) / (1000 * 60 * 60 * 24)));
          totalDurationDays += days;
          validDurationCount++;
        }
      } else if (b.status === BOOKING_STATUS.CANCELLED) {
        cancelledCount++;
      }
    }

    const avgDurationDays = validDurationCount > 0 ? Math.round((totalDurationDays / validDurationCount) * 10) / 10 : 0;
    const totalDecided = confirmedCount + cancelledCount;
    const conversionRate = totalDecided > 0 ? Math.round((confirmedCount / totalDecided) * 100) : 100;

    const analyticsData = {
      period,
      summary: {
        totalGrossRevenue,
        totalNetPayout,
        portfolioTotalCapacity,
        portfolioOccupied,
        portfolioOccupancyRate,
        avgDurationDays,
        totalBookings: bookings.length,
        confirmedCount,
        pendingCount,
        cancelledCount,
        conversionRate,
      },
      monthlySeries,
      warehouseOccupancy,
    };

    res.status(200).json(new ApiResponse(200, analyticsData, 'Host analytics retrieved successfully'));
  } catch (error) {
    next(error);
  }
};
