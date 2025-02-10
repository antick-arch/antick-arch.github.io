const express = require('express');
const path = require('path');
const router = express.Router();
const Card = require('../models/card');

router.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Accessible route: GET /about
router.get('/about', async (req, res) => {
    try {
        const cards = await Card.find();
        res.render('about', { cards });
    } catch (err) {
        console.error('Error fetching cards:', err.message);
        console.error(err.stack);
        res.status(500).send('Internal Server Error');
    }
});

module.exports = router;
