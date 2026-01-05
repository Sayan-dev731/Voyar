import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

/**
 * Password history schema for storing previous password hashes
 * Used to prevent password reuse (OWASP recommendation)
 */
const passwordHistorySchema = new mongoose.Schema({
    hash: {
        type: String,
        required: true
    },
    changedAt: {
        type: Date,
        default: Date.now
    }
}, { _id: false });

const cartItemSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true,
    },
    quantity: {
        type: Number,
        required: true,
        min: 1,
        default: 1,
    },
    selectedColor: {
        type: String,
    },
}, { _id: false });

const addressSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    phone: {
        type: String,
        required: true,
    },
    street: {
        type: String,
        required: true,
    },
    city: {
        type: String,
        required: true,
    },
    state: {
        type: String,
        required: true,
    },
    zipCode: {
        type: String,
        required: true,
    },
    country: {
        type: String,
        default: 'India',
    },
    isDefault: {
        type: Boolean,
        default: false,
    },
    type: {
        type: String,
        enum: ['home', 'work', 'other'],
        default: 'home',
    },
});

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provide a name'],
        trim: true,
    },
    email: {
        type: String,
        required: [true, 'Please provide an email'],
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },
    password: {
        type: String,
        required: [true, 'Please provide a password'],
        minlength: 6,
        select: false, // Don't include password in queries by default
    },
    isVerified: {
        type: Boolean,
        default: false,
    },
    verificationToken: {
        type: String,
    },
    verificationTokenExpires: {
        type: Date,
    },
    resetPasswordToken: {
        type: String,
    },
    resetPasswordExpires: {
        type: Date,
    },
    // Password history for preventing reuse (stores last 5 passwords)
    passwordHistory: {
        type: [passwordHistorySchema],
        default: [],
        select: false // Don't include in normal queries for security
    },
    // Account lockout fields
    failedLoginAttempts: {
        type: Number,
        default: 0
    },
    lockUntil: {
        type: Date
    },
    // Last password change date
    passwordChangedAt: {
        type: Date
    },
    phone: {
        type: String,
        trim: true,
    },
    gender: {
        type: String,
        enum: ['male', 'female', 'other', ''],
        default: '',
    },
    dateOfBirth: {
        type: Date,
    },
    profileImage: {
        type: String,
        default: '',
    },
    addresses: [addressSchema],
    cart: [cartItemSchema],
    wishlist: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
    }],
    orders: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order',
    }],
}, {
    timestamps: true,
});

// =============================================================================
// VIRTUAL PROPERTIES
// =============================================================================

/**
 * Check if account is currently locked due to failed login attempts
 */
userSchema.virtual('isLocked').get(function () {
    return !!(this.lockUntil && this.lockUntil > Date.now());
});

// =============================================================================
// PRE-SAVE MIDDLEWARE
// =============================================================================

/**
 * Hash password before saving and manage password history
 * Following OWASP password storage best practices
 */
userSchema.pre('save', async function () {
    if (!this.isModified('password')) {
        return;
    }

    // Store current password hash in history before changing
    if (this.password && this.isModified('password') && !this.isNew) {
        // We need to get the old password hash from the database
        const user = await mongoose.model('User').findById(this._id).select('+passwordHistory');
        if (user && user.password) {
            // Initialize password history if it doesn't exist
            if (!this.passwordHistory) {
                this.passwordHistory = user.passwordHistory || [];
            }

            // Add current password to history
            this.passwordHistory.push({
                hash: user.password,
                changedAt: new Date()
            });

            // Keep only the last 5 passwords (OWASP recommendation)
            if (this.passwordHistory.length > 5) {
                this.passwordHistory = this.passwordHistory.slice(-5);
            }
        }
    }

    // Hash the new password with strong salt rounds (12 is recommended)
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);

    // Update password change timestamp
    this.passwordChangedAt = new Date();
});

// =============================================================================
// INSTANCE METHODS
// =============================================================================

/**
 * Compare password method
 * @param {string} candidatePassword - Password to compare
 * @returns {Promise<boolean>} - True if passwords match
 */
userSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

/**
 * Check if password was used before (prevent password reuse)
 * @param {string} newPassword - New password to check
 * @returns {Promise<boolean>} - True if password was used before
 */
userSchema.methods.isPasswordInHistory = async function (newPassword) {
    // Get user with password history
    const user = await mongoose.model('User').findById(this._id).select('+passwordHistory +password');

    if (!user) return false;

    // Check against current password
    const matchesCurrent = await bcrypt.compare(newPassword, user.password);
    if (matchesCurrent) return true;

    // Check against password history
    if (user.passwordHistory && user.passwordHistory.length > 0) {
        for (const entry of user.passwordHistory) {
            const matches = await bcrypt.compare(newPassword, entry.hash);
            if (matches) return true;
        }
    }

    return false;
};

/**
 * Increment failed login attempts and lock account if necessary
 * Account locks for 30 minutes after 5 failed attempts
 */
userSchema.methods.incLoginAttempts = async function () {
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
        updates.$set = { lockUntil: Date.now() + 30 * 60 * 1000 }; // 30 minutes
    }

    return this.updateOne(updates);
};

/**
 * Reset failed login attempts on successful login
 */
userSchema.methods.resetLoginAttempts = async function () {
    return this.updateOne({
        $set: { failedLoginAttempts: 0 },
        $unset: { lockUntil: 1 }
    });
};

const User = mongoose.model('User', userSchema);

export default User;
