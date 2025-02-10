const express = require('express');
const router = express.Router();
const User = require('../models/user');
const bcrypt = require('bcrypt');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const nodemailer = require('nodemailer');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = 'public/uploads';
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage });

// Define the register route
router.get('/register', (req, res) => {
  res.sendFile(path.join(__dirname, '../public', 'register.html'));
});

// Define the login route
router.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, '../public', 'login.html'));
});

router.post('/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).send('Email already registered');
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ name, email, password: hashedPassword });
        await newUser.save();
        console.log('User registered:', newUser);
        res.redirect('/user/login');
    } catch (err) {
        console.error('Error registering user:', err.message);
        console.error(err.stack);
        res.status(500).send('Internal Server Error');
    }
});

router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).send('Email and password are required');
        }
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).send('Invalid email or password');
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).send('Invalid email or password');
        }
        req.session.user = user;
        console.log('User logged in:', user);
        res.redirect('/user/dashboard');
    } catch (err) {
        console.error('Error logging in user:', err.message);
        console.error(err.stack);
        res.status(500).send('Internal Server Error');
    }
});

// Accessible route: GET /user/dashboard
router.get('/dashboard', async (req, res) => {
    if (!req.session.user) {
        return res.redirect('/user/login');
    }
    const user = await User.findById(req.session.user._id);
    res.render('userDashboard', { user });
});

router.get('/panel', async (req, res) => {
    if (!req.session.user) {
        return res.redirect('/user/login');
    }
    const user = await User.findById(req.session.user._id);
    res.render('user', { user });
});

router.get('/profile', async (req, res) => {
    if (!req.session.user) {
        return res.redirect('/user/login');
    }
    const user = await User.findById(req.session.user._id);
    res.render('profile', { user });
});

router.post('/update', upload.single('photo'), async (req, res) => {
    if (!req.session.user) {
        return res.redirect('/user/login');
    }
    const updates = {
        name: req.body.name,
        age: req.body.age,
        institution: req.body.institution,
        gender: req.body.gender,
        address: req.body.address,
        mobile: req.body.mobile
    };
    if (req.file) {
        const user = await User.findById(req.session.user._id);
        if (user.photo) {
            const oldPhotoPath = path.join(__dirname, '../public/uploads', user.photo);
            if (fs.existsSync(oldPhotoPath)) {
                fs.unlinkSync(oldPhotoPath);
            }
        }
        updates.photo = req.file.filename;
    }
    try {
        await User.findByIdAndUpdate(req.session.user._id, updates);
        res.redirect('/user/profile');
    } catch (err) {
        console.error('Error updating user:', err.message);
        console.error(err.stack);
        res.status(500).send('Internal Server Error');
    }
});

router.post('/update-password', async (req, res) => {
    if (!req.session.user) {
        return res.redirect('/user/login');
    }
    const { currentPassword, newPassword } = req.body;
    try {
        const user = await User.findById(req.session.user._id);
        if (user && await bcrypt.compare(currentPassword, user.password)) {
            user.password = await bcrypt.hash(newPassword, 10);
            await user.save();
            res.send('Password has been updated successfully.');
        } else {
            res.status(400).send('Current password is incorrect.');
        }
    } catch (err) {
        console.error('Error updating password:', err.message);
        console.error(err.stack);
        res.status(500).send('Internal Server Error');
    }
});

router.get('/delete', async (req, res) => {
    if (!req.session.user) {
        return res.redirect('/user/login');
    }
    try {
        const user = await User.findById(req.session.user._id);
        if (user.photo) {
            const photoPath = path.join(__dirname, '../public/uploads', user.photo);
            if (fs.existsSync(photoPath)) {
                fs.unlinkSync(photoPath);
            }
        }
        await User.findByIdAndDelete(req.session.user._id);
        req.session.destroy();
        res.redirect('/user/register');
    } catch (err) {
        console.error('Error deleting user:', err.message);
        console.error(err.stack);
        res.status(500).send('Internal Server Error');
    }
});

module.exports = router;