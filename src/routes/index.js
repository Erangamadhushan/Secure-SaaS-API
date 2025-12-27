
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import rateLimiter from './middlewares/rateLimit.middleware.js';
import { protect } from '../middlewares/auth.middleware.js';
import { restrictTo } from '../middlewares/role.middleware.js';

const router = express.Router();

router.get('/', (req, res) => {
    res.send('Welcome to the Secure SaaS API');
});

router.use(helmet());
router.use(cors());
router.use(rateLimiter);

router.get("/admin", protect, restrictTo("ADMIN"), (req, res) => {
    res.json({
        message: "Admin access granted !"
    })
});