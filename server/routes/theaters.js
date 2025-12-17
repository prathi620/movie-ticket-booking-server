const express = require('express');
const {
    getTheaters,
    getTheaterById,
    createTheater,
    updateTheater,
    deleteTheater,
    createShowtime,
    updateShowtime,
    deleteShowtime,
    getAllShowtimes
} = require('../controllers/theaterController');
const { protect, admin } = require('../middleware/authMiddleware');

const router = express.Router();

// Public routes
router.get('/', getTheaters);
router.get('/:id', getTheaterById);

// Admin routes - Theaters
router.post('/', protect, admin, createTheater);
router.put('/:id', protect, admin, updateTheater);
router.delete('/:id', protect, admin, deleteTheater);

// Admin routes - Showtimes
router.post('/showtimes', protect, admin, createShowtime);
router.put('/showtimes/:id', protect, admin, updateShowtime);
router.delete('/showtimes/:id', protect, admin, deleteShowtime);
router.get('/showtimes/all', protect, admin, getAllShowtimes);

module.exports = router;
