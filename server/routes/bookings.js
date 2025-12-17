const express = require('express');
const {
    lockSeats,
    createPayment,
    createBooking,
    getUserBookings,
    getBookingById,
    cancelBooking,
    getAllBookings,
    getBookingStats
} = require('../controllers/bookingController');
const { downloadTicket } = require('../controllers/bookingPdfController');
const { protect, admin } = require('../middleware/authMiddleware');

const router = express.Router();

// User routes
router.post('/lock-seats', protect, lockSeats);
router.post('/create-payment', protect, createPayment);
router.post('/', protect, createBooking);
router.get('/my-bookings', protect, getUserBookings);
router.get('/:id', protect, getBookingById);
router.get('/:id/download-ticket', protect, downloadTicket);
router.put('/:id/cancel', protect, cancelBooking);

// Admin routes
router.get('/admin/all', protect, admin, getAllBookings);
router.get('/admin/stats', protect, admin, getBookingStats);

module.exports = router;
