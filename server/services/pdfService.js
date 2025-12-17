const PDFDocument = require('pdfkit');
const { generateQRCodeBuffer } = require('./qrCodeService');

/**
 * Generate PDF ticket for booking
 * @param {Object} booking - Booking document
 * @param {Object} user - User document
 * @param {Object} movie - Movie document
 * @param {Object} theater - Theater document
 * @param {Object} showtime - Showtime document
 * @returns {Promise<Buffer>} PDF buffer
 */
exports.generateTicketPDF = async (booking, user, movie, theater, showtime) => {
    return new Promise(async (resolve, reject) => {
        try {
            const doc = new PDFDocument({ size: 'A4', margin: 50 });
            const chunks = [];

            // Collect PDF data
            doc.on('data', chunk => chunks.push(chunk));
            doc.on('end', () => resolve(Buffer.concat(chunks)));
            doc.on('error', reject);

            // Header
            doc.fontSize(24)
                .fillColor('#4F46E5')
                .text('🎬 MOVIE TICKET', { align: 'center' })
                .moveDown(0.5);

            doc.fontSize(10)
                .fillColor('#6B7280')
                .text('Your booking confirmation', { align: 'center' })
                .moveDown(2);

            // Booking ID
            doc.fontSize(12)
                .fillColor('#000000')
                .text(`Booking ID: ${booking.bookingId}`, { align: 'center' })
                .moveDown(1);

            // Movie Details
            doc.fontSize(18)
                .fillColor('#111827')
                .text(movie.title, { align: 'center' })
                .moveDown(0.5);

            doc.fontSize(11)
                .fillColor('#6B7280')
                .text(`${movie.genre.join(', ')} • ${movie.language} • ${movie.duration} mins`, { align: 'center' })
                .moveDown(2);

            // Divider
            doc.strokeColor('#E5E7EB')
                .lineWidth(1)
                .moveTo(50, doc.y)
                .lineTo(545, doc.y)
                .stroke()
                .moveDown(1);

            // Theater & Showtime Details
            const detailsY = doc.y;

            doc.fontSize(10)
                .fillColor('#6B7280')
                .text('THEATER', 50, detailsY)
                .fontSize(12)
                .fillColor('#111827')
                .text(theater.name, 50, detailsY + 15)
                .fontSize(10)
                .fillColor('#6B7280')
                .text(theater.location, 50, detailsY + 32)
                .text(theater.city, 50, detailsY + 47);

            const showDate = new Date(showtime.startTime);
            const dateStr = showDate.toLocaleDateString('en-US', {
                weekday: 'short',
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
            const timeStr = showDate.toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit'
            });

            doc.fontSize(10)
                .fillColor('#6B7280')
                .text('DATE & TIME', 300, detailsY)
                .fontSize(12)
                .fillColor('#111827')
                .text(dateStr, 300, detailsY + 15)
                .text(timeStr, 300, detailsY + 32)
                .fontSize(10)
                .fillColor('#6B7280')
                .text(`Screen: ${showtime.screenName}`, 300, detailsY + 47);

            doc.moveDown(5);

            // Seats
            const seatNumbers = booking.seats.map(s => s.seatNumber).join(', ');
            doc.fontSize(10)
                .fillColor('#6B7280')
                .text('SEATS', 50)
                .fontSize(14)
                .fillColor('#111827')
                .text(seatNumbers, 50)
                .moveDown(1);

            // Total Price
            doc.fontSize(10)
                .fillColor('#6B7280')
                .text('TOTAL AMOUNT', 50)
                .fontSize(16)
                .fillColor('#059669')
                .text(`₹${booking.totalPrice}`, 50)
                .moveDown(2);

            // Divider
            doc.strokeColor('#E5E7EB')
                .lineWidth(1)
                .moveTo(50, doc.y)
                .lineTo(545, doc.y)
                .stroke()
                .moveDown(1);

            // QR Code
            const qrResult = await generateQRCodeBuffer(booking);
            if (qrResult.success) {
                doc.fontSize(10)
                    .fillColor('#6B7280')
                    .text('SCAN QR CODE AT THEATER', { align: 'center' })
                    .moveDown(0.5);

                doc.image(qrResult.buffer, {
                    fit: [150, 150],
                    align: 'center'
                });
                doc.moveDown(2);
            }

            // Footer
            doc.fontSize(9)
                .fillColor('#9CA3AF')
                .text('Please arrive 15 minutes before showtime', { align: 'center' })
                .text('Carry a valid ID proof for verification', { align: 'center' })
                .moveDown(1);

            doc.fontSize(8)
                .fillColor('#D1D5DB')
                .text(`Booked by: ${user.name} (${user.email})`, { align: 'center' })
                .text(`Generated on: ${new Date().toLocaleString()}`, { align: 'center' });

            // Finalize PDF
            doc.end();

        } catch (error) {
            reject(error);
        }
    });
};
