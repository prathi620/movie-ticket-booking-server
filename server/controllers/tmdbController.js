
const tmdbService = require('../services/tmdbService');
const Movie = require('../models/Movie');

// TMDB Integration endpoints

// Search movies from TMDB
exports.searchTMDB = async (req, res) => {
    try {
        const { query } = req.query;

        if (!query) {
            return res.status(400).json({ message: 'Search query is required' });
        }

        const result = await tmdbService.searchMovies(query);

        if (result.success) {
            res.json(result.results);
        } else {
            res.status(500).json({ message: result.error });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Sync movie from TMDB by ID
exports.syncFromTMDB = async (req, res) => {
    try {
        const { tmdbId } = req.body;

        if (!tmdbId) {
            return res.status(400).json({ message: 'TMDB ID is required' });
        }

        const result = await tmdbService.syncMovieData(Movie, tmdbId);

        if (result.success) {
            res.json({
                message: result.updated ? 'Movie updated from TMDB' : 'Movie imported from TMDB',
                movie: result.movie
            });
        } else {
            res.status(500).json({ message: result.error });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get popular movies from TMDB
exports.getPopularFromTMDB = async (req, res) => {
    try {
        const result = await tmdbService.getPopularMovies();

        if (result.success) {
            res.json(result.results);
        } else {
            res.status(500).json({ message: result.error });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
