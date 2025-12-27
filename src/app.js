import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import rateLimiter from './middlewares/rateLimit.middleware.js';

const app = express();

app.use(express.json({ limit: "10kb" }));
app.use(helmet());
app.use(cors());
app.use(rateLimiter);

export default app;