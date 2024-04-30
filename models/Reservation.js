const mongoose = require('mongoose');

const ReservedSchema = new mongoose.Schema({
    apptDate: {
        type: Date,
        required:true
    },
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required:true
    },
    campground: {
        type: mongoose.Schema.ObjectId,
        ref: 'Campground',
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Reservation',ReservedSchema);