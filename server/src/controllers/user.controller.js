import { createHttpError } from '../utils/httpError.js';
import { sendSuccess } from '../utils/response.js';
import { updateUserPreferences, getUserProfile, updateUserProfile } from '../services/user.service.js';
import {
  preferencesUpdateSchema,
  profileUpdateSchema,
  validate,
} from '../validators/user.validator.js';

export async function getProfile(req, res, next) {
  try {
    const user = await getUserProfile(req.user.id);

    return sendSuccess(res, {
      message: 'Profile fetched successfully',
      data: { user },
    });
  } catch (error) {
    return next(error);
  }
}

export async function updateProfile(req, res, next) {
  try {
    const { data, errors } = validate(profileUpdateSchema, req.body);

    if (errors) {
      throw createHttpError(400, 'Validation failed', 'VALIDATION_ERROR', errors);
    }

    const user = await updateUserProfile(req.user.id, data);

    return sendSuccess(res, {
      message: 'Profile updated successfully',
      data: { user },
    });
  } catch (error) {
    return next(error);
  }
}

export async function updatePreferences(req, res, next) {
  try {
    const { data, errors } = validate(preferencesUpdateSchema, req.body);

    if (errors) {
      throw createHttpError(400, 'Validation failed', 'VALIDATION_ERROR', errors);
    }

    const user = await updateUserPreferences(req.user.id, data);

    return sendSuccess(res, {
      message: 'Preferences updated successfully',
      data: { user },
    });
  } catch (error) {
    return next(error);
  }
}
