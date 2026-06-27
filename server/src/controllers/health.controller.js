import env from '../config/env.js';
import { sendSuccess } from '../utils/response.js';

export function getHealth(req, res) {
  return sendSuccess(res, {
    message: 'TravelAI Planner API is healthy',
    data: {
      status: 'ok',
      environment: env.nodeEnv,
    },
  });
}
