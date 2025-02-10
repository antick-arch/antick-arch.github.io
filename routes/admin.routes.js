const express = require('express');
const router = express.Router();
const Admin = require('../models/admin');
const User = require('../models/user');
const Card = require('../models/card');
const bcrypt = require('bcrypt');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Middleware to check if admin is authenticated
function isAuthenticated(req, res, next) {
    if (req.session.admin) {
        return next();
    } else {
        res.redirect('/admin/login');
    }
}

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

// Accessible route: GET /admin/login
router.get('/login', (req, res) => {
    res.render('adminLogin');
});

// Accessible route: POST /admin/login
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const admin = await Admin.findOne({ username });
        if (!admin) {
            return res.status(400).send('Invalid username or password');
        }
        const isMatch = await bcrypt.compare(password, admin.password);
        if (!isMatch) {
            return res.status(400).send('Invalid username or password');
        }
        req.session.admin = admin;
        console.log('Admin logged in:', admin);
        res.redirect('/admin/dashboard');
    } catch (err) {
        console.error('Error logging in admin:', err.message);
        console.error(err.stack);
        res.status(500).send('Internal Server Error');
    }
});

// Accessible route: GET /admin/dashboard
router.get('/dashboard', isAuthenticated, async (req, res) => {
    try {
        const users = await User.find();
        res.render('adminDashboard', { users });
    } catch (err) {
        console.error('Error fetching users:', err.message);
        console.error(err.stack);
        res.status(500).send('Internal Server Error');
    }
});

// Accessible route: GET /admin/edit/:id
router.get('/edit/:id', isAuthenticated, async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        res.render('adminEditUser', { user });
    } catch (err) {
        console.error('Error fetching user:', err.message);
        console.error(err.stack);
        res.status(500).send('Internal Server Error');
    }
});

// Accessible route: POST /admin/edit/:id
router.post('/edit/:id', isAuthenticated, upload.single('photo'), async (req, res) => {
    const updates = {
        name: req.body.name,
        age: req.body.age,
        institution: req.body.institution,
        gender: req.body.gender,
        address: req.body.address,
        mobile: req.body.mobile,
        email: req.body.email // Include email field
    };
    if (req.file) {
        const user = await User.findById(req.params.id);
        if (user.photo) {
            const oldPhotoPath = path.join(__dirname, '../public/uploads', user.photo);
            if (fs.existsSync(oldPhotoPath)) {
                fs.unlinkSync(oldPhotoPath);
            }
        }
        updates.photo = req.file.filename;
    }
    try {
        await User.findByIdAndUpdate(req.params.id, updates);
        res.redirect('/admin/dashboard');
    } catch (err) {
        console.error('Error updating user:', err.message);
        console.error(err.stack);
        res.status(500).send('Internal Server Error');
    }
});

// Accessible route: GET /admin/delete/:id
router.get('/delete/:id', isAuthenticated, async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (user.photo) {
            const photoPath = path.join(__dirname, '../public/uploads', user.photo);
            if (fs.existsSync(photoPath)) {
                fs.unlinkSync(photoPath);
            }
        }
        await User.findByIdAndDelete(req.params.id);
        res.redirect('/admin/dashboard');
    } catch (err) {
        console.error('Error deleting user:', err.message);
        console.error(err.stack);
        res.status(500).send('Internal Server Error');
    }
});

// Accessible route: GET /admin/about
router.get('/about', isAuthenticated, async (req, res) => {
    try {
        const cards = await Card.find();
        res.render('adminAbout', { cards });
    } catch (err) {
        console.error('Error fetching cards:', err.message);
        console.error(err.stack);
        res.status(500).send('Internal Server Error');
    }
});

// Accessible route: POST /admin/about
router.post('/about', isAuthenticated, upload.single('image'), async (req, res) => {
    try {
        const { title, text } = req.body;
        const newCard = new Card({
            image: req.file.filename,
            title,
            text
        });
        await newCard.save();
        res.redirect('/admin/about');
    } catch (err) {
        console.error('Error saving card:', err.message);
        console.error(err.stack);
        res.status(500).send('Internal Server Error');
    }
});

// Accessible route: GET /admin/about/delete/:id
router.get('/about/delete/:id', isAuthenticated, async (req, res) => {
    try {
        const card = await Card.findById(req.params.id);
        if (card.image) {
            const imagePath = path.join(__dirname, '../public/uploads', card.image);
            if (fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath);
            }
        }
        await Card.findByIdAndDelete(req.params.id);
        res.redirect('/admin/about');
    } catch (err) {
        console.error('Error deleting card:', err.message);
        console.error(err.stack);
        res.status(500).send('Internal Server Error');
    }
});

module.exports = router;
