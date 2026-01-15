const Theater = require('../models/Theater');
const Showtime = require('../models/Showtime');

// Public routes
exports.getTheaters = async (req, res) => {
    try {
        const { city } = req.query;
        let query = {};

        if (city) {
            query.city = city;
        }

        const theaters = await Theater.find(query);
        res.json(theaters);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getTheaterById = async (req, res) => {
    try {
        const theater = await Theater.findById(req.params.id);
        if (theater) {
            res.json(theater);
        } else {
            res.status(404).json({ message: 'Theater not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Admin routes
exports.createTheater = async (req, res) => {
    try {
        const theater = await Theater.create(req.body);
        res.status(201).json(theater);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.updateTheater = async (req, res) => {
    try {
        const theater = await Theater.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        if (theater) {
            res.json(theater);
        } else {
            res.status(404).json({ message: 'Theater not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.deleteTheater = async (req, res) => {
    try {
        const theater = await Theater.findByIdAndDelete(req.params.id);
        if (theater) {
            res.json({ message: 'Theater deleted successfully' });
        } else {
            res.status(404).json({ message: 'Theater not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Showtime management
exports.createShowtime = async (req, res) => {
    try {
        const { movie, theater, screenName, startTime, duration } = req.body;

        // Get theater details
        const theaterDoc = await Theater.findById(theater);
        if (!theaterDoc) {
            return res.status(404).json({ message: 'Theater not found' });
        }

        // Find the screen
        const screen = theaterDoc.screens.find(s => s.name === screenName);
        if (!screen) {
            return res.status(404).json({ message: 'Screen not found' });
        }

        // Generate seats based on screen layout
        const seats = screen.seatLayout.map(seat => ({
            seatNumber: seat.seatNumber,
            row: seat.row,
            col: seat.col,
            type: seat.type,
            price: screen.pricing[seat.type],
            status: seat.isBlocked ? 'booked' : 'available',
        }));

        // Calculate end time
        const endTime = new Date(new Date(startTime).getTime() + duration * 60000);

        const showtime = await Showtime.create({
            movie,
            theater,
            screenName,
            startTime,
            endTime,
            seats,
        });

        res.status(201).json(showtime);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.updateShowtime = async (req, res) => {
    try {
        const showtime = await Showtime.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        if (showtime) {
            res.json(showtime);
        } else {
            res.status(404).json({ message: 'Showtime not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.deleteShowtime = async (req, res) => {
    try {
        const showtime = await Showtime.findByIdAndUpdate(
            req.params.id,
            { isActive: false },
            { new: true }
        );
        if (showtime) {
            res.json({ message: 'Showtime deactivated successfully' });
        } else {
            res.status(404).json({ message: 'Showtime not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getAllShowtimes = async (req, res) => {
    try {
        const showtimes = await Showtime.find({})
            .populate('movie')
            .populate('theater')
            .sort({ startTime: -1 });
        res.json(showtimes);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
