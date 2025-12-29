import app from './app.js';
import { connectDB } from './config/db.js';
import dotenv from 'dotenv';
import errorMiddleware from "./middlewares/error.middleware.js";

dotenv.config();
connectDB();
const PORT = process.env.PORT || 5000;

app.use(errorMiddleware);

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});