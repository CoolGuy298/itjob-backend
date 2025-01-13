const express = require('express');
const router = express.Router();

const {
  register,
  login,
  logout,
  getAllEmployees,
  getEmployeeById,
  updateEmployee,
  deleteEmployee,
  deleteEmployeesChecked,
  getProfile,
  search,
} = require('../controllers/EmployeeController');

const authMiddleware = require('../middlewares/AuthMiddleware');

router.post('/register', register);
router.post('/login', login);
router.post('/logout', authMiddleware, logout);
router.get('/employees', getAllEmployees);
router.get('/employees/:id', getEmployeeById);
router.put('/employees/:id',authMiddleware, updateEmployee);
router.delete('/employees/checked', authMiddleware, deleteEmployeesChecked);
router.delete('/employees/:id',authMiddleware, deleteEmployee);
router.get('/profile',authMiddleware, getProfile);
router.post('/search',search);
module.exports = router;