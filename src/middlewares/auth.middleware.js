import jwt from 'jsonwebtoken';

export const protect = (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
        return res.status(401).json({
            message: 'Not authorized, token missing'
        })
    }

    try {
        req.user = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
        next();
    }
    catch (error) {
        return res.status(401).json({
            message: 'Not authorized, token invalid'
        })
    }
}