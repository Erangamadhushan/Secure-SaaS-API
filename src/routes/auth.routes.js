import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import rateLimiter from '../middlewares/rateLimit.middleware.js';
import { protect } from '../middlewares/auth.middleware.js';
import { login, register, logout, logoutAllSessions} from '../controllers/auth.controller.js';
import { restrictTo } from '../middlewares/role.middleware.js';
import { refreshAccessToken } from '../modules/auth/auth.controller.js';

import { registerValidation, loginValidation } from '../validations/auth.validation.js';
import validate from '../middlewares/validate.middleware.js';

const router = express.Router();
router.use(helmet());
router.use(cors());
router.use(rateLimiter);

router.get('/', (req, res) => {
    res.send('Welcome to the Secure SaaS API');
});


router.get("/admin", protect, restrictTo("ADMIN"), (req, res) => {
    res.json({
        message: "Admin access granted !"
    })
});
router.post("/refresh-token", refreshAccessToken);

router.post("/login", loginValidation, validate, login);
router.post("/register",registerValidation, validate, register);
router.post("/logout", protect, logout);
router.post("/logout-all", protect, logoutAllSessions);

export default router;