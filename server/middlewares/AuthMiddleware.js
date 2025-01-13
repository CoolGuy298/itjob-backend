const jwt = require('jsonwebtoken');
const Admin = require('../models/AdminModel');

const authMiddleware = async (req, res, next) => {
    try {
       const token = req.header('Authorization')?.split(" ")[1];

        if (!token) {
            return res.status(401).json({ message: 'Unauthorized: Missing token' });
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; 
         const admin = await Admin.findById(req.user.id || req.user._id);

        if (admin && admin.role === 'admin') {
         
            return next();
        }

       
        req.employee = decoded;

        next();
    } catch (err) {
        console.error(err.message); 
        res.status(401).json({ message: 'Unauthorized: Invalid token', error: err.message });
    }
};

module.exports = authMiddleware;
