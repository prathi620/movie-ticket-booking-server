const Showtime = require('../models/Showtime');
const Theater = require('../models/Theater');
const Movie = require('../models/Movie');

// Helper to generate seats (extracted from seeder logic)
const generateSeats = (rows, cols, basePrice) => {
    const seats = [];
    for (let r = 0; r < rows; r++) {
        let seatType = 'standard';
        let seatPrice = basePrice;

        // Make last row VIP, second last Premium
        if (r === rows - 1) {
            seatType = 'vip';
            seatPrice = basePrice + 100;
        } else if (r === rows - 2) {
            seatType = 'premium';
            seatPrice = basePrice + 50;
        }

        for (let c = 0; c < cols; c++) {
            const rowChar = String.fromCharCode(65 + r); // A, B, C...
            const seatNum = `${rowChar}${c + 1}`; // A1, A2...
            seats.push({
                seatNumber: seatNum,
                row: r,
                col: c,
                type: seatType,
                price: seatPrice,
                status: 'available'
            });
        }
    }
    return seats;
};

/**
 * Generates showtimes for a specific movie for a given number of days.
 * @param {string} movieId - The ID of the movie.
 * @param {number} daysToGenerate - Number of days to generate showtimes for (default 7).
 */
const generateShowtimesForMovie = async (movieId, daysToGenerate = 7) => {
    try {
        const movie = await Movie.findById(movieId);
        if (!movie) throw new Error('Movie not found');

        const theaters = await Theater.find({});
        if (theaters.length === 0) return; // No theaters to schedule in

        const showtimes = [];
        const today = new Date();

        // Use a consistent offset based on movie ID to rotate slots, ensuring variety
        // simplified hash of objectId
        const movieOffset = parseInt(movieId.toString().slice(-4), 16);

        // CRITICAL FIX: Clear ANY existing future showtimes for this movie to prevent duplicates or excessive dates
        // This ensures that when we generate, we are starting fresh from "Today"
        await Showtime.deleteMany({
            movie: movieId,
            startTime: { $gte: new Date() }
        });

        for (let i = 0; i < daysToGenerate; i++) {
            const date = new Date(today);
            date.setDate(date.getDate() + i);

            // Iterate through theaters to distribute showtimes
            theaters.forEach((theater, tIndex) => {
                // Determine screen(s) to use. 
                // Simple logic: Rotate screens based on day index + theater index
                const screenIdx = (i + tIndex) % theater.screens.length;
                const screen = theater.screens[screenIdx];

                // Define ALL available time slots
                const allTimeSlots = [
                    [10, 0], [10, 30], [11, 0], [11, 30], [12, 0], [13, 0],
                    [13, 30], [14, 0], [14, 30], [15, 0], [16, 0], [16, 30],
                    [17, 0], [17, 30], [18, 0], [19, 0], [19, 30], [20, 0],
                    [20, 30], [21, 0]
                ];

                // Select 3 slots per day per theater for this movie
                // Use the random-ish movieOffset to pick different slots for different movies
                // Use a more random offset to prevent identical schedules
                // Mix movie ID chars + day index + theater index + random value
                const randomOffset = Math.floor(Math.random() * 5);
                const slot1Idx = (movieOffset + i * 3 + tIndex + randomOffset) % allTimeSlots.length;
                const slot2Idx = (movieOffset + i * 3 + tIndex + 7 + randomOffset) % allTimeSlots.length;
                const slot3Idx = (movieOffset + i * 3 + tIndex + 14 + randomOffset) % allTimeSlots.length;

                const selectedSlots = [allTimeSlots[slot1Idx], allTimeSlots[slot2Idx], allTimeSlots[slot3Idx]];

                selectedSlots.forEach(([hour, minute]) => {
                    const startTime = new Date(date);
                    startTime.setHours(hour, minute, 0, 0);

                    const endTime = new Date(startTime.getTime() + movie.duration * 60000);

                    showtimes.push({
                        movie: movie._id,
                        theater: theater._id,
                        screenName: screen.name,
                        startTime: startTime,
                        endTime: endTime,
                        seats: generateSeats(screen.rows, screen.cols, screen.pricing.standard)
                    });
                });
            });
        }

        if (showtimes.length > 0) {
            await Showtime.insertMany(showtimes);
            console.log(`Generated ${showtimes.length} showtimes for movie ${movie.title}`);
        }

    } catch (error) {
        console.error('Error generating showtimes:', error);
        // Don't crash the request if generation fails, just log it
    }
};

module.exports = {
    generateShowtimesForMovie
};
