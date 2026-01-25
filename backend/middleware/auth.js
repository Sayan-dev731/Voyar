import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// Admin authentication middleware
export const authMiddleware = (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');

        if (!token) {
            return res.status(401).json({ message: 'No authentication token, access denied' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.admin = decoded;
        next();
    } catch (error) {
        res.status(401).json({ message: 'Token is not valid' });
    }
};

// Combined auth middleware - accepts both user and admin tokens
export const protectOrAdmin = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');

        if (!token) {
            return res.status(401).json({ message: 'No authentication token, access denied' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Check if it's an admin token (has admin flag or adminId)
        if (decoded.isAdmin || decoded.adminId) {
            req.admin = decoded;
            req.isAdmin = true;
            return next();
        }

        // Otherwise, treat as user token
        const user = await User.findById(decoded.id).select('-password');

        if (!user) {
            // Could be an admin token without user record - allow it
            if (decoded.id || decoded.adminId) {
                req.admin = decoded;
                req.isAdmin = true;
                return next();
            }
            return res.status(401).json({ message: 'User not found' });
        }

        if (!user.isVerified) {
            return res.status(403).json({ message: 'Please verify your email first' });
        }

        req.user = user;
        req.isAdmin = false;
        next();
    } catch (error) {
        res.status(401).json({ message: 'Token is not valid' });
    }
};
// User authentication middleware
export const protect = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');

        if (!token) {
            return res.status(401).json({ message: 'No authentication token, access denied' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Get user from token
        const user = await User.findById(decoded.id).select('-password');

        if (!user) {
            return res.status(401).json({ message: 'User not found' });
        }

        if (!user.isVerified) {
            return res.status(403).json({ message: 'Please verify your email first' });
        }

        req.user = user;
        next();
    } catch (error) {
        res.status(401).json({ message: 'Token is not valid' });
    }
};
