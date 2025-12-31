import mongoose from 'mongoose';
import { appLogger } from '../utils/logger.js';

export const connectDB = async () => {
    await mongoose.connect(process.env.MONGO_URI);
    appLogger.info('MongoDB connected successfully', {
        host: mongoose.connection.host,
        port: mongoose.connection.port,
        dbName: mongoose.connection.name,
        timestamp: new Date().toISOString()
    });

    console.log('MongoDB connected');
}