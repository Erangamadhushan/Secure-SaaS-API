import express from 'express';
import helmet, { contentSecurityPolicy } from 'helmet';
import cors from 'cors';
import rateLimit from './middlewares/rateLimit.middleware.js';
import authRoutes from './routes/auth.routes.js';
import protectedRoutes from './routes/protected.routes.js';
import cookieParser from 'cookie-parser';
import csrf from "csurf";

const app = express();
const csrfProtection = csrf({
  cookie: true,
});
app.use(express.json({ limit: "200kb" }));
app.use(cookieParser()); // To parse cookies from incoming requests
// Helmet helps secure Express apps by setting various HTTP headers
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'"],
            objectSrc: ["'none'"],
            upgradeInsecureRequests: [],
        },
    },
    frameguard: { action: 'deny' },
    referrerPolicy: { policy: "no-referrer" },
}));
app.use(cors());
app.use(rateLimit);


app.use('/api/auth', authRoutes);
app.use('/api', protectedRoutes);


app.get('/', (req, res) => {
    res.send('Welcome to the Secure SaaS API');
});

export default app;