import { User } from '../models/User.js';
import { ApiError } from '../utils/apiError.js';

export const registerUser = async (userData) => {
  const existingUser = await User.findOne({ email: userData.email });
  if (existingUser) {
    throw new ApiError(409, 'A user with this email address already exists');
  }

  if (!userData.name || !userData.name.trim()) {
    userData.name = userData.email.split('@')[0];
  }

  const user = await User.create(userData);
  const token = user.generateAuthToken();

  const userObject = user.toObject();
  delete userObject.password;

  return { user: userObject, token };
};

export const loginUser = async (email, password) => {
  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    throw new ApiError(401, 'Invalid email or password');
  }

  const isPasswordValid = await user.comparePassword(password);
  if (!isPasswordValid) {
    throw new ApiError(401, 'Invalid email or password');
  }

  const token = user.generateAuthToken();

  const userObject = user.toObject();
  delete userObject.password;

  return { user: userObject, token };
};

export const updateProfile = async (userId, updateData) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  if (updateData.name !== undefined) {
    user.name = updateData.name.trim();
  }
  if (updateData.phone !== undefined) {
    user.phone = updateData.phone.trim();
  }
  if (updateData.dob !== undefined) {
    user.dob = updateData.dob ? new Date(updateData.dob) : null;
  }

  await user.save();

  const userObject = user.toObject();
  delete userObject.password;

  return userObject;
};

export const changePassword = async (userId, currentPassword, newPassword) => {
  const user = await User.findById(userId).select('+password');
  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  const isMatch = await user.comparePassword(currentPassword);
  if (!isMatch) {
    throw new ApiError(400, 'Current password is incorrect');
  }

  if (currentPassword === newPassword) {
    throw new ApiError(400, 'New password must be different from current password');
  }

  user.password = newPassword;
  await user.save();

  return { message: 'Password changed successfully' };
};
