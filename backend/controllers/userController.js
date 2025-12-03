import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { sendVerificationEmail, sendPasswordResetEmail } from '../config/email.js';

// Generate JWT token
const generateToken = (userId) => {
    return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
        expiresIn: '7d',
    });
};

// @desc    Register a new user
// @route   POST /api/users/signup
// @access  Public
export const signup = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists with this email' });
        }

        // Generate verification token
        const verificationToken = crypto.randomBytes(32).toString('hex');
        const verificationTokenExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours

        // Create user
        const user = await User.create({
            name,
            email,
            password,
            verificationToken,
            verificationTokenExpires,
        });

        // Send verification email
        try {
            await sendVerificationEmail(email, name, verificationToken);
        } catch (emailError) {
            console.error('Email sending failed:', emailError);
            // Continue with registration even if email fails
        }

        res.status(201).json({
            message: 'Registration successful! Please check your email to verify your account.',
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                isVerified: user.isVerified,
            },
        });
    } catch (error) {
        console.error('Signup error:', error);
        res.status(500).json({ message: error.message || 'Server error during registration' });
    }
};

// @desc    Verify email
// @route   GET /api/users/verify-email/:token
// @access  Public
export const verifyEmail = async (req, res) => {
    try {
        const { token } = req.params;
        console.log('Verifying token:', token);

        // First, try to find user with the token
        let user = await User.findOne({
            verificationToken: token,
        });

        console.log('User found by token:', user ? user.email : 'No user found');

        // If found with token
        if (user) {
            // Check if already verified
            if (user.isVerified) {
                console.log('User already verified:', user.email);
                // Clear the token anyway
                user.verificationToken = undefined;
                user.verificationTokenExpires = undefined;
                await user.save();

                return res.json({
                    success: true,
                    message: 'Email already verified! You can log in.',
                    user: {
                        id: user._id,
                        name: user.name,
                        email: user.email,
                        isVerified: user.isVerified,
                    },
                });
            }

            // Check if expired
            if (user.verificationTokenExpires && user.verificationTokenExpires < Date.now()) {
                return res.status(400).json({
                    success: false,
                    message: 'Verification token has expired. Please request a new one.'
                });
            }

            // Token is valid, verify the user
            user.isVerified = true;
            user.verificationToken = undefined;
            user.verificationTokenExpires = undefined;
            await user.save();

            console.log('User verified successfully:', user.email);

            return res.json({
                success: true,
                message: 'Email verified successfully! You can now log in.',
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    isVerified: user.isVerified,
                },
            });
        }

        // Token not found - check if there's a verified user (link already used)
        console.log('Token not found in database');

        return res.status(400).json({
            success: false,
            message: 'This verification link has already been used or is invalid. If you already verified your email, please login.'
        });
    } catch (error) {
        console.error('Email verification error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during email verification'
        });
    }
};

// @desc    Login user
// @route   POST /api/users/login
// @access  Public
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find user and include password field
        const user = await User.findOne({ email }).select('+password');

        if (!user) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        // Check if email is verified
        if (!user.isVerified) {
            return res.status(403).json({
                message: 'Please verify your email before logging in. Check your inbox for the verification link.',
                needsVerification: true,
            });
        }

        // Compare passwords
        const isPasswordMatch = await user.comparePassword(password);

        if (!isPasswordMatch) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        // Generate token
        const token = generateToken(user._id);

        res.json({
            message: 'Login successful',
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                isVerified: user.isVerified,
            },
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error during login' });
    }
};

// @desc    Resend verification email
// @route   POST /api/users/resend-verification
// @access  Public
export const resendVerification = async (req, res) => {
    try {
        const { email } = req.body;

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (user.isVerified) {
            return res.status(400).json({ message: 'Email is already verified' });
        }

        // Generate new verification token
        const verificationToken = crypto.randomBytes(32).toString('hex');
        const verificationTokenExpires = Date.now() + 24 * 60 * 60 * 1000;

        user.verificationToken = verificationToken;
        user.verificationTokenExpires = verificationTokenExpires;
        await user.save();

        // Send verification email
        await sendVerificationEmail(email, user.name, verificationToken);

        res.json({ message: 'Verification email sent successfully' });
    } catch (error) {
        console.error('Resend verification error:', error);
        res.status(500).json({ message: 'Failed to send verification email' });
    }
};

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
export const getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id)
            .populate('orders')
            .populate('cart.product')
            .populate('wishlist');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                gender: user.gender,
                dateOfBirth: user.dateOfBirth,
                profileImage: user.profileImage,
                addresses: user.addresses,
                isVerified: user.isVerified,
                orders: user.orders,
                cart: user.cart,
                wishlist: user.wishlist,
                createdAt: user.createdAt,
            },
        });
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
export const updateProfile = async (req, res) => {
    try {
        const { name, phone, gender, dateOfBirth, profileImage } = req.body;

        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (name) user.name = name;
        if (phone !== undefined) user.phone = phone;
        if (gender !== undefined) user.gender = gender;
        if (dateOfBirth !== undefined) user.dateOfBirth = dateOfBirth;
        if (profileImage !== undefined) user.profileImage = profileImage;

        await user.save();

        res.json({
            message: 'Profile updated successfully',
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                gender: user.gender,
                dateOfBirth: user.dateOfBirth,
                profileImage: user.profileImage,
                addresses: user.addresses,
                isVerified: user.isVerified,
            },
        });
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Add address
// @route   POST /api/users/addresses
// @access  Private
export const addAddress = async (req, res) => {
    try {
        const { name, phone, street, city, state, zipCode, country, type, isDefault } = req.body;

        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // If this is set as default, remove default from other addresses
        if (isDefault) {
            user.addresses.forEach(addr => addr.isDefault = false);
        }

        // If this is the first address, make it default
        const makeDefault = user.addresses.length === 0 || isDefault;

        user.addresses.push({
            name,
            phone,
            street,
            city,
            state,
            zipCode,
            country: country || 'India',
            type: type || 'home',
            isDefault: makeDefault,
        });

        await user.save();

        res.status(201).json({
            message: 'Address added successfully',
            addresses: user.addresses,
        });
    } catch (error) {
        console.error('Add address error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Update address
// @route   PUT /api/users/addresses/:addressId
// @access  Private
export const updateAddress = async (req, res) => {
    try {
        const { addressId } = req.params;
        const { name, phone, street, city, state, zipCode, country, type, isDefault } = req.body;

        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const address = user.addresses.id(addressId);

        if (!address) {
            return res.status(404).json({ message: 'Address not found' });
        }

        // If this is set as default, remove default from other addresses
        if (isDefault) {
            user.addresses.forEach(addr => addr.isDefault = false);
        }

        if (name) address.name = name;
        if (phone) address.phone = phone;
        if (street) address.street = street;
        if (city) address.city = city;
        if (state) address.state = state;
        if (zipCode) address.zipCode = zipCode;
        if (country) address.country = country;
        if (type) address.type = type;
        if (isDefault !== undefined) address.isDefault = isDefault;

        await user.save();

        res.json({
            message: 'Address updated successfully',
            addresses: user.addresses,
        });
    } catch (error) {
        console.error('Update address error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Delete address
// @route   DELETE /api/users/addresses/:addressId
// @access  Private
export const deleteAddress = async (req, res) => {
    try {
        const { addressId } = req.params;

        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const addressIndex = user.addresses.findIndex(addr => addr._id.toString() === addressId);

        if (addressIndex === -1) {
            return res.status(404).json({ message: 'Address not found' });
        }

        const wasDefault = user.addresses[addressIndex].isDefault;
        user.addresses.splice(addressIndex, 1);

        // If deleted address was default and there are other addresses, make first one default
        if (wasDefault && user.addresses.length > 0) {
            user.addresses[0].isDefault = true;
        }

        await user.save();

        res.json({
            message: 'Address deleted successfully',
            addresses: user.addresses,
        });
    } catch (error) {
        console.error('Delete address error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get cart
// @route   GET /api/users/cart
// @access  Private
export const getCart = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).populate('cart.product');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({
            cart: user.cart,
        });
    } catch (error) {
        console.error('Get cart error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Add to cart
// @route   POST /api/users/cart
// @access  Private
export const addToCart = async (req, res) => {
    try {
        const { productId, quantity, selectedColor } = req.body;

        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Check if product already exists in cart
        const existingItemIndex = user.cart.findIndex(
            item => item.product.toString() === productId
        );

        if (existingItemIndex > -1) {
            // Update quantity if product exists
            user.cart[existingItemIndex].quantity += quantity || 1;
            if (selectedColor) {
                user.cart[existingItemIndex].selectedColor = selectedColor;
            }
        } else {
            // Add new item to cart
            user.cart.push({
                product: productId,
                quantity: quantity || 1,
                selectedColor,
            });
        }

        await user.save();
        await user.populate('cart.product');

        res.json({
            message: 'Item added to cart',
            cart: user.cart,
        });
    } catch (error) {
        console.error('Add to cart error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Update cart item
// @route   PUT /api/users/cart/:productId
// @access  Private
export const updateCartItem = async (req, res) => {
    try {
        const { productId } = req.params;
        const { quantity, selectedColor } = req.body;

        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const itemIndex = user.cart.findIndex(
            item => item.product.toString() === productId
        );

        if (itemIndex === -1) {
            return res.status(404).json({ message: 'Item not found in cart' });
        }

        if (quantity <= 0) {
            // Remove item if quantity is 0 or less
            user.cart.splice(itemIndex, 1);
        } else {
            user.cart[itemIndex].quantity = quantity;
            if (selectedColor) {
                user.cart[itemIndex].selectedColor = selectedColor;
            }
        }

        await user.save();
        await user.populate('cart.product');

        res.json({
            message: 'Cart updated',
            cart: user.cart,
        });
    } catch (error) {
        console.error('Update cart error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Remove from cart
// @route   DELETE /api/users/cart/:productId
// @access  Private
export const removeFromCart = async (req, res) => {
    try {
        const { productId } = req.params;

        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const itemIndex = user.cart.findIndex(
            item => item.product.toString() === productId
        );

        if (itemIndex === -1) {
            return res.status(404).json({ message: 'Item not found in cart' });
        }

        user.cart.splice(itemIndex, 1);

        await user.save();
        await user.populate('cart.product');

        res.json({
            message: 'Item removed from cart',
            cart: user.cart,
        });
    } catch (error) {
        console.error('Remove from cart error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Clear cart
// @route   DELETE /api/users/cart
// @access  Private
export const clearCart = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.cart = [];
        await user.save();

        res.json({
            message: 'Cart cleared',
            cart: [],
        });
    } catch (error) {
        console.error('Clear cart error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Sync cart (merge local cart with server cart)
// @route   POST /api/users/cart/sync
// @access  Private
export const syncCart = async (req, res) => {
    try {
        const { items } = req.body; // Array of { productId, quantity, selectedColor }

        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Merge local cart with server cart
        for (const item of items) {
            const existingItemIndex = user.cart.findIndex(
                cartItem => cartItem.product.toString() === item.productId
            );

            if (existingItemIndex > -1) {
                // Item exists, update quantity (add local quantity to existing)
                user.cart[existingItemIndex].quantity += item.quantity;
                if (item.selectedColor) {
                    user.cart[existingItemIndex].selectedColor = item.selectedColor;
                }
            } else {
                // Add new item
                user.cart.push({
                    product: item.productId,
                    quantity: item.quantity,
                    selectedColor: item.selectedColor,
                });
            }
        }

        await user.save();
        await user.populate('cart.product');

        res.json({
            message: 'Cart synced successfully',
            cart: user.cart,
        });
    } catch (error) {
        console.error('Sync cart error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Change password
// @route   PUT /api/users/change-password
// @access  Private
export const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        const user = await User.findById(req.user.id).select('+password');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Check current password
        const isMatch = await user.comparePassword(currentPassword);
        if (!isMatch) {
            return res.status(400).json({ message: 'Current password is incorrect' });
        }

        // Update password
        user.password = newPassword;
        await user.save();

        res.json({ message: 'Password changed successfully' });
    } catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Request password reset
// @route   POST /api/users/forgot-password
// @access  Public
export const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Generate reset token
        const resetToken = crypto.randomBytes(32).toString('hex');
        const resetTokenExpires = Date.now() + 60 * 60 * 1000; // 1 hour

        user.resetPasswordToken = resetToken;
        user.resetPasswordExpires = resetTokenExpires;
        await user.save();

        // Send password reset email
        await sendPasswordResetEmail(email, user.name, resetToken);

        res.json({ message: 'Password reset email sent successfully' });
    } catch (error) {
        console.error('Forgot password error:', error);
        res.status(500).json({ message: 'Failed to send password reset email' });
    }
};

// @desc    Reset password
// @route   POST /api/users/reset-password/:token
// @access  Public
export const resetPassword = async (req, res) => {
    try {
        const { token } = req.params;
        const { password } = req.body;

        const user = await User.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: Date.now() },
        });

        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired reset token' });
        }

        user.password = password;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();

        res.json({ message: 'Password reset successful. You can now log in with your new password.' });
    } catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({ message: 'Server error during password reset' });
    }
};
