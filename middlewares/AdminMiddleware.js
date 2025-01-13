const jwt = require('jsonwebtoken');
const Admin = require('../models/AdminModel');

exports.adminMiddleware = async (req, res, next) => {
    try {
    
        const token = req.header('Authorization')?.split(" ")[1];

        if (!token) {
            return res.status(401).json({ message: 'Unauthorized: Missing token' });
        }

     
        console.log('Token received:', token);

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; 

        
        console.log('Decoded token:', decoded);

        
        const adminCount = await Admin.countDocuments();

       if (adminCount === 0) {
            return next(); 
        }

        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Forbidden: Admin access only' });
        }

       
        next();
    } catch (err) {
       
        console.error('Error in adminMiddleware:', err);

        if (err instanceof jwt.JsonWebTokenError) {
            return res.status(401).json({ message: 'Unauthorized: Invalid token', error: err.message });
        }

        res.status(500).json({ message: 'Internal server error', error: err.message });
    }
};
