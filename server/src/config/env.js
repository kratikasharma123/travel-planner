import dotenv from 'dotenv';

dotenv.config();

const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT) || 5000,
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  mongoUri: process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/travelai_planner',
  jwtSecret: process.env.JWT_SECRET || 'replace_with_strong_secret_for_local_dev',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  jwtCookieName: process.env.JWT_COOKIE_NAME || 'travelai_token',
};

export default env;
