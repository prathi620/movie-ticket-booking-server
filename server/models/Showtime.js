const mongoose = require('mongoose');

const showtimeSchema = new mongoose.Schema({
    movie: { type: mongoose.Schema.Types.ObjectId, ref: 'Movie', required: true },
    theater: { type: mongoose.Schema.Types.ObjectId, ref: 'Theater', required: true },
    screenName: { type: String, required: true },
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
    seats: [{
        seatNumber: { type: String, required: true }, // e.g., "A1"
        row: { type: Number, required: true },
        col: { type: Number, required: true },
        type: { type: String, enum: ['standard', 'premium', 'vip'], default: 'standard' },
        price: { type: Number, required: true },
        status: { type: String, enum: ['available', 'locked', 'booked'], default: 'available' },
        lockedBy: { type: String }, // Session ID for temporary lock
        lockedAt: { type: Date },
        bookedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
    }],
    isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Showtime', showtimeSchema);
