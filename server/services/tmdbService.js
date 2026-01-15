const axios = require('axios');

const TMDB_API_KEY = process.env.TMDB_API_KEY;
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p';

/**
 * Search movies from TMDB
 */
exports.searchMovies = async (query) => {
    try {
        if (!TMDB_API_KEY) {
            console.log('[TMDB] API key not configured, skipping search');
            return { success: false, error: 'TMDB API key not configured' };
        }

        const response = await axios.get(`${TMDB_BASE_URL}/search/movie`, {
            params: {
                api_key: TMDB_API_KEY,
                query,
                language: 'en-US',
                page: 1
            }
        });

        return {
            success: true,
            results: response.data.results.map(movie => ({
                tmdbId: movie.id,
                title: movie.title,
                description: movie.overview,
                releaseDate: movie.release_date,
                rating: movie.vote_average,
                posterUrl: movie.poster_path ? `${TMDB_IMAGE_BASE}/w500${movie.poster_path}` : null,
                backdropUrl: movie.backdrop_path ? `${TMDB_IMAGE_BASE}/original${movie.backdrop_path}` : null
            }))
        };
    } catch (error) {
        console.error('[TMDB] Search error:', error.message);
        return { success: false, error: error.message };
    }
};

/**
 * Get movie details from TMDB by ID
 */
exports.getMovieDetails = async (tmdbId) => {
    try {
        if (!TMDB_API_KEY) {
            return { success: false, error: 'TMDB API key not configured' };
        }

        // Get movie details
        const movieResponse = await axios.get(`${TMDB_BASE_URL}/movie/${tmdbId}`, {
            params: {
                api_key: TMDB_API_KEY,
                language: 'en-US'
            }
        });

        // Get videos (trailers)
        const videosResponse = await axios.get(`${TMDB_BASE_URL}/movie/${tmdbId}/videos`, {
            params: {
                api_key: TMDB_API_KEY,
                language: 'en-US'
            }
        });

        const movie = movieResponse.data;
        const trailer = videosResponse.data.results.find(v => v.type === 'Trailer' && v.site === 'YouTube');

        return {
            success: true,
            movie: {
                tmdbId: movie.id,
                title: movie.title,
                description: movie.overview,
                genre: movie.genres.map(g => g.name),
                language: movie.original_language.toUpperCase(),
                releaseDate: movie.release_date,
                duration: movie.runtime,
                posterUrl: movie.poster_path ? `${TMDB_IMAGE_BASE}/w500${movie.poster_path}` : null,
                backdropUrl: movie.backdrop_path ? `${TMDB_IMAGE_BASE}/original${movie.backdrop_path}` : null,
                trailerUrl: trailer ? `https://www.youtube.com/watch?v=${trailer.key}` : null,
                rating: movie.vote_average
            }
        };
    } catch (error) {
        console.error('[TMDB] Get details error:', error.message);
        return { success: false, error: error.message };
    }
};

/**
 * Sync movie data from TMDB to database
 */
exports.syncMovieData = async (Movie, tmdbId) => {
    try {
        const result = await this.getMovieDetails(tmdbId);

        if (!result.success) {
            return result;
        }

        // Check if movie already exists
        const existingMovie = await Movie.findOne({ tmdbId });

        if (existingMovie) {
            // Update existing movie
            Object.assign(existingMovie, result.movie);
            await existingMovie.save();
            return { success: true, movie: existingMovie, updated: true };
        } else {
            // Create new movie
            const newMovie = await Movie.create(result.movie);
            return { success: true, movie: newMovie, updated: false };
        }
    } catch (error) {
        console.error('[TMDB] Sync error:', error.message);
        return { success: false, error: error.message };
    }
};

/**
 * Get popular movies from TMDB
 */
exports.getPopularMovies = async () => {
    try {
        if (!TMDB_API_KEY) {
            return { success: false, error: 'TMDB API key not configured' };
        }

        const response = await axios.get(`${TMDB_BASE_URL}/movie/popular`, {
            params: {
                api_key: TMDB_API_KEY,
                language: 'en-US',
                page: 1
            }
        });

        return {
            success: true,
            results: response.data.results.map(movie => ({
                tmdbId: movie.id,
                title: movie.title,
                description: movie.overview,
                releaseDate: movie.release_date,
                rating: movie.vote_average,
                posterUrl: movie.poster_path ? `${TMDB_IMAGE_BASE}/w500${movie.poster_path}` : null,
                backdropUrl: movie.backdrop_path ? `${TMDB_IMAGE_BASE}/original${movie.backdrop_path}` : null
            }))
        };
    } catch (error) {
        console.error('[TMDB] Popular movies error:', error.message);
        return { success: false, error: error.message };
    }
};
