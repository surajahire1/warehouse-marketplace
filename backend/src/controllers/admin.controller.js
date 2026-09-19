import { User } from '../models/User.js';
import { ApiResponse } from '../utils/apiResponse.js';

export const getAllUsers = async (req, res, next) => {
  try {
    const { role, search } = req.query;
    const filter = {};

    if (role) {
      filter.role = role;
    }

    if (search) {
      filter.$or = [
        { name: new RegExp(search, 'i') },
        { email: new RegExp(search, 'i') },
      ];
    }

    const users = await User.find(filter)
      .select('-password')
      .sort({ createdAt: -1 });

    res.status(200).json(new ApiResponse(200, users, 'Users retrieved successfully'));
  } catch (error) {
    next(error);
  }
};

export const getPendingWarehouses = async (req, res, next) => {
  try {
    const { status = 'PENDING' } = req.query;
    const filter = {};
    if (status !== 'ALL') {
      filter.verificationStatus = status;
    }

    const { Warehouse } = await import('../models/Warehouse.js');
    const warehouses = await Warehouse.find(filter)
      .populate('managerId', 'name email phone')
      .sort({ createdAt: -1 });

    res.status(200).json(new ApiResponse(200, warehouses, 'Warehouses for verification retrieved'));
  } catch (error) {
    next(error);
  }
};

export const verifyWarehouse = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, rejectionReason = '' } = req.body;

    if (!['APPROVED', 'REJECTED'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Status must be APPROVED or REJECTED' });
    }

    const { Warehouse } = await import('../models/Warehouse.js');
    const warehouse = await Warehouse.findById(id);

    if (!warehouse) {
      return res.status(404).json({ success: false, message: 'Warehouse not found' });
    }

    warehouse.verificationStatus = status;
    if (status === 'APPROVED') {
      warehouse.isActive = true;
      warehouse.rejectionReason = '';
    } else {
      warehouse.rejectionReason = rejectionReason;
    }

    await warehouse.save();

    res.status(200).json(
      new ApiResponse(
        200,
        warehouse,
        `Warehouse ${status === 'APPROVED' ? 'approved and published to marketplace' : 'rejected'}`
      )
    );
  } catch (error) {
    next(error);
  }
};
