
const Booking = require('../models/Booking');
const { generateTicketPDF } = require('../services/pdfService');

// Download PDF ticket
exports.downloadTicket = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id)
            .populate('user')
            .populate('movie')
            .populate('theater')
            .populate('showtime');

        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        // Check if user owns this booking
        if (booking.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized' });
        }

        // Generate PDF
        const pdfBuffer = await generateTicketPDF(
            booking,
            booking.user,
            booking.movie,
            booking.theater,
            booking.showtime
        );

        // Set headers for PDF download
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=ticket-${booking.bookingId}.pdf`);
        res.send(pdfBuffer);

    } catch (error) {
        console.error('PDF generation error:', error);
        res.status(500).json({ message: 'Failed to generate ticket PDF' });
    }
};
