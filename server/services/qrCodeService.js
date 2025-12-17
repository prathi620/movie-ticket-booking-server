const QRCode = require('qrcode');

/**
 * Generate QR code for booking
 * @param {Object} bookingData - Booking information
 * @returns {Promise<string>} Base64 encoded QR code image
 */
exports.generateBookingQRCode = async (bookingData) => {
    try {
        const qrData = JSON.stringify({
            bookingId: bookingData.bookingId,
            userId: bookingData.user,
            movieId: bookingData.movie,
            showtimeId: bookingData.showtime,
            seats: bookingData.seats.map(s => s.seatNumber),
            totalPrice: bookingData.totalPrice,
            timestamp: new Date().toISOString()
        });

        // Generate QR code as base64 data URL
        const qrCodeDataURL = await QRCode.toDataURL(qrData, {
            errorCorrectionLevel: 'H',
            type: 'image/png',
            width: 300,
            margin: 2,
            color: {
                dark: '#000000',
                light: '#FFFFFF'
            }
        });

        return {
            success: true,
            qrCode: qrCodeDataURL
        };
    } catch (error) {
        console.error('[QR Code] Generation error:', error.message);
        return {
            success: false,
            error: error.message
        };
    }
};

/**
 * Verify QR code data
 * @param {string} qrData - QR code data string
 * @returns {Object} Parsed booking data
 */
exports.verifyQRCode = (qrData) => {
    try {
        const bookingData = JSON.parse(qrData);

        // Basic validation
        if (!bookingData.bookingId || !bookingData.userId) {
            return {
                success: false,
                error: 'Invalid QR code data'
            };
        }

        return {
            success: true,
            data: bookingData
        };
    } catch (error) {
        return {
            success: false,
            error: 'Failed to parse QR code data'
        };
    }
};

/**
 * Generate QR code as buffer (for PDF embedding)
 * @param {Object} bookingData - Booking information
 * @returns {Promise<Buffer>} QR code image buffer
 */
exports.generateQRCodeBuffer = async (bookingData) => {
    try {
        const qrData = JSON.stringify({
            bookingId: bookingData.bookingId,
            userId: bookingData.user,
            movieId: bookingData.movie,
            showtimeId: bookingData.showtime,
            seats: bookingData.seats.map(s => s.seatNumber),
            totalPrice: bookingData.totalPrice,
            timestamp: new Date().toISOString()
        });

        const buffer = await QRCode.toBuffer(qrData, {
            errorCorrectionLevel: 'H',
            type: 'png',
            width: 200,
            margin: 1
        });

        return {
            success: true,
            buffer
        };
    } catch (error) {
        console.error('[QR Code] Buffer generation error:', error.message);
        return {
            success: false,
            error: error.message
        };
    }
};
