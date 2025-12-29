import jwt from 'jsonwebtoken';
import { hashPassword, comparePassword } from '../../services/auth.service';
import { generateAccessToken } from '../utils/token.js';
import User from "../models/user/user.model";

export const protect = async (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
        return res.status(401).json({
            message: 'Not authorized, token missing'
        });
    }

    try {
        req.user = await jwt.verify(token, process.env.JWT_ACCESS_SECRET);
        next();
    }
    catch (error) {
        return res.status(401).json({
            message: 'Not authorized, token invalid'
        })
    }
}

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required",
                data: null
            });
        }

        const user = await User.findOne({ email }).select('+password');

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Invalid credentials",
                data: null
            })
        }

        const isValidPassword = await comparePassword(password, user.password);

        if (!isValidPassword) {
            return res.status(401).json({
                success: false,
                message: "Invalid credentials",
                data: null
            })
        }

        const token = await generateAccessToken({ id: user._id, role: user.role });

        return res.status(200).json({
            success: true,
            message: "Login successful",
            data: {
                token
            }
        });
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: "Server error",
            data: null
        });
    }
}

export const register = async (req,res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required",
                data: null
            })
        }

        const hashedPassword = await hashPassword(password);

        const user = await User.create({
            email,
            password: hashedPassword
        });
        return res.status(201).json({
            success: true,
            message: "User registered successfully",
            data: user
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Server error",
            data: null
        });
    }
}