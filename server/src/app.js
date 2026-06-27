import cors from 'cors';
import express from 'express';
import env from './config/env.js';
import { errorMiddleware } from './middleware/error.middleware.js';
import { notFoundMiddleware } from './middleware/notFound.middleware.js';
import apiRoutes from './routes/index.js';

const app = express();

app.use(
  cors({
    origin: env.clientUrl,
  })
);
app.use(express.json());

app.use('/api', apiRoutes);

app.use(notFoundMiddleware);
app.use(errorMiddleware);

export default app;
