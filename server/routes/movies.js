const express = require('express');
const {
    getMovies,
    getMovieById,
    getShowtimesForMovie,
    getShowtimeById,
    createMovie,
    updateMovie,
    deleteMovie,
    getAllMoviesAdmin
} = require('../controllers/movieController');
const { searchTMDB, syncFromTMDB, getPopularFromTMDB } = require('../controllers/tmdbController');
const { protect, admin } = require('../middleware/authMiddleware');

const router = express.Router();

// Public routes
router.get('/', getMovies);
router.get('/showtime/:id', getShowtimeById); // SPECIFIC ROUTE FIRST
router.get('/:id/showtimes', getShowtimesForMovie);
router.get('/:id', getMovieById); // GENERIC ROUTE LAST

// Admin routes
router.post('/', protect, admin, createMovie);
router.put('/:id', protect, admin, updateMovie);
router.delete('/:id', protect, admin, deleteMovie);
router.get('/admin/all', protect, admin, getAllMoviesAdmin);

// TMDB Integration routes (Admin only)
router.get('/tmdb/search', protect, admin, searchTMDB);
router.post('/tmdb/sync', protect, admin, syncFromTMDB);
router.get('/tmdb/popular', protect, admin, getPopularFromTMDB);

module.exports = router;
