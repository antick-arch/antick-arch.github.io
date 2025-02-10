const express = require('express');
const app = express();
const path = require('path');
const session = require('express-session');
const dbConnection = require('./config/db');
const userRoutes = require('./routes/user.routes');
const homeRoutes = require('./routes/home.routes');
const adminRoutes = require('./routes/admin.routes');
require('dotenv').config();

const port = process.env.PORT || 3000;

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

app.get('/', (req, res) => {
  res.send('Hello World!');
});

dbConnection.then(() => {
    try {
        app.listen(port, () => {
            console.log(`Server is running on port ${port}`);
        });
    } catch (err) {
        console.error('Failed to start server due to database connection error:', err);
    }
}).catch((err) => {
    console.error('Failed to start server due to database connection error:', err);
});