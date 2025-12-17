const Booking = require('../models/Booking');
const Showtime = require('../models/Showtime');
const Movie = require('../models/Movie');
const Theater = require('../models/Theater');
const { createPaymentIntent, verifyPayment, createRefund } = require('../utils/payment');
const { sendBookingConfirmation, sendCancellationEmail } = require('../utils/email');
const { generateBookingQRCode } = require('../services/qrCodeService');
const { generateTicketPDF } = require('../services/pdfService');

// Lock seats temporarily
exports.lockSeats = async (req, res) => {
    const { showtimeId, seatNumbers, sessionId } = req.body;

    try {
        const showtime = await Showtime.findById(showtimeId);
        if (!showtime) {
            return res.status(404).json({ message: 'Showtime not found' });
        }

        // Prevent booking for past showtimes
        if (new Date(showtime.startTime) < new Date()) {
            return res.status(400).json({ message: 'Cannot book tickets for past showtimes' });
        }

        // Check if seats are available
        const unavailableSeats = [];
        seatNumbers.forEach(seatNum => {
            const seat = showtime.seats.find(s => s.seatNumber === seatNum);
            if (!seat || seat.status !== 'available') {
                unavailableSeats.push(seatNum);
            }
        });

        if (unavailableSeats.length > 0) {
            return res.status(400).json({
                message: 'Some seats are not available',
                unavailableSeats
            });
        }

        // Lock the seats
        seatNumbers.forEach(seatNum => {
            const seat = showtime.seats.find(s => s.seatNumber === seatNum);
            if (seat) {
                seat.status = 'locked';
                seat.lockedBy = sessionId;
                seat.lockedAt = new Date();
            }
        });

        await showtime.save();

        // Set timeout to unlock seats after 10 minutes
        setTimeout(async () => {
            try {
                const st = await Showtime.findById(showtimeId);
                if (st) {
                    let updated = false;
                    st.seats.forEach(seat => {
                        if (seat.lockedBy === sessionId && seat.status === 'locked') {
                            seat.status = 'available';
                            seat.lockedBy = null;
                            seat.lockedAt = null;
                            updated = true;
                        }
                    });
                    if (updated) await st.save();
                }
            } catch (error) {
                console.error('Error unlocking seats:', error);
            }
        }, 10 * 60 * 1000); // 10 minutes

        res.json({ message: 'Seats locked successfully', expiresIn: 600 });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Create payment intent
exports.createPayment = async (req, res) => {
    const { amount, bookingId } = req.body;

    try {
        const result = await createPaymentIntent(amount, bookingId);

        if (result.success) {
            res.json({
                clientSecret: result.clientSecret,
                paymentIntentId: result.paymentIntentId
            });
        } else {
            res.status(500).json({ message: result.error });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Create booking after payment
exports.createBooking = async (req, res) => {
    const { showtimeId, seats, totalPrice, paymentIntentId, sessionId } = req.body;

    try {
        // Verify payment
        const paymentResult = await verifyPayment(paymentIntentId);

        if (!paymentResult.success || paymentResult.status !== 'succeeded') {
            return res.status(400).json({ message: 'Payment verification failed' });
        }

        const showtime = await Showtime.findById(showtimeId)
            .populate('movie')
            .populate('theater');

        if (!showtime) {
            return res.status(404).json({ message: 'Showtime not found' });
        }

        if (!showtime.movie) {
            console.error(`Showtime ${showtimeId} has no movie populated`);
            return res.status(500).json({ message: 'Configuration error: Showtime has no associated movie' });
        }

        if (!showtime.theater) {
            console.error(`Showtime ${showtimeId} has no theater populated`);
            return res.status(500).json({ message: 'Configuration error: Showtime has no associated theater' });
        }



        // Update seats from locked to booked
        const bookedSeats = [];
        seats.forEach(seatNum => {
            const seat = showtime.seats.find(s => s.seatNumber === seatNum);
            if (seat && seat.lockedBy === sessionId) {
                console.log(`Updating seat ${seatNum} from ${seat.status} to booked`);
                seat.status = 'booked';
                seat.bookedBy = req.user._id;
                seat.lockedBy = null;
                seat.lockedAt = null;

                bookedSeats.push({
                    seatNumber: seat.seatNumber,
                    row: seat.row,
                    col: seat.col,
                    type: seat.type,
                    price: seat.price
                });
            }
        });

        if (bookedSeats.length !== seats.length) {
            console.error(`Seat booking mismatch: requested ${seats.length}, booked ${bookedSeats.length}`);
            return res.status(400).json({ message: 'Some seats could not be booked' });
        }

        // Save showtime with updated seat statuses
        await showtime.save();
        console.log(`Showtime ${showtimeId} saved with ${bookedSeats.length} booked seats`);

        console.log('Creating booking with seats:', JSON.stringify(bookedSeats, null, 2));

        // Create booking
        const booking = await Booking.create({
            user: req.user._id,
            showtime: showtimeId,
            movie: showtime.movie._id,
            theater: showtime.theater._id,
            seats: bookedSeats,
            totalPrice,
            paymentId: paymentIntentId,
            paymentStatus: 'completed',
            status: 'confirmed'
        });

        // Generate QR code
        const qrResult = await generateBookingQRCode(booking);
        if (qrResult.success) {
            booking.qrCode = qrResult.qrCode;
            await booking.save();
        }

        // Send confirmation email
        try {
            await sendBookingConfirmation(
                booking,
                req.user,
                showtime.movie,
                showtime.theater,
                showtime
            );
            booking.emailSent = true;
            await booking.save();
        } catch (emailError) {
            console.error('Email sending failed:', emailError);
        }

        const populatedBooking = await Booking.findById(booking._id)
            .populate('movie')
            .populate('theater')
            .populate({
                path: 'showtime',
                populate: { path: 'movie theater' }
            });

        res.status(201).json(populatedBooking);
    } catch (error) {
        console.error('Create Booking Error:', error);
        res.status(500).json({ message: error.message });
    }
};

// Get user bookings
exports.getUserBookings = async (req, res) => {
    try {
        const { status } = req.query;
        let query = { user: req.user._id };

        if (status) {
            query.status = status;
        }

        const bookings = await Booking.find(query)
            .populate('movie')
            .populate('theater')
            .populate({
                path: 'showtime',
                populate: { path: 'movie theater' }
            })
            .sort({ createdAt: -1 });

        // Separate upcoming and past bookings
        const now = new Date();
        const upcoming = [];
        const past = [];

        bookings.forEach(booking => {
            if (booking.showtime && new Date(booking.showtime.startTime) > now) {
                upcoming.push(booking);
            } else {
                past.push(booking);
            }
        });

        res.json({ upcoming, past, all: bookings });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get booking by ID
exports.getBookingById = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id)
            .populate('movie')
            .populate('theater')
            .populate({
                path: 'showtime',
                populate: { path: 'movie theater' }
            });

        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        // Check if user owns this booking
        if (booking.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized' });
        }

        res.json(booking);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Cancel booking
exports.cancelBooking = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id)
            .populate('movie')
            .populate('showtime');

        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        // Check if user owns this booking
        if (booking.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        // Check if booking is already cancelled
        if (booking.status === 'cancelled') {
            return res.status(400).json({ message: 'Booking already cancelled' });
        }

        // Check if showtime has passed
        if (new Date(booking.showtime.startTime) < new Date()) {
            return res.status(400).json({ message: 'Cannot cancel past bookings' });
        }

        // Update showtime seats
        const showtime = await Showtime.findById(booking.showtime._id);
        booking.seats.forEach(bookedSeat => {
            const seat = showtime.seats.find(s => s.seatNumber === bookedSeat.seatNumber);
            if (seat) {
                seat.status = 'available';
                seat.bookedBy = null;
            }
        });
        await showtime.save();

        // Process refund
        try {
            await createRefund(booking.paymentId, booking.totalPrice);
            booking.paymentStatus = 'refunded';
        } catch (refundError) {
            console.error('Refund failed:', refundError);
        }

        // Update booking
        booking.status = 'cancelled';
        booking.cancelledAt = new Date();
        await booking.save();

        // Send cancellation email
        try {
            await sendCancellationEmail(booking, req.user, booking.movie);
        } catch (emailError) {
            console.error('Email sending failed:', emailError);
        }

        res.json({ message: 'Booking cancelled successfully', booking });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Admin: Get all bookings
exports.getAllBookings = async (req, res) => {
    try {
        const bookings = await Booking.find({})
            .populate('user', 'name email')
            .populate('movie')
            .populate('theater')
            .populate('showtime')
            .sort({ createdAt: -1 });

        res.json(bookings);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Admin: Get booking statistics
exports.getBookingStats = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;

        let dateFilter = {};
        if (startDate && endDate) {
            dateFilter = {
                createdAt: {
                    $gte: new Date(startDate),
                    $lte: new Date(endDate)
                }
            };
        }

        const totalBookings = await Booking.countDocuments({ ...dateFilter, status: 'confirmed' });
        const cancelledBookings = await Booking.countDocuments({ ...dateFilter, status: 'cancelled' });

        const revenueResult = await Booking.aggregate([
            { $match: { ...dateFilter, status: 'confirmed', paymentStatus: 'completed' } },
            { $group: { _id: null, total: { $sum: '$totalPrice' } } }
        ]);
        const totalRevenue = revenueResult.length > 0 ? revenueResult[0].total : 0;

        // Popular movies
        const popularMovies = await Booking.aggregate([
            { $match: { ...dateFilter, status: 'confirmed' } },
            { $group: { _id: '$movie', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 5 },
            { $lookup: { from: 'movies', localField: '_id', foreignField: '_id', as: 'movieDetails' } },
            { $unwind: '$movieDetails' }
        ]);

        // Daily revenue
        const dailyRevenue = await Booking.aggregate([
            { $match: { ...dateFilter, status: 'confirmed', paymentStatus: 'completed' } },
            {
                $group: {
                    _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
                    revenue: { $sum: '$totalPrice' },
                    bookings: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        res.json({
            totalBookings,
            cancelledBookings,
            totalRevenue,
            popularMovies,
            dailyRevenue
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
