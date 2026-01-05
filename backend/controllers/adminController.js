import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import Admin, { SiteSettings } from '../models/Admin.js';
import User from '../models/User.js';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import { sendAdminPasswordResetEmail } from '../config/email.js';
import { validatePasswordStrength, getClientIp, getSafeUserAgent } from '../config/security.js';

// =============================================================================
// Admin login with enhanced security
// =============================================================================
export const adminLogin = async (req, res) => {
    try {
        const { username, password } = req.body;
        const ip = req.ip || req.connection.remoteAddress;
        const userAgent = req.headers['user-agent'];

        // Check if admin exists
        let admin = await Admin.findOne({ username });

        // If no admin exists and credentials match env, create default super admin
        if (!admin && username === 'admin' && password === process.env.ADMIN_PASSWORD) {
            const hashedPassword = await bcrypt.hash(password, 12);
            admin = new Admin({
                username: 'admin',
                password: hashedPassword,
                role: 'admin',
                permissions: {
                    manageProducts: true,
                    manageOrders: true,
                    manageUsers: true,
                    viewAnalytics: true,
                    manageAdmins: true,
                    manageSettings: true
                }
            });
            await admin.save();
        }

        if (!admin) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Check if account is locked
        if (admin.isLocked) {
            const lockTimeRemaining = Math.ceil((admin.lockUntil - Date.now()) / 60000);
            return res.status(423).json({
                message: `Account locked. Try again in ${lockTimeRemaining} minutes.`,
                locked: true,
                lockTimeRemaining
            });
        }

        // Check if account is active
        if (!admin.isActive) {
            return res.status(403).json({ message: 'Account has been deactivated' });
        }

        // Check password
        const isMatch = await bcrypt.compare(password, admin.password);

        // Log login attempt
        admin.loginHistory.push({
            ip,
            userAgent,
            timestamp: new Date(),
            success: isMatch
        });

        // Keep only last 50 login attempts
        if (admin.loginHistory.length > 50) {
            admin.loginHistory = admin.loginHistory.slice(-50);
        }

        if (!isMatch) {
            await admin.incLoginAttempts();
            await admin.save();

            const attemptsRemaining = 5 - (admin.failedLoginAttempts + 1);
            return res.status(401).json({
                message: `Invalid credentials. ${attemptsRemaining > 0 ? `${attemptsRemaining} attempts remaining.` : 'Account will be locked.'}`
            });
        }

        // Reset failed attempts on successful login
        admin.failedLoginAttempts = 0;
        admin.lockUntil = undefined;
        admin.lastLogin = new Date();
        await admin.save();

        // Create token with more info
        const token = jwt.sign(
            {
                id: admin._id,
                username: admin.username,
                role: admin.role,
                permissions: admin.permissions
            },
            process.env.JWT_SECRET,
            { expiresIn: '8h' }
        );

        res.json({
            token,
            admin: {
                id: admin._id,
                username: admin.username,
                email: admin.email,
                role: admin.role,
                permissions: admin.permissions,
                profileImage: admin.profileImage,
                lastLogin: admin.lastLogin
            }
        });
    } catch (error) {
        console.error('Admin login error:', error);
        res.status(500).json({ message: error.message });
    }
};

// Verify admin token
export const verifyToken = async (req, res) => {
    try {
        const admin = await Admin.findById(req.admin.id).select('-password -twoFactorSecret -loginHistory');
        if (!admin) {
            return res.status(404).json({ message: 'Admin not found' });
        }
        if (!admin.isActive) {
            return res.status(403).json({ message: 'Account has been deactivated' });
        }
        res.json(admin);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// =============================================================================
// Change admin password with security validation
// =============================================================================
export const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        // Validate password strength using security config
        const passwordValidation = validatePasswordStrength(newPassword);
        if (!passwordValidation.isValid) {
            return res.status(400).json({
                message: 'Password does not meet security requirements',
                errors: passwordValidation.errors,
                hint: 'Password must be at least 8 characters with uppercase, lowercase, number, and special character'
            });
        }

        const admin = await Admin.findById(req.admin.id).select('+passwordHistory +password');

        if (!admin) {
            return res.status(404).json({ message: 'Admin not found' });
        }

        const isMatch = await bcrypt.compare(currentPassword, admin.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Current password is incorrect' });
        }

        // Check if new password is same as current
        if (currentPassword === newPassword) {
            return res.status(400).json({
                message: 'New password must be different from current password'
            });
        }

        // Check password history (prevent reuse of last 5 passwords)
        if (admin.passwordHistory && admin.passwordHistory.length > 0) {
            for (const oldPassword of admin.passwordHistory) {
                const wasUsed = await bcrypt.compare(newPassword, oldPassword.hash);
                if (wasUsed) {
                    return res.status(400).json({
                        message: 'This password was used recently. Please choose a different password.',
                        hint: 'For security, you cannot reuse your last 5 passwords'
                    });
                }
            }
        }

        // Also check against current password
        const matchesCurrent = await bcrypt.compare(newPassword, admin.password);
        if (matchesCurrent) {
            return res.status(400).json({
                message: 'New password must be different from current password'
            });
        }

        // Store current password in history before updating
        if (!admin.passwordHistory) {
            admin.passwordHistory = [];
        }
        admin.passwordHistory.push({
            hash: admin.password,
            changedAt: new Date()
        });

        // Keep only last 5 passwords
        if (admin.passwordHistory.length > 5) {
            admin.passwordHistory = admin.passwordHistory.slice(-5);
        }

        const hashedPassword = await bcrypt.hash(newPassword, 12);
        admin.password = hashedPassword;
        admin.passwordChangedAt = new Date();
        await admin.save();

        res.json({
            message: 'Password changed successfully',
            passwordChangedAt: admin.passwordChangedAt
        });
    } catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({ message: error.message });
    }
};

// Update admin profile
export const updateProfile = async (req, res) => {
    try {
        const { email, profileImage } = req.body;
        const admin = await Admin.findById(req.admin.id);

        if (email) admin.email = email;
        if (profileImage) admin.profileImage = profileImage;

        await admin.save();

        res.json({
            message: 'Profile updated successfully',
            admin: {
                id: admin._id,
                username: admin.username,
                email: admin.email,
                role: admin.role,
                profileImage: admin.profileImage
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get dashboard analytics
export const getDashboardAnalytics = async (req, res) => {
    try {
        const now = new Date();
        const startOfToday = new Date(now.setHours(0, 0, 0, 0));
        const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

        // Orders analytics
        const [
            totalOrders,
            todayOrders,
            weekOrders,
            monthOrders,
            pendingOrders,
            processingOrders,
            shippedOrders,
            deliveredOrders,
            cancelledOrders
        ] = await Promise.all([
            Order.countDocuments(),
            Order.countDocuments({ createdAt: { $gte: startOfToday } }),
            Order.countDocuments({ createdAt: { $gte: startOfWeek } }),
            Order.countDocuments({ createdAt: { $gte: startOfMonth } }),
            Order.countDocuments({ status: 'pending' }),
            Order.countDocuments({ status: 'processing' }),
            Order.countDocuments({ status: 'shipped' }),
            Order.countDocuments({ status: 'delivered' }),
            Order.countDocuments({ status: 'cancelled' })
        ]);

        // Revenue analytics
        const revenueAggregation = await Order.aggregate([
            { $match: { paymentStatus: 'paid' } },
            {
                $group: {
                    _id: null,
                    total: { $sum: '$totalAmount' },
                    count: { $sum: 1 }
                }
            }
        ]);

        const monthlyRevenue = await Order.aggregate([
            { $match: { paymentStatus: 'paid', createdAt: { $gte: startOfMonth } } },
            { $group: { _id: null, total: { $sum: '$totalAmount' } } }
        ]);

        const lastMonthRevenue = await Order.aggregate([
            {
                $match: {
                    paymentStatus: 'paid',
                    createdAt: { $gte: startOfLastMonth, $lt: startOfMonth }
                }
            },
            { $group: { _id: null, total: { $sum: '$totalAmount' } } }
        ]);

        // User analytics
        const [totalUsers, verifiedUsers, newUsersThisMonth] = await Promise.all([
            User.countDocuments(),
            User.countDocuments({ isVerified: true }),
            User.countDocuments({ createdAt: { $gte: startOfMonth } })
        ]);

        // Product analytics
        const [totalProducts, outOfStock, lowStock] = await Promise.all([
            Product.countDocuments(),
            Product.countDocuments({ inStock: false }),
            Product.countDocuments({ inStock: true }) // Could add quantity field for real low stock
        ]);

        // Top selling products
        const topProducts = await Order.aggregate([
            { $unwind: '$items' },
            {
                $group: {
                    _id: '$items.productName',
                    totalSold: { $sum: '$items.quantity' },
                    revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } }
                }
            },
            { $sort: { totalSold: -1 } },
            { $limit: 5 }
        ]);

        // Recent orders
        const recentOrders = await Order.find()
            .sort({ createdAt: -1 })
            .limit(10)
            .select('customerName customerEmail totalAmount status paymentStatus createdAt');

        // Sales by day (last 7 days)
        const salesByDay = await Order.aggregate([
            {
                $match: {
                    paymentStatus: 'paid',
                    createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
                }
            },
            {
                $group: {
                    _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
                    revenue: { $sum: '$totalAmount' },
                    orders: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        // Orders by status for pie chart
        const ordersByStatus = [
            { name: 'Pending', value: pendingOrders, color: '#f59e0b' },
            { name: 'Processing', value: processingOrders, color: '#3b82f6' },
            { name: 'Shipped', value: shippedOrders, color: '#8b5cf6' },
            { name: 'Delivered', value: deliveredOrders, color: '#22c55e' },
            { name: 'Cancelled', value: cancelledOrders, color: '#ef4444' }
        ];

        const currentMonthRev = monthlyRevenue[0]?.total || 0;
        const lastMonthRev = lastMonthRevenue[0]?.total || 0;
        const revenueGrowth = lastMonthRev > 0
            ? (((currentMonthRev - lastMonthRev) / lastMonthRev) * 100).toFixed(1)
            : 100;

        res.json({
            orders: {
                total: totalOrders,
                today: todayOrders,
                thisWeek: weekOrders,
                thisMonth: monthOrders,
                byStatus: ordersByStatus
            },
            revenue: {
                total: revenueAggregation[0]?.total || 0,
                thisMonth: currentMonthRev,
                lastMonth: lastMonthRev,
                growth: parseFloat(revenueGrowth)
            },
            users: {
                total: totalUsers,
                verified: verifiedUsers,
                newThisMonth: newUsersThisMonth
            },
            products: {
                total: totalProducts,
                outOfStock,
                lowStock
            },
            topProducts,
            recentOrders,
            salesByDay
        });
    } catch (error) {
        console.error('Analytics error:', error);
        res.status(500).json({ message: error.message });
    }
};

// Get all users (admin only)
export const getAllUsers = async (req, res) => {
    try {
        const { page = 1, limit = 20, search, verified } = req.query;

        const query = {};
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } }
            ];
        }
        if (verified !== undefined) {
            query.isVerified = verified === 'true';
        }

        const users = await User.find(query)
            .select('-password -verificationToken -resetPasswordToken -cart')
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit));

        const total = await User.countDocuments(query);

        res.json({
            users,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get user details
export const getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id)
            .select('-password -verificationToken -resetPasswordToken');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Get user's order history
        const orders = await Order.find({ userId: user._id })
            .sort({ createdAt: -1 })
            .limit(10);

        res.json({ user, orders });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get all admins (super admin only)
export const getAllAdmins = async (req, res) => {
    try {
        if (req.admin.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied. Super admin only.' });
        }

        const admins = await Admin.find()
            .select('-password -twoFactorSecret -loginHistory')
            .sort({ createdAt: -1 });

        res.json(admins);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Create new admin (super admin only)
export const createAdmin = async (req, res) => {
    try {
        if (req.admin.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied. Super admin only.' });
        }

        const { username, email, password, role, permissions } = req.body;

        const existingAdmin = await Admin.findOne({ $or: [{ username }, { email }] });
        if (existingAdmin) {
            return res.status(400).json({ message: 'Username or email already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 12);
        const newAdmin = new Admin({
            username,
            email,
            password: hashedPassword,
            role: role || 'admin',
            permissions: permissions || {}
        });

        await newAdmin.save();

        res.status(201).json({
            message: 'Admin created successfully',
            admin: {
                id: newAdmin._id,
                username: newAdmin.username,
                email: newAdmin.email,
                role: newAdmin.role,
                permissions: newAdmin.permissions
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update admin (super admin only)
export const updateAdmin = async (req, res) => {
    try {
        if (req.admin.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied. Super admin only.' });
        }

        const { role, permissions, isActive } = req.body;
        const admin = await Admin.findById(req.params.id);

        if (!admin) {
            return res.status(404).json({ message: 'Admin not found' });
        }

        // Prevent deactivating yourself
        if (req.admin.id === req.params.id && isActive === false) {
            return res.status(400).json({ message: 'Cannot deactivate your own account' });
        }

        if (role) admin.role = role;
        if (permissions) admin.permissions = { ...admin.permissions, ...permissions };
        if (isActive !== undefined) admin.isActive = isActive;

        await admin.save();

        res.json({
            message: 'Admin updated successfully',
            admin: {
                id: admin._id,
                username: admin.username,
                role: admin.role,
                permissions: admin.permissions,
                isActive: admin.isActive
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Delete admin (super admin only)
export const deleteAdmin = async (req, res) => {
    try {
        if (req.admin.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied. Super admin only.' });
        }

        if (req.admin.id === req.params.id) {
            return res.status(400).json({ message: 'Cannot delete your own account' });
        }

        const admin = await Admin.findByIdAndDelete(req.params.id);
        if (!admin) {
            return res.status(404).json({ message: 'Admin not found' });
        }

        res.json({ message: 'Admin deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get login history
export const getLoginHistory = async (req, res) => {
    try {
        const admin = await Admin.findById(req.admin.id).select('loginHistory');
        res.json(admin.loginHistory.reverse().slice(0, 20));
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Export data
export const exportData = async (req, res) => {
    try {
        const { type } = req.params;
        let data;

        switch (type) {
            case 'orders':
                data = await Order.find().sort({ createdAt: -1 });
                break;
            case 'users':
                data = await User.find().select('-password -verificationToken -resetPasswordToken').sort({ createdAt: -1 });
                break;
            case 'products':
                data = await Product.find().sort({ createdAt: -1 });
                break;
            default:
                return res.status(400).json({ message: 'Invalid export type' });
        }

        res.json({ data, exportedAt: new Date(), count: data.length });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update user details
// @route   PUT /api/admin/users/:id
// @access  Private/Admin
export const updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, email, phone } = req.body;

        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Check if email is being changed and if it's already taken
        if (email && email !== user.email) {
            const existingUser = await User.findOne({ email });
            if (existingUser) {
                return res.status(400).json({ message: 'Email already in use' });
            }
            user.email = email;
        }

        if (name) user.name = name;
        if (phone !== undefined) user.phone = phone;

        await user.save();

        res.json({
            message: 'User updated successfully',
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                isVerified: user.isVerified,
                createdAt: user.createdAt,
                addresses: user.addresses
            }
        });
    } catch (error) {
        console.error('Update user error:', error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
export const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;

        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Delete user's orders
        await Order.deleteMany({ userId: user._id });

        // Delete the user
        await User.findByIdAndDelete(id);

        res.json({ message: 'User and associated orders deleted successfully' });
    } catch (error) {
        console.error('Delete user error:', error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Admin forgot password
// @route   POST /api/admin/forgot-password
// @access  Public
export const adminForgotPassword = async (req, res) => {
    try {
        const { username } = req.body;

        if (!username) {
            return res.status(400).json({ message: 'Please provide username' });
        }

        // Find admin by username
        const admin = await Admin.findOne({ username });

        if (!admin) {
            // For security, don't reveal if username exists
            return res.json({ message: 'If an account exists with this username, a password reset email will be sent to the recovery email.' });
        }

        // Get site settings for recovery email
        let settings = await SiteSettings.findOne();
        if (!settings) {
            settings = await SiteSettings.create({});
        }

        const recoveryEmail = settings.recoveryEmail || 'sayancodder731@gmail.com';

        // Generate reset token
        const resetToken = crypto.randomBytes(32).toString('hex');
        const resetTokenExpires = Date.now() + 60 * 60 * 1000; // 1 hour

        admin.resetPasswordToken = resetToken;
        admin.resetPasswordExpires = resetTokenExpires;
        await admin.save();

        // Send password reset email to recovery email
        await sendAdminPasswordResetEmail(recoveryEmail, admin.username, resetToken);

        res.json({
            message: 'If an account exists with this username, a password reset email will be sent to the recovery email.',
            // In development, you might want to show the email
            ...(process.env.NODE_ENV === 'development' && { recoveryEmail })
        });
    } catch (error) {
        console.error('Admin forgot password error:', error);
        res.status(500).json({ message: 'Server error. Please try again later.' });
    }
};

// =============================================================================
// @desc    Admin reset password
// @route   POST /api/admin/reset-password/:token
// @access  Public
// @security Password history check, Strength validation
// =============================================================================
export const adminResetPassword = async (req, res) => {
    try {
        const { token } = req.params;
        const { password } = req.body;

        if (!password) {
            return res.status(400).json({ message: 'Please provide a new password' });
        }

        // Validate password strength
        const passwordValidation = validatePasswordStrength(password);
        if (!passwordValidation.isValid) {
            return res.status(400).json({
                message: 'Password does not meet security requirements',
                errors: passwordValidation.errors,
                hint: 'Password must be at least 8 characters with uppercase, lowercase, number, and special character'
            });
        }

        // Find admin with valid reset token
        const admin = await Admin.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: Date.now() }
        }).select('+passwordHistory +password');

        if (!admin) {
            return res.status(400).json({ message: 'Invalid or expired reset token' });
        }

        // Check password history (prevent reuse)
        if (admin.passwordHistory && admin.passwordHistory.length > 0) {
            for (const oldPassword of admin.passwordHistory) {
                const wasUsed = await bcrypt.compare(password, oldPassword.hash);
                if (wasUsed) {
                    return res.status(400).json({
                        message: 'This password was used recently. Please choose a different password.',
                        hint: 'For security, you cannot reuse your last 5 passwords'
                    });
                }
            }
        }

        // Check against current password
        const matchesCurrent = await bcrypt.compare(password, admin.password);
        if (matchesCurrent) {
            return res.status(400).json({
                message: 'New password must be different from current password'
            });
        }

        // Store current password in history before updating
        if (!admin.passwordHistory) {
            admin.passwordHistory = [];
        }
        admin.passwordHistory.push({
            hash: admin.password,
            changedAt: new Date()
        });

        // Keep only last 5 passwords
        if (admin.passwordHistory.length > 5) {
            admin.passwordHistory = admin.passwordHistory.slice(-5);
        }

        // Hash new password and save
        const hashedPassword = await bcrypt.hash(password, 12);
        admin.password = hashedPassword;
        admin.resetPasswordToken = undefined;
        admin.resetPasswordExpires = undefined;
        admin.failedLoginAttempts = 0;
        admin.lockUntil = undefined;
        admin.passwordChangedAt = new Date();
        await admin.save();

        res.json({ message: 'Password reset successfully. You can now login with your new password.' });
    } catch (error) {
        console.error('Admin reset password error:', error);
        res.status(500).json({ message: 'Server error. Please try again later.' });
    }
};

// @desc    Get site settings
// @route   GET /api/admin/settings
// @access  Private/Admin
export const getSiteSettings = async (req, res) => {
    try {
        let settings = await SiteSettings.findOne();
        if (!settings) {
            settings = await SiteSettings.create({});
        }
        res.json(settings);
    } catch (error) {
        console.error('Get settings error:', error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get public site settings (platform and delivery charges)
// @route   GET /api/admin/settings/public
// @access  Public
export const getPublicSiteSettings = async (req, res) => {
    try {
        let settings = await SiteSettings.findOne();
        if (!settings) {
            settings = await SiteSettings.create({});
        }
        // Only return public-facing settings
        res.json({
            platformCharges: settings.platformCharges || 0,
            deliveryCharges: settings.deliveryCharges || 0,
            siteName: settings.siteName
        });
    } catch (error) {
        console.error('Get public settings error:', error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update site settings
// @route   PUT /api/admin/settings
// @access  Private/Admin (admin only)
export const updateSiteSettings = async (req, res) => {
    try {
        if (req.admin.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied. Super admin only.' });
        }

        const { recoveryEmail, siteName, supportEmail, platformCharges, deliveryCharges } = req.body;

        let settings = await SiteSettings.findOne();
        if (!settings) {
            settings = new SiteSettings({});
        }

        if (recoveryEmail) settings.recoveryEmail = recoveryEmail;
        if (siteName) settings.siteName = siteName;
        if (supportEmail) settings.supportEmail = supportEmail;
        if (platformCharges !== undefined) settings.platformCharges = platformCharges;
        if (deliveryCharges !== undefined) settings.deliveryCharges = deliveryCharges;

        await settings.save();

        res.json({ message: 'Settings updated successfully', settings });
    } catch (error) {
        console.error('Update settings error:', error);
        res.status(500).json({ message: error.message });
    }
};
