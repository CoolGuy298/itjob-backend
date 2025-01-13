const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        match: /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/
    },
    isAdmin: Boolean,
    password: {
        type: String,
        required: true,
    },
    name: {
        type: String,
        required: true,
        trim: true,
    },
    phoneNumber: {
        type: String,
        trim: true,
        match: /^\d{10}$/,
        default: null,
    },
    dob: {
        type: Date,
        default: null,
    },
    joinDate: {
        type: Date,
        default: Date.now,
    },
    avatar: {
        type: String,
        default: null,
    },
    description:{
        type: String,
        default: null,
    },
    experience: {
        type: String, 
        enum: ["Fresher", "1 year", "2 years", "3 years", "4 years", "More than 4 years", "None"],
        default: "None", 
    },
    address:{
        city: {
            type: String,
            trim: true,
            default: null,
        },

        country: {
            type: String,
            default: "Việt Nam",
        },
    },
    gender:{
        type: String,
        enum: ["Male", "Female", "None"],
        default: "None",
    },
    education:[{
        nameSchool: String,
        degree: {
            type: String,
            enum: ["High school", "Intermediate", "College", "Bachelor", "Postgraduate"],
        },
        completeDate: Date,
    }],
    certificates: [{
        name: String,
        issuedBy: String,
        from: Date,
        to: Date,
    }],
    skill:{
        technical:[{
            type: String,
            enum: [
                'Javascript',
                'Python',
                'Go',
                'Java',
                'Kotlin',
                'PHP',
                'C#',
                'Swift',
                'R',
                'Ruby',
                'C and C++',
                'Matlab',
                'TypeScript',
                'Scala',
                'SQL',
                'HTML',
                'CSS',
                'NoSQL',
                'Rust',
                'Perl',
                'Other language',
                'tester',
                'manage project',
            ],
        }],
        soft:[{
            type: String,
            enum: [
                'English',
                'Japanese',
                'Chinese',
                'Franch',
                'Spanish',
                'Russian',
                'German',
                'Presentation',
                'Teamwork',
                'Writting',
                'Communication',
                'Other skills'
            ],
        }],
    },
});

const Employee = mongoose.model('Employee', employeeSchema);

module.exports = Employee;