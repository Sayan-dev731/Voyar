import crypto from 'crypto';

/**
 * Generate a 6-digit OTP
 * @returns {string} - 6-digit OTP
 */
export const generateOTP = () => {
    return crypto.randomInt(100000, 999999).toString();
};

/**
 * Generate OTP expiry time (default: 10 minutes)
 * @param {number} minutes - Expiry time in minutes
 * @returns {Date} - Expiry timestamp
 */
export const generateOTPExpiry = (minutes = 10) => {
    return new Date(Date.now() + minutes * 60 * 1000);
};
