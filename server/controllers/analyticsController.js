const Booking = require('../models/Booking');
const Movie = require('../models/Movie');
const Theater = require('../models/Theater');
const User = require('../models/User');

/**
 * Get booking statistics for admin dashboard
 */
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

        // Total bookings
        const totalBookings = await Booking.countDocuments(dateFilter);

        // Total revenue
        const revenueData = await Booking.aggregate([
            { $match: { ...dateFilter, status: 'confirmed' } },
            { $group: { _id: null, total: { $sum: '$totalPrice' } } }
        ]);
        const totalRevenue = revenueData.length > 0 ? revenueData[0].total : 0;

        // Bookings by status
        const bookingsByStatus = await Booking.aggregate([
            { $match: dateFilter },
            { $group: { _id: '$status', count: { $sum: 1 } } }
        ]);

        // Popular movies
        const popularMovies = await Booking.aggregate([
            { $match: { ...dateFilter, status: 'confirmed' } },
            { $group: { _id: '$movie', bookings: { $sum: 1 }, revenue: { $sum: '$totalPrice' } } },
            { $sort: { bookings: -1 } },
            { $limit: 10 },
            {
                $lookup: {
                    from: 'movies',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'movieDetails'
                }
            },
            { $unwind: '$movieDetails' },
            {
                $project: {
                    title: '$movieDetails.title',
                    posterUrl: '$movieDetails.posterUrl',
                    bookings: 1,
                    revenue: 1
                }
            }
        ]);

        res.json({
            totalBookings,
            totalRevenue,
            bookingsByStatus,
            popularMovies
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * Get revenue analytics
 */
exports.getRevenueAnalytics = async (req, res) => {
    try {
        const { startDate, endDate, groupBy = 'day' } = req.query;

        let dateFilter = {
            createdAt: {
                $gte: startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
                $lte: endDate ? new Date(endDate) : new Date()
            },
            status: 'confirmed'
        };

        let groupFormat;
        switch (groupBy) {
            case 'month':
                groupFormat = { $dateToString: { format: '%Y-%m', date: '$createdAt' } };
                break;
            case 'week':
                groupFormat = { $dateToString: { format: '%Y-W%V', date: '$createdAt' } };
                break;
            default: // day
                groupFormat = { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } };
        }

        const revenueByDate = await Booking.aggregate([
            { $match: dateFilter },
            {
                $group: {
                    _id: groupFormat,
                    revenue: { $sum: '$totalPrice' },
                    bookings: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } },
            {
                $project: {
                    date: '$_id',
                    revenue: 1,
                    bookings: 1,
                    _id: 0
                }
            }
        ]);

        res.json(revenueByDate);

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * Get theater occupancy metrics
 */
exports.getTheaterOccupancy = async (req, res) => {
    try {
        const { theaterId, startDate, endDate } = req.query;

        let matchFilter = { status: 'confirmed' };

        if (theaterId) {
            matchFilter.theater = theaterId;
        }

        if (startDate && endDate) {
            matchFilter.createdAt = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        }

        const occupancyData = await Booking.aggregate([
            { $match: matchFilter },
            {
                $group: {
                    _id: '$theater',
                    totalSeatsBooked: { $sum: { $size: '$seats' } },
                    totalBookings: { $sum: 1 },
                    revenue: { $sum: '$totalPrice' }
                }
            },
            {
                $lookup: {
                    from: 'theaters',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'theaterDetails'
                }
            },
            { $unwind: '$theaterDetails' },
            {
                $project: {
                    theaterName: '$theaterDetails.name',
                    location: '$theaterDetails.location',
                    city: '$theaterDetails.city',
                    totalSeatsBooked: 1,
                    totalBookings: 1,
                    revenue: 1
                }
            },
            { $sort: { revenue: -1 } }
        ]);

        res.json(occupancyData);

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * Get user activity metrics
 */
exports.getUserActivityMetrics = async (req, res) => {
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

        // Total users
        const totalUsers = await User.countDocuments();

        // Active users (users who made bookings)
        const activeUsers = await Booking.distinct('user', {
            ...dateFilter,
            status: 'confirmed'
        });

        // New users in date range
        const newUsers = await User.countDocuments(dateFilter);

        // Top users by bookings
        const topUsers = await Booking.aggregate([
            { $match: { ...dateFilter, status: 'confirmed' } },
            {
                $group: {
                    _id: '$user',
                    bookings: { $sum: 1 },
                    totalSpent: { $sum: '$totalPrice' }
                }
            },
            { $sort: { bookings: -1 } },
            { $limit: 10 },
            {
                $lookup: {
                    from: 'users',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'userDetails'
                }
            },
            { $unwind: '$userDetails' },
            {
                $project: {
                    name: '$userDetails.name',
                    email: '$userDetails.email',
                    bookings: 1,
                    totalSpent: 1
                }
            }
        ]);

        res.json({
            totalUsers,
            activeUsers: activeUsers.length,
            newUsers,
            topUsers
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * Get booking trends
 */
exports.getBookingTrends = async (req, res) => {
    try {
        const { period = '30' } = req.query; // days

        const startDate = new Date();
        startDate.setDate(startDate.getDate() - parseInt(period));

        const trends = await Booking.aggregate([
            {
                $match: {
                    createdAt: { $gte: startDate },
                    status: 'confirmed'
                }
            },
            {
                $group: {
                    _id: {
                        $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
                    },
                    bookings: { $sum: 1 },
                    revenue: { $sum: '$totalPrice' },
                    avgBookingValue: { $avg: '$totalPrice' }
                }
            },
            { $sort: { _id: 1 } },
            {
                $project: {
                    date: '$_id',
                    bookings: 1,
                    revenue: 1,
                    avgBookingValue: { $round: ['$avgBookingValue', 2] },
                    _id: 0
                }
            }
        ]);

        res.json(trends);

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
