const express = require('express');
const router = express.Router();
const { registerAdmin, loginAdmin } = require('../controllers/AdminController');
const {  adminMiddleware } = require('../middlewares/AdminMiddleware');
const authMiddleware = require('../middlewares/AuthMiddleware');


router.post('/register', registerAdmin); 
router.post('/login', loginAdmin);


module.exports = router;
