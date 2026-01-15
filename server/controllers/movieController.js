const Movie = require('../models/Movie');
const Showtime = require('../models/Showtime');
const tmdbService = require('../services/tmdbService');
const { generateShowtimesForMovie } = require('../services/showtimeService');

// Public routes
exports.getMovies = async (req, res) => {
    try {
        const { search, genre, language, sortBy } = req.query;
        let query = { isActive: true };

        if (search) {
            query.title = { $regex: search, $options: 'i' };
        }
        if (genre) {
            query.genre = { $in: [genre] };
        }
        if (language) {
            query.language = language;
        }

        let movies = Movie.find(query);

        if (sortBy === 'rating') {
            movies = movies.sort({ rating: -1 });
        } else if (sortBy === 'releaseDate') {
            movies = movies.sort({ releaseDate: -1 });
        } else {
            movies = movies.sort({ createdAt: -1 });
        }

        const result = await movies;
        res.json(result);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getMovieById = async (req, res) => {
    try {
        const movie = await Movie.findById(req.params.id);
        if (movie) {
            res.json(movie);
        } else {
            res.status(404).json({ message: 'Movie not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getShowtimesForMovie = async (req, res) => {
    try {
        const { date, city } = req.query;
        let query = { movie: req.params.id, isActive: true };

        // Determine the time range we are looking for
        if (date) {
            const startDate = new Date(date);
            startDate.setHours(0, 0, 0, 0);
            const endDate = new Date(date);
            endDate.setHours(23, 59, 59, 999);
            query.startTime = { $gte: startDate, $lte: endDate };
        } else {
            // By default, show upcoming showtimes only
            // LIMIT: Show only Today and Tomorrow (Next 2 days)
            const today = new Date();
            const limitDate = new Date(today);
            limitDate.setDate(today.getDate() + 2); // Today + 2 days
            limitDate.setHours(0, 0, 0, 0); // Start of the 3rd day

            query.startTime = {
                $gte: new Date(),
                $lt: limitDate
            };
        }

        let showtimes = await Showtime.find(query)
            .populate('theater')
            .populate('movie')
            .sort({ startTime: 1 });

        // AUTO-GENERATION LOGIC
        // If no showtimes found and we are looking for future/upcoming slots, generate them
        // We only generate if no specific date filter is applied, OR if the date filter is for today/future
        // and absolutely no showtimes were returned.
        const isFutureQuery = !date || new Date(date) >= new Date(new Date().setHours(0, 0, 0, 0));

        if (showtimes.length === 0 && isFutureQuery) {
            console.log(`No showtimes found for movie ${req.params.id}. Generating new showtimes...`);
            // Generate only for the next 2 days as requested
            await generateShowtimesForMovie(req.params.id, 2);

            // Re-fetch after generation
            // Reset query if it was specific date that might have been empty,
            // but usually we just want to fetch what we just created.
            // If the user asked for a specific date and we just generated showtimes,
            // we should be able to find them now if the date was within the generation window.

            // Simple re-run of the same query
            showtimes = await Showtime.find(query)
                .populate('theater')
                .populate('movie')
                .sort({ startTime: 1 });
        }

        if (city) {
            showtimes = showtimes.filter(st => st.theater.city === city);
        }

        res.json(showtimes);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getShowtimeById = async (req, res) => {
    try {
        const showtime = await Showtime.findById(req.params.id)
            .populate('movie')
            .populate('theater');
        if (showtime) {
            res.json(showtime);
        } else {
            res.status(404).json({ message: 'Showtime not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Admin routes
exports.createMovie = async (req, res) => {
    try {
        const movie = await Movie.create(req.body);
        res.status(201).json(movie);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.updateMovie = async (req, res) => {
    try {
        const movie = await Movie.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        if (movie) {
            res.json(movie);
        } else {
            res.status(404).json({ message: 'Movie not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.deleteMovie = async (req, res) => {
    try {
        const movie = await Movie.findByIdAndUpdate(
            req.params.id,
            { isActive: false },
            { new: true }
        );
        if (movie) {
            res.json({ message: 'Movie deactivated successfully' });
        } else {
            res.status(404).json({ message: 'Movie not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getAllMoviesAdmin = async (req, res) => {
    try {
        const movies = await Movie.find({}).sort({ createdAt: -1 });
        res.json(movies);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
