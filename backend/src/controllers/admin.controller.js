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
