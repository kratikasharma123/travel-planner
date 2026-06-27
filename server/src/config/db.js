import mongoose from 'mongoose';
import env from './env.js';

export async function connectDatabase() {
  await mongoose.connect(env.mongoUri);

  if (env.nodeEnv !== 'test') {
    console.log('MongoDB connected successfully');
  }
}
