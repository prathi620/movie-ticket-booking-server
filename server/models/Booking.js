const mongoose = require('mongoose');

const seatSchema = new mongoose.Schema({
    row: Number,
    col: Number,
    seatNumber: String,
    type: String,
    price: Number
}, { _id: false });

const bookingSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    showtime: { type: mongoose.Schema.Types.ObjectId, ref: 'Showtime', required: true },
    movie: { type: mongoose.Schema.Types.ObjectId, ref: 'Movie', required: true },
    theater: { type: mongoose.Schema.Types.ObjectId, ref: 'Theater', required: true },
    seats: [seatSchema],
    totalPrice: { type: Number, required: true },
    status: { type: String, enum: ['pending', 'confirmed', 'cancelled'], default: 'pending' },
    paymentId: { type: String, required: true },
    paymentStatus: { type: String, enum: ['pending', 'completed', 'failed', 'refunded'], default: 'pending' },
    bookingId: { type: String, unique: true },
    qrCode: { type: String }, // QR code data
    emailSent: { type: Boolean, default: false },
    cancelledAt: { type: Date },
}, { timestamps: true });

// Generate unique booking ID before saving
bookingSchema.pre('save', function () {
    if (!this.bookingId) {
        this.bookingId = 'BK' + Date.now() + Math.random().toString(36).substr(2, 9).toUpperCase();
    }
});

module.exports = mongoose.model('Booking', bookingSchema);
