import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import rateLimiter from './middlewares/rateLimit.middleware.js';
import * as authRoutes from './routes/index.js';
import * as protectedRoutes from './routes/protected.routes.js';

const app = express();

app.use(express.json({ limit: "10kb" }));
app.use(helmet());
app.use(cors());
app.use(rateLimiter);

app.use('/api/auth', authRoutes);
app.use('/api', protectedRoutes);


app.get('/', (req, res) => {
    res.send('Welcome to the Secure SaaS API');
});

export default app;