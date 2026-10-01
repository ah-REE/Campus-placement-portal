import dotenv from 'dotenv';
dotenv.config();
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import connectDB from './config/db.js';
import Admin from './models/Admin.js';
import Student from './models/Student.js';
import Company from './models/Company.js';
import Event from './models/Event.js';
import Test from './models/Test.js';
import Application from './models/Application.js';
import TestAttempt from './models/TestAttempt.js';
import PasswordReset from './models/PasswordReset.js';

const day = n => new Date(Date.now() + n * 86400e3);

const companies = [
  ['TCS', 'Software Engineer', 7.5, 'Bengaluru', 6.5], ['Infosys', 'Systems Engineer', 8.0, 'Hyderabad', 6.5],
  ['Amazon', 'SDE-1', 46.0, 'Bengaluru', 8.0], ['Zoho', 'Member Technical Staff', 12.5, 'Chennai', 7.0],
  ['Deloitte', 'Analyst', 11.2, 'Mumbai', 7.0], ['Bosch', 'Graduate Engineer', 9.8, 'Pune', 6.8],
  ['PayPal', 'Software Engineer', 28.0, 'Chennai', 7.5], ['Cognizant', 'GenC', 6.75, 'Coimbatore', 6.0],
  ['Freshworks', 'SDE', 18.6, 'Chennai', 7.2], ['Wipro', 'Project Engineer', 6.5, 'Bengaluru', 6.0]
].map(([name, role, package_, location, eligibilityCgpa]) => ({ name, role, package: package_, location, eligibilityCgpa, description: `${name} campus drive for the 2025/26 season.`, deadline: day(30), isActive: true }));

async function seed() {
  await connectDB();
  
  // DROP the entire database to clear out any stale indexes from old schema versions
  await mongoose.connection.dropDatabase();
  console.log('✔ Database dropped (cleared old indexes)');

  await Admin.create({ name: 'Placement Officer', email: 'admin@aurora.edu', passwordHash: await bcrypt.hash('Admin@123', 10) });

  const base = { 
    phone: '9876543210', 
    gender: 'Female', 
    dob: new Date('2003-05-14'), 
    year: 4, 
    department: 'CSE', 
    tenthMarks: 92, 
    twelfthMarks: 88, 
    cgpa: 8.4, 
    standingArrears: 0, 
    internshipsCompleted: 1, 
    address: '12 Lake View Road, Bengaluru 560001', 
    resumeText: 'Motivated final-year CSE student with strong fundamentals in data structures, DBMS and web development. Completed an internship building REST APIs with Node.js and MongoDB. Skilled in React, Express and Python. Active member of the coding club with two hackathon finals.'.repeat(1).padEnd(120, ' '), 
    skills: ['React', 'Node.js', 'MongoDB'] 
  };
  
  const s1 = await Student.create({ ...base, registerId: '22CS104', name: 'Priya Raghavan', email: 'priya@aurora.edu', passwordHash: await bcrypt.hash('Student@123', 10), isVerified: true });
  const s2 = await Student.create({ ...base, phone: '9876543211', registerId: '22CS105', name: 'Arjun Nair', email: 'arjun@aurora.edu', passwordHash: await bcrypt.hash('Student@123', 10), cgpa: 7.1 });

  const created = await Company.insertMany(companies);

  await Event.insertMany([
    { title: 'TCS NQT registration closes', date: day(7), type: 'Deadline' },
    { title: 'Amazon SDE-1 drive', date: day(14), type: 'Drive' },
    { title: 'Zoho online test', date: day(10), type: 'Test' }
  ]);

  await Test.create({
    companyId: created[0]._id, title: 'TCS NQT Mock', durationMins: 10, startAt: day(-1), endAt: day(20),
    questions: [
      { text: 'Which structure uses FIFO?', options: ['Stack', 'Queue', 'Tree', 'Graph'], correctIndex: 1 },
      { text: 'SQL stands for?', options: ['Structured Query Language', 'Simple Query Language', 'System Query Logic', 'None'], correctIndex: 0 },
      { text: 'HTTP status 404 means?', options: ['OK', 'Created', 'Not Found', 'Server Error'], correctIndex: 2 }
    ]
  });

  await Application.create({ studentId: s1._id, companyId: created[0]._id, history: [{ status: 'Applied' }] });

  console.log('✔ Seeded. Admin: admin@aurora.edu / Admin@123 · Students: priya@aurora.edu & arjun@aurora.edu / Student@123');
  await mongoose.disconnect();
}
seed();