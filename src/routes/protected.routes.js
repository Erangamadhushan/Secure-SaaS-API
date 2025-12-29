import express from 'express';
import { protect } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.get('/protected', protect, (req, res) => {
    res.json({
        message: 'You have accessed a protected route',
        user: req.user
    });
});

router.get('/dashboard', protect, (req, res) => {
    res.json({
        message: 'Welcome to your dashboard',
        user: req.user
    });
});

export default router;