const mongoose = require('mongoose');

const imageSchema = new mongoose.Schema({
    img: {
        data: Buffer,
        contentType: String,
    },
    username: {
        type: String,
        ref: 'User', // Reference the User model
        required: true, // Ensure every image is linked to a user
    },
});

module.exports = mongoose.model('Image', imageSchema);
