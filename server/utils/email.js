const nodemailer = require('nodemailer');

// Create reusable transporter
const createTransporter = () => {
    return nodemailer.createTransporter({
        service: process.env.EMAIL_SERVICE || 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });
};

// Send booking confirmation email
exports.sendBookingConfirmation = async (booking, user, movieDetails, theaterDetails, showtimeDetails) => {
    try {
        const transporter = createTransporter();

        const seatNumbers = booking.seats.map(s => s.seatNumber).join(', ');
        const showDate = new Date(showtimeDetails.startTime).toLocaleDateString();
        const showTime = new Date(showtimeDetails.startTime).toLocaleTimeString();

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: user.email,
            subject: `Booking Confirmed - ${movieDetails.title}`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #4F46E5;">🎬 Booking Confirmed!</h2>
                    <p>Hi ${user.name},</p>
                    <p>Your movie ticket booking has been confirmed.</p>
                    
                    <div style="background: #F3F4F6; padding: 20px; border-radius: 8px; margin: 20px 0;">
                        <h3 style="margin-top: 0;">Booking Details</h3>
                        <p><strong>Booking ID:</strong> ${booking.bookingId}</p>
                        <p><strong>Movie:</strong> ${movieDetails.title}</p>
                        <p><strong>Theater:</strong> ${theaterDetails.name}</p>
                        <p><strong>Location:</strong> ${theaterDetails.location}</p>
                        <p><strong>Screen:</strong> ${showtimeDetails.screenName}</p>
                        <p><strong>Date:</strong> ${showDate}</p>
                        <p><strong>Time:</strong> ${showTime}</p>
                        <p><strong>Seats:</strong> ${seatNumbers}</p>
                        <p><strong>Total Amount:</strong> ₹${booking.totalPrice}</p>
                    </div>
                    
                    <p style="color: #6B7280;">Please arrive 15 minutes before the show time.</p>
                    <p>Thank you for booking with us!</p>
                </div>
            `,
        };

        await transporter.sendMail(mailOptions);
        return { success: true };
    } catch (error) {
        console.error('Email sending failed:', error);
        return { success: false, error: error.message };
    }
};

// Send cancellation email
exports.sendCancellationEmail = async (booking, user, movieDetails) => {
    try {
        const transporter = createTransporter();

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: user.email,
            subject: `Booking Cancelled - ${movieDetails.title}`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #EF4444;">Booking Cancelled</h2>
                    <p>Hi ${user.name},</p>
                    <p>Your booking has been cancelled successfully.</p>
                    
                    <div style="background: #F3F4F6; padding: 20px; border-radius: 8px; margin: 20px 0;">
                        <p><strong>Booking ID:</strong> ${booking.bookingId}</p>
                        <p><strong>Movie:</strong> ${movieDetails.title}</p>
                        <p><strong>Refund Amount:</strong> ₹${booking.totalPrice}</p>
                    </div>
                    
                    <p style="color: #6B7280;">The refund will be processed within 5-7 business days.</p>
                </div>
            `,
        };

        await transporter.sendMail(mailOptions);
        return { success: true };
    } catch (error) {
        console.error('Email sending failed:', error);
        return { success: false, error: error.message };
    }
};
