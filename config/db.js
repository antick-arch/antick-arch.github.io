const mongoose = require('mongoose');
require('dotenv').config();

const dbConnection = mongoose.connect(process.env.MONGODB_URI, {
    // Remove deprecated options
});

module.exports = dbConnection;