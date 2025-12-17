const mongoose = require('mongoose');

const movieSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    genre: { type: [String], required: true },
    language: { type: String, required: true },
    releaseDate: { type: Date, required: true },
    duration: { type: Number, required: true }, // in minutes
    posterUrl: { type: String, required: true },
    backdropUrl: { type: String, required: true },
    trailerUrl: { type: String },
    rating: { type: Number, default: 0 },
    tmdbId: { type: String }, // For external API sync
    isActive: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('Movie', movieSchema);
