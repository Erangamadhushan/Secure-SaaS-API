import app from './app.js';
import { connectDB } from './config/db.js';
import dotenv from 'dotenv';
import errorMiddleware from "./middlewares/error.middleware.js";

import { appLogger } from './utils/logger.js';

dotenv.config();
connectDB();
const PORT = process.env.PORT || 5000;

app.use(errorMiddleware);

app.listen(PORT, () => {
    appLogger.info(`Server is running on port ${PORT}`, {
        port: PORT, 
        environment: process.env.NODE_ENV || 'development',
    });
});