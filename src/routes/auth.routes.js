import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import rateLimiter from '../middlewares/rateLimit.middleware.js';
import { protect, login, register } from '../middlewares/auth.middleware.js';
import { restrictTo } from '../middlewares/role.middleware.js';

import { registerValidation, loginValidation } from '../validations/auth.validation.js';
import validate from '../middlewares/validate.middleware.js';

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

router.post("/login", loginValidation, validate, login);
router.post("/register",registerValidation, validate, register);

export default router;