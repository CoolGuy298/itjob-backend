const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectWithDB = require('./config/mongoose.js');
const CompanyRoute = require('./routes/CompanyRoute');
const JobRoute = require('./routes/JobRoute');
const JobApplicationRoute = require('./routes/JobApplicationRoute');
const EmployeeRoute = require('./routes/EmployeeRoute.js');
const AdminRoute = require('./routes/AdminRoute.js');
const Job = require('./models/JobModel.js'); 
const JobApplication = require('./models/JobApplicationModel.js'); 

require('dotenv').config();

const app = express();

const corsOptions = {
    exposedHeaders: ['Content-Disposition'],
    origin: ["https://itjob-frontend.onrender.com/"],
    methods: ['GET', 'POST', 'PUT', 'DELETE'], // Allowed HTTP methods
    allowedHeaders: ['Content-Type', 'Authorization'], // Allowed headers
    exposedHeaders: ['Content-Disposition'], // Exposed headers (optional)
    credentials: true, // Allow cookies (if needed)
};
app.use(cors(corsOptions));
app.use(express.json());
app.use('/company', CompanyRoute);
app.use('/job', JobRoute);
app.use('/jobApplication', JobApplicationRoute);
app.use('/employee', EmployeeRoute);
app.use('/admin', AdminRoute);


const PORT = process.env.PORT;

// const createIndexes = async () => {
//     try {
//         await connectWithDB();  // Ensure the database connection
//         await Job.createIndexes({ companyID: 1 });
//         await JobApplication.createIndexes({ jobId: 1 });
//         await JobApplication.createIndexes({ applicationDate: -1 });
//         console.log('Indexes created successfully!');
//     } catch (error) {
//         console.error('Error creating indexes:', error);
//     }
// };

const startServer = async () => {
    try {
        await connectWithDB();
        // await createIndexes();  
        // Create indexes before starting the server
        const server = app.listen(PORT, () => console.log(`Server started on ${PORT}`));
    } catch (error) {
        console.error('Error starting server:', error);
    }
};

startServer();
