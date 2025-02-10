const express = require('express');
const app = express();
const path = require('path');
const session = require('express-session');
const dbConnection = require('./config/db');
const userRoutes = require('./routes/user.routes');
const homeRoutes = require('./routes/home.routes');
const adminRoutes = require('./routes/admin.routes');
require('dotenv').config();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, 'public')));

app.set('view engine', 'ejs');

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true
}));

app.use('/', homeRoutes);
app.use('/user', userRoutes);
app.use('/admin', adminRoutes);

dbConnection.then(() => {
    app.listen(3000, () => {
        console.log('Server is running on port 3000');
    });
}).catch((err) => {
    console.error('Failed to start server due to database connection error:', err);
});