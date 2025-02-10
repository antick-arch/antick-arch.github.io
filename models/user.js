const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: String,
    age: Number,
    institution: String,
    gender: String,
    address: String,
    mobile: String,
    photo: String,
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true } // Ensure password field is included
});

const User = mongoose.model('User', userSchema);

module.exports = User;