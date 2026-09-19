import { User } from '../models/User.js';
import { ApiError } from '../utils/apiError.js';

export const registerUser = async (userData) => {
  const existingUser = await User.findOne({ email: userData.email });
  if (existingUser) {
    throw new ApiError(409, 'A user with this email address already exists');
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
