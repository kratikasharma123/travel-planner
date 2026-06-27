import User from '../models/user.model.js';
import { sanitizeUser } from './auth.service.js';
import { createHttpError } from '../utils/httpError.js';

export async function getUserProfile(userId) {
  const user = await User.findById(userId);

  if (!user) {
    throw createHttpError(404, 'User not found', 'USER_NOT_FOUND');
  }

  return sanitizeUser(user);
}

export async function updateUserProfile(userId, payload) {
  const allowedUpdates = {};

  if (payload.name !== undefined) {
    allowedUpdates.name = payload.name;
  }

  if (payload.travelPreferences !== undefined) {
    allowedUpdates.travelPreferences = payload.travelPreferences;
  }

  const user = await User.findByIdAndUpdate(userId, allowedUpdates, {
    new: true,
    runValidators: true,
  });

  if (!user) {
    throw createHttpError(404, 'User not found', 'USER_NOT_FOUND');
  }

  return sanitizeUser(user);
}

export async function updateUserPreferences(userId, preferences) {
  const user = await User.findByIdAndUpdate(
    userId,
    { travelPreferences: preferences },
    { new: true, runValidators: true }
  );

  if (!user) {
    throw createHttpError(404, 'User not found', 'USER_NOT_FOUND');
  }

  return sanitizeUser(user);
}
