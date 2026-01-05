import mongoose from 'mongoose';

// Site settings schema (singleton)
const siteSettingsSchema = new mongoose.Schema({
    recoveryEmail: {
        type: String,
        default: 'sayancodder731@gmail.com'
    },
    siteName: {
        type: String,
        default: 'Voyar Eyewear'
    },
    supportEmail: {
        type: String,
        default: 'support@voyar.com'
    },
    platformCharges: {
        type: Number,
        default: 0,
        min: 0
    },
    deliveryCharges: {
        type: Number,
        default: 0,
        min: 0
    }
}, { timestamps: true });

export const SiteSettings = mongoose.model('SiteSettings', siteSettingsSchema);

const adminSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        unique: true,
        sparse: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['super_admin', 'admin', 'moderator'],
        default: 'admin'
    },
    permissions: {
        manageProducts: { type: Boolean, default: true },
        manageOrders: { type: Boolean, default: true },
        manageUsers: { type: Boolean, default: false },
        viewAnalytics: { type: Boolean, default: true },
        manageAdmins: { type: Boolean, default: false },
        manageSettings: { type: Boolean, default: false }
    },
    isActive: {
        type: Boolean,
        default: true
    },
    lastLogin: {
        type: Date
    },
    loginHistory: [{
        ip: String,
        userAgent: String,
        timestamp: { type: Date, default: Date.now },
        success: Boolean
    }],
    failedLoginAttempts: {
        type: Number,
        default: 0
    },
    lockUntil: {
        type: Date
    },
    twoFactorEnabled: {
        type: Boolean,
        default: false
    },
    twoFactorSecret: {
        type: String
    },
    profileImage: {
        type: String
    },
    // Password reset fields
    resetPasswordToken: {
        type: String
    },
    resetPasswordExpires: {
        type: Date
    },
    // Password history for preventing reuse (OWASP recommendation)
    passwordHistory: [{
        hash: { type: String, required: true },
        changedAt: { type: Date, default: Date.now }
    }],
    // Track when password was last changed
    passwordChangedAt: {
        type: Date
    }
}, {
    timestamps: true
});

// Check if account is locked
adminSchema.virtual('isLocked').get(function () {
    return !!(this.lockUntil && this.lockUntil > Date.now());
});

// Increment failed login attempts
adminSchema.methods.incLoginAttempts = async function () {
    // Reset if lock has expired
    if (this.lockUntil && this.lockUntil < Date.now()) {
        return this.updateOne({
            $set: { failedLoginAttempts: 1 },
            $unset: { lockUntil: 1 }
        });
    }

    const updates = { $inc: { failedLoginAttempts: 1 } };

    // Lock account after 5 failed attempts for 30 minutes
    if (this.failedLoginAttempts + 1 >= 5) {
        updates.$set = { lockUntil: Date.now() + 30 * 60 * 1000 };
    }

    return this.updateOne(updates);
};

const Admin = mongoose.model('Admin', adminSchema);

export default Admin;
