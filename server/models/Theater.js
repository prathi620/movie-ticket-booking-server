const mongoose = require('mongoose');

const theaterSchema = new mongoose.Schema({
    name: { type: String, required: true },
    location: { type: String, required: true },
    city: { type: String, required: true },
    screens: [{
        name: { type: String, required: true },
        rows: { type: Number, required: true },
        cols: { type: Number, required: true },
        seatLayout: [{
            row: { type: Number, required: true },
            col: { type: Number, required: true },
            seatNumber: { type: String, required: true }, // e.g., "A1"
            type: { type: String, enum: ['standard', 'premium', 'vip'], default: 'standard' },
            isBlocked: { type: Boolean, default: false }
        }],
        pricing: {
            standard: { type: Number, default: 150 },
            premium: { type: Number, default: 200 },
            vip: { type: Number, default: 300 }
        }
    }],
}, { timestamps: true });

module.exports = mongoose.model('Theater', theaterSchema);
