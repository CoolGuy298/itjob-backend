const express = require('express');
const router = express.Router();
const Job = require('../models/JobModel');
const {
  createJob,
  getAllJobs,
  getJobById,
  updateJob,
  deleteJob,
  findJobByCompanyId,
  filterAndPaginateJobs,
  filterAndPaginateAvailableJobs,
  filterAndPaginateJobsByCompany,
  getAvailableJobs,

} = require('../controllers/JobController');

const authMiddleware = require('../middlewares/AuthMiddleware');
const {  adminMiddleware } = require('../middlewares/AdminMiddleware');

router.post('/jobs', authMiddleware, createJob); 
router.get('/jobs', getAllJobs);
router.get('/availableJobs', getAvailableJobs);
router.get('/jobs/:id', getJobById); 
router.put('/jobs/:id', authMiddleware, updateJob);
router.delete('/jobs/:id', authMiddleware, deleteJob); 
router.get('/jobsByCompany', findJobByCompanyId);
router.post('/jobs/filtered-jobs', filterAndPaginateJobs);
router.post('/jobs/filtered-available-jobs', filterAndPaginateAvailableJobs); 
router.post('/jobs/filtered-jobs-by-company', filterAndPaginateJobsByCompany); 
router.put('/jobs/:id/visibility',adminMiddleware, async (req, res) => {
  const { id } = req.params;
  const { isVisible } = req.body; 

  try {
      const job = await Job.findByIdAndUpdate(id, { isVisible }, { new: true });
      if (!job) {
          return res.status(404).json({ message: 'Job not found' });
      }
      res.status(200).json({ message: 'Job visibility updated successfully', job });
  } catch (error) {
      res.status(500).json({ message: 'Error updating job visibility', error });
  }
});



module.exports = router;