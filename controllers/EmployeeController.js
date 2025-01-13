const Employee = require('../models/EmployeeModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const userFromToken = require('../utils/UserFromToken');
const isAdminOrOwner = (user, resourceOwnerId) => {
    return user.role === 'admin' || user.role === 'superadmin' || user.id === resourceOwnerId;
};

exports.search = async (req, res) => {
    try {
        const { skills, certificates, education, page = 1, limit = 10, sortBy = 'name', sortOrder = 'asc' } = req.body;


        console.log('Request Body:', req.body);


        let query = {};


        if (Array.isArray(skills) && skills.length > 0) {

            const skillConditions = skills.map(skill => ({
                $or: [
                    { 'skill.technical': { $regex: new RegExp(skill, 'i') } },
                    { 'skill.soft': { $regex: new RegExp(skill, 'i') } }
                ]
            }));


            query['$or'] = skillConditions;
        }


        if (Array.isArray(certificates) && certificates.length > 0) {
            query['certificates.name'] = certificates;
        }

        if (education && education.trim() !== '') {
            query['education.degree'] = education;
        }

        const skip = (page - 1) * limit;


        const sortOptions = {};
        sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;


        const employees = await Employee.find(query)
            .select('name experience skill certificates education email')
            .sort(sortOptions)
            .skip(skip)
            .limit(limit);


        const totalEmployees = await Employee.countDocuments(query);


        console.log('Final Query:', query);

        res.status(200).json({
            employees,
            totalPages: Math.ceil(totalEmployees / limit),
            currentPage: page,
            totalEmployees,
        });
    } catch (error) {
        console.error('Search Error:', error);
        res.status(500).json({ message: 'Error searching employees', error });
    }
};


exports.register = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({
                message: 'Name, email, and password are required.',
            });
        }

        let employee = await Employee.findOne({ email });

        if (employee) {
            return res.status(400).json({
                message: 'Employee already registered.',
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        employee = await Employee.create({
            name,
            email,
            password: hashedPassword,
        });

        employee.password = undefined;

        res.status(200).json({
            employee,
        });
    } catch (err) {
        res.status(500).json({
            message: 'Internal server error',
            error: err,
        });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const employee = await Employee.findOne({ email });

        if (employee) {
            const validatedPassword = await bcrypt.compare(password, employee.password);
            if (validatedPassword) {
                const token = jwt.sign(
                    { email: employee.email, id: employee._id },
                    process.env.JWT_SECRET,
                    { expiresIn: process.env.JWT_EXPIRY }
                );

                employee.password = undefined;

                res.status(200).json({
                    employee,
                    token,
                });
            } else {
                res.status(401).json({
                    message: 'Email or password is incorrect.',
                });
            }
        } else {
            res.status(400).json({
                message: 'Employee not found.',
            });
        }
    } catch (err) {
        res.status(500).json({
            message: 'Internal server error',
            error: err,
        });
    }
};

exports.logout = async (req, res) => {
    res.cookie('token', '').json({
        message: 'Logged out successfully!',
    });
};



exports.getAllEmployees = async (req, res) => {
    try {
        const employees = await Employee.find({});

        employees.forEach((employee) => {
            employee.password = undefined;
        });

        res.status(200).json(employees);
    } catch (err) {
        res.status(500).json({
            message: 'Internal server error',
            error: err,
        });
    }
};

exports.getEmployeeById = async (req, res) => {
    const employeeId = req.params.id;

    try {
        const employee = await Employee.findById(employeeId);

        if (!employee) {
            return res.status(404).json({
                message: 'Employee not found.',
            });
        }

        employee.password = undefined;

        res.status(200).json(employee);
    } catch (err) {
        res.status(500).json({
            message: 'Internal server error',
            error: err,
        });
    }
};

exports.updateEmployee = async (req, res) => {
    const employeeId = req.params.id;
    const { name, email, phoneNumber, dob, joinDate, avatar, description, experience, address, gender, education, certificates, skill } = req.body;

    try {
        if (email) {
            const existingEmployee = await Employee.findOne({ email });
            if (existingEmployee && existingEmployee._id.toString() !== employeeId) {
                return res.status(400).json({
                    message: 'Email is already registered.',
                });
            }
        }

        const updatedEmployee = await Employee.findByIdAndUpdate(
            employeeId,
            {
                name,
                email,
                phoneNumber,
                dob,
                joinDate,
                avatar,
                description,
                experience,
                address,
                gender,
                education,
                certificates,
                skill
            },
            { new: true }
        );
        if (!updatedEmployee) {
            return res.status(404).json({
                message: 'Employee not found.',
            });
        }

        updatedEmployee.password = undefined;

        res.status(200).json(updatedEmployee);
    } catch (err) {
        res.status(500).json({
            message: 'Internal server error',
            error: err,
        });
    }
};


// exports.updateEmployee = async (req, res) => {
//     const employeeId = req.params.id;
//     const { name, email, phoneNumber, dob, joinDate, avatar, description, experience, address, gender, education, certificates, skill } = req.body;

//     try {

//         const updatedEmployee = await Employee.findById(employeeId);

//         if (!updatedEmployee) {
//             return res.status(404).json({
//                 message: 'Employee not found.',
//             });
//         }


//         if (name) updatedEmployee.name = name;
//         if (email) updatedEmployee.email = email;
//         if (phoneNumber) updatedEmployee.phoneNumber = phoneNumber;
//         if (dob) updatedEmployee.dob = dob;
//         if (joinDate) updatedEmployee.joinDate = joinDate;
//         if (avatar) updatedEmployee.avatar = avatar;
//         if (description) updatedEmployee.description = description;
//         if (experience) updatedEmployee.experience = experience;
//         if (address) updatedEmployee.address = address;
//         if (gender) updatedEmployee.gender = gender;
//         if (education) updatedEmployee.education = education;
//         if (certificates) updatedEmployee.certificates = certificates;
//         if (skill) updatedEmployee.skill = skill;

//         await updatedEmployee.save();
//         updatedEmployee.password = undefined;

//         res.status(200).json(updatedEmployee);

//     } catch (err) {
//         res.status(500).json({
//             message: 'Internal server error',
//             error: err,
//         });
//     }
// };



exports.deleteEmployee = async (req, res) => {
    const employeeId = req.params.id;
    const loggedInUser = req.user;

    try {
        const employee = await Employee.findById(employeeId);
        if (!employee) {
            return res.status(404).json({ message: 'Employee not found.' });
        }

        if (isAdminOrOwner(loggedInUser, employeeId)) {
            await Employee.findByIdAndDelete(employeeId);
            return res.status(200).json({ message: 'Employee deleted successfully.' });
        }

        res.status(403).json({ message: 'Access denied. Admins or the employee themselves only.' });
    } catch (err) {
        res.status(500).json({ message: 'Internal server error', error: err });
    }
};

exports.deleteEmployeesChecked = async (req, res) => {
    const employeeIds = req.body;
    console.log(employeeIds);
    try {
        const deletedEmployees = await Employee.deleteMany({
            _id: { $in: employeeIds },
        });

        if (!deletedEmployees) {
            return res.status(404).json({
                message: 'Employees not found.',
            });
        }

        res.status(200).json({
            message: 'Employees deleted successfully.',
        });
    } catch (err) {
        res.status(500).json({
            message: 'Internal server error',
            error: err,
        });
    }
}

exports.getProfile = async (req, res) => {
    try {
        console.log("Starting getProfile function");

        const userData = userFromToken(req);
        console.log("userData:", userData);

        if (userData) {
            const employee = await Employee.findById(userData.id);
            console.log("employee:", employee);

            if (!employee) {
                return res.status(404).json({
                    message: 'Employee not found.',
                });
            }

            employee.password = undefined;

            res.status(200).json(employee);
        }
        else {
            res.status(401).json({ message: 'Unauthorized: Missing or invalid token.' });
        }
    } catch (err) {
        console.error("Error in getProfile:", err);
        res.status(500).json({
            message: 'Internal server Error',
            error: err,
        });
    }
}

