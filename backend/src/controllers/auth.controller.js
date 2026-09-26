import * as authService from '../services/auth.service.js';
import { ApiResponse } from '../utils/apiResponse.js';

export const register = async (req, res, next) => {
  try {
    const result = await authService.registerUser(req.body);
    res.status(201).json(new ApiResponse(201, result, 'Registration successful'));
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const result = await authService.loginUser(email, password);
    res.status(200).json(new ApiResponse(200, result, 'Login successful'));
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req, res) => {
  res.status(200).json(new ApiResponse(200, req.user, 'Current user profile'));
};

export const updateProfile = async (req, res, next) => {
  try {
    const updatedUser = await authService.updateProfile(req.user._id, req.body);
    res.status(200).json(new ApiResponse(200, updatedUser, 'Profile updated successfully'));
  } catch (error) {
    next(error);
  }
};

export const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const result = await authService.changePassword(req.user._id, currentPassword, newPassword);
    res.status(200).json(new ApiResponse(200, result, 'Password changed successfully'));
  } catch (error) {
    next(error);
  }
};
