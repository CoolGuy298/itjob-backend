const express = require('express');
const router = express.Router();
const {  adminMiddleware } = require('../middlewares/AdminMiddleware');

const {
  register,
  login,
  logout,
  getAllCompanies,
  getCompanyById,
  updateCompany,
  deleteCompaniesChecked,
  deleteCompany,
  getProfile,
  filterAndPaginateCompany,
  getCompanyInsight,
  updateCompanyVisibility
} = require("../controllers/CompanyController");

const authMiddleware = require('../middlewares/AuthMiddleware');

router.post('/register', register);
router.post('/login', login);
router.post('/logout', authMiddleware, logout);
router.get('/companies', getAllCompanies);
router.get('/companies/:id', getCompanyById);
router.put('/companies/:id', authMiddleware, updateCompany);
router.delete("/companies/checked", authMiddleware, deleteCompaniesChecked);
router.delete('/companies/:id', authMiddleware, deleteCompany);
router.get('/profile',authMiddleware, getProfile);
router.post('/filter-companies', filterAndPaginateCompany);
router.get('/insight/:id',authMiddleware, getCompanyInsight);
router.put('/companies/:id/visibility',adminMiddleware, updateCompanyVisibility);

module.exports = router;