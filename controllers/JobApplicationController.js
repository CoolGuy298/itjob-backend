const JobApplication = require('../models/JobApplicationModel');
const Employee = require('../models/EmployeeModel');
const Company = require('../models/CompanyModel');
const Job = require('../models/JobModel');
const multer = require('multer');
const fs = require('fs');
const upload = multer({ dest: 'uploads/' });
const stream = require('stream');

exports.upload = upload.single('cv');

exports.createJobApplication = async (req, res) => {
    try {
        const { jobId, employeeId, status } = req.body;
        const cvFile = req.file;

       
        if (!cvFile) {
            return res.status(400).send({ message: "Please upload a CV." });
        }

        
        const cvData = fs.readFileSync(cvFile.path);
        const cvContentType = cvFile.mimetype;

       
        const jobApplication = new JobApplication({
            employeeId,
            jobId,
            cv: { data: cvData, contentType: cvContentType },
            status,
        });

        
        const savedJobApplication = await jobApplication.save();

      
        fs.unlinkSync(cvFile.path);

      
        res.status(201).json(savedJobApplication);
    } catch (err) {
       
        if (req.file) fs.unlinkSync(req.file.path);

        res.status(500).json({ message: 'Internal server error', error: err });
    }
};


exports.getAllJobApplications = async (req, res) => {
    try {
        const jobApplications = await JobApplication.find({})
            .populate('employeeId', 'name email')
            .populate('jobId', 'title');

        res.status(200).json(jobApplications);
    } catch (err) {
        res.status(500).json({ message: 'Internal server error', error: err });
    }
};

exports.getJobApplicationCount = async (req, res) => {
    try {
        const count = await JobApplication.countDocuments();

        res.status(200).json({ count });
    } catch (err) {
        res.status(500).json({ message: 'Internal server error', error: err });
    }
};


exports.getJobApplicationById = async (req, res) => {
    const jobApplicationId = req.params.id;

    try {
        const jobApplication = await JobApplication.findById(jobApplicationId)
            .populate('employeeId', 'name email') 
            .populate('jobId', 'title');

        if (!jobApplication) {
            return res.status(404).json({ message: 'Job application not found.' });
        }

        res.status(200).json(jobApplication);
    } catch (err) {
        res.status(500).json({ message: 'Internal server error', error: err });
    }
};

exports.updateJobApplication = async (req, res) => {
    const jobApplicationId = req.params.id;
    const { status } = req.body;

    try {
        const updatedJobApplication = await JobApplication.findByIdAndUpdate(
            jobApplicationId,
            { status },
            { new: true }
        );

        if (!updatedJobApplication) {
            return res.status(404).json({ message: 'Job application not found.' });
        }

        res.status(200).json(updatedJobApplication);
    } catch (err) {
        res.status(500).json({ message: 'Internal server error', error: err });
    }
};


exports.deleteJobApplication = async (req, res) => {
    const jobApplicationId = req.params.id;

    try {
        const deletedJobApplication = await JobApplication.findByIdAndDelete(jobApplicationId);

        if (!deletedJobApplication) {
            return res.status(404).json({ message: 'Job application not found.' });
        }

        res.status(200).json({ message: 'Job application deleted successfully.' });
    } catch (err) {
        res.status(500).json({ message: 'Internal server error', error: err });
    }
};


exports.getJobApplicationByEmployeeId = async (req, res) => {
    const employeeId = req.params.employeeId;

    try {
        const jobApplications = await JobApplication.find({ employeeId })
            .populate('jobId');

        res.status(200).json(jobApplications);
    } catch (err) {
        res.status(500).json({ message: 'Internal server error', error: err });
    }
};


exports.getJobApplicationByJobId = async (req, res) => {
    const jobId = req.params.jobId;
    try {
        const jobApplications = await JobApplication.countDocuments({jobId});
        res.status(200).json(jobApplications);
    } catch (err) {
        res.status(500).json({ message: 'Internal server error', error: err });
    }
};


exports.getJobApplicationsByCompanyId = async (req, res) => {
    const companyId = req.params.companyId;

    try {
        const jobs = await Job.find({ companyID: companyId });
        const jobIds = jobs.map(job => job._id);
        const jobApplications = await JobApplication.find({ jobId: { $in: jobIds } })
            .populate('employeeId', 'name email phoneNumber')
            .populate('jobId');
        
        res.status(200).json(jobApplications);
    } catch (err) {
        res.status(500).json({ message: 'Internal server error', error: err });
    }
};
exports.getFilterJobApplicationByEmployeeId = async (req, res) => {
    const employeeId = req.params.employeeId;
    const { jobTitle, page = 0, pageSize = 2 } = req.body;

    try {
        let filter = { employeeId };

      
        if (jobTitle) {
            const jobIds = await Job.find({ title: { $regex: new RegExp(jobTitle, 'i') } }).select('_id');
            filter.jobId = { $in: jobIds.map(job => job._id) };
        }

   
        const skip = page * pageSize;

       
        const totalApplications = await JobApplication.countDocuments(filter);
        const totalPages = Math.ceil(totalApplications / pageSize);

      
        const jobApplications = await JobApplication.find(filter)
            .populate('jobId')
            .sort({ applicationDate: -1 }) 
            .skip(skip)
            .limit(pageSize);

        res.status(200).json({ jobApplications, totalApplications, totalPages });
    } catch (err) {
        res.status(500).json({ message: 'Internal server error', error: err });
    }
};



exports.getFilterJobApplicationsByCompanyId = async (req, res) => {
    const companyId = req.params.companyId;
    const { jobTitle, page = 0, pageSize = 2 } = req.body; 

    try {
        let jobQuery = { companyID: companyId };
        if (jobTitle) {
            Object.assign(jobQuery, { title: { $regex: new RegExp(jobTitle, 'i') } });
        }

        const jobIds = await Job.find(jobQuery).select('_id');
        const skip = page * pageSize;
        const jobApplications = await JobApplication.find({ jobId: { $in: jobIds } })
            .populate('employeeId', 'name email phoneNumber')
            .populate('jobId')
            .sort({ applicationDate: -1 })
            .skip(skip)
            .limit(pageSize);

        const totalApplications = await JobApplication.countDocuments({ jobId: { $in: jobIds } });
        const totalPages = Math.ceil(totalApplications / pageSize);

        res.status(200).json({ jobApplications, totalApplications, totalPages });
    } catch (err) {
        res.status(500).json({ message: 'Internal server error', error: err });
    }
};

exports.getFilterJobApplicationsByCompanyIdStatus = async (req, res) => {
    const companyId = req.params.companyId;
    const { jobStatus, page = 0, pageSize = 2 } = req.body; 

    try {
        
        const jobIds = await Job.find({ companyID: companyId }).select('_id');
        
        if (!jobIds.length) {
            return res.status(200).json({ jobApplications: [], totalApplications: 0, totalPages: 0 });
        }

        const skip = page * pageSize;

      
        let jobApplicationQuery = { jobId: { $in: jobIds } };
        if (jobStatus) {
            jobApplicationQuery.status = { $regex: new RegExp(jobStatus, 'i') };
        }

     
        const jobApplications = await JobApplication.find(jobApplicationQuery)
            .populate('employeeId', 'name email phoneNumber')
            .populate('jobId')
            .sort({ applicationDate: -1 })
            .skip(skip)
            .limit(pageSize);

      
        const totalApplications = await JobApplication.countDocuments(jobApplicationQuery);
        const totalPages = Math.ceil(totalApplications / pageSize);

        res.status(200).json({ jobApplications, totalApplications, totalPages });
    } catch (err) {
        res.status(500).json({ message: 'Internal server error', error: err });
    }
};




exports.getCV = async (req, res) => {
    try {
    
        const jobApplicationId = req.params.jobApplicationId;
        const jobApplication = await JobApplication.findById(jobApplicationId).populate('employeeId', 'name');

        if (!jobApplication || !jobApplication.cv || !jobApplication.cv.data) {
            return res.status(404).send({ message: "CV not found." });
        }

        if (!jobApplication.employeeId || !jobApplication.employeeId.name) {
            return res.status(404).send({ message: "Employee not found." });
        }

      
        let fileExtension = '';
        switch (jobApplication.cv.contentType) {
            case 'application/pdf':
                fileExtension = '.pdf';
                break;
            case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
                fileExtension = '.docx';
                break;
            default:
                return res.status(400).send({ message: "Unsupported file type." });
        }

        const fileName = `${jobApplication.employeeId.name}-cv${fileExtension}`;
      
        res.setHeader('Content-Type', jobApplication.cv.contentType);
        res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
     
        const readStream = new stream.PassThrough();
        readStream.end(jobApplication.cv.data);
        readStream.pipe(res);
    } catch (error) {
        res.status(500).send({ message: "Could not download the CV.", error: error.toString() });
    }
};