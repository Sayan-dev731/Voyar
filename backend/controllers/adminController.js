import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import Admin from '../models/Admin.js';

// Admin login
export const adminLogin = async (req, res) => {
    try {
        const { username, password } = req.body;

        // Check if admin exists
        let admin = await Admin.findOne({ username });

        // If no admin exists and credentials match env, create default admin
        if (!admin && username === 'admin' && password === process.env.ADMIN_PASSWORD) {
            const hashedPassword = await bcrypt.hash(password, 10);
            admin = new Admin({
                username: 'admin',
                password: hashedPassword
            });
            await admin.save();
        }

        if (!admin) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Check password
        const isMatch = await bcrypt.compare(password, admin.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Create token
        const token = jwt.sign(
            { id: admin._id, username: admin.username, role: admin.role },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            token,
            admin: {
                id: admin._id,
                username: admin.username,
                role: admin.role
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Verify admin token
export const verifyToken = async (req, res) => {
    try {
        const admin = await Admin.findById(req.admin.id).select('-password');
        if (!admin) {
            return res.status(404).json({ message: 'Admin not found' });
        }
        res.json(admin);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Change admin password
export const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const admin = await Admin.findById(req.admin.id);

        const isMatch = await bcrypt.compare(currentPassword, admin.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Current password is incorrect' });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        admin.password = hashedPassword;
        await admin.save();

        res.json({ message: 'Password changed successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
