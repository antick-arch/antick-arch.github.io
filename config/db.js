const mongoose = require('mongoose');
require('dotenv').config();

const dbConnection = mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

module.exports = dbConnection;