const mongoose = require('mongoose');

const cardSchema = new mongoose.Schema({
    image: String,
    title: String,
    text: String
});

const Card = mongoose.model('Card', cardSchema);

module.exports = Card;
