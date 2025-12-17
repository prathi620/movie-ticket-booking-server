const twilio = require('twilio');

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

let client = null;

// Initialize Twilio client if credentials are available
if (accountSid && authToken && twilioPhoneNumber) {
    client = twilio(accountSid, authToken);
    console.log('[SMS] Twilio client initialized');
} else {
    console.log('[SMS] Twilio credentials not configured, SMS disabled');
}

/**
 * Send booking confirmation SMS
 */
exports.sendBookingConfirmationSMS = async (phoneNumber, bookingData) => {
    try {
        if (!client) {
            console.log('[SMS] Twilio not configured, skipping SMS');
            return { success: false, error: 'SMS service not configured' };
        }

        const { bookingId, movieTitle, theaterName, showDate, showTime, seats, totalPrice } = bookingData;

        const message = `🎬 Booking Confirmed!\n\nBooking ID: ${bookingId}\nMovie: ${movieTitle}\nTheater: ${theaterName}\nDate: ${showDate}\nTime: ${showTime}\nSeats: ${seats}\nAmount: ₹${totalPrice}\n\nEnjoy your movie!`;

        const result = await client.messages.create({
            body: message,
            from: twilioPhoneNumber,
            to: phoneNumber
        });

        console.log('[SMS] Booking confirmation sent:', result.sid);
        return { success: true, messageSid: result.sid };

    } catch (error) {
        console.error('[SMS] Send error:', error.message);
        return { success: false, error: error.message };
    }
};

/**
 * Send showtime reminder SMS
 */
exports.sendShowtimeReminderSMS = async (phoneNumber, reminderData) => {
    try {
        if (!client) {
            return { success: false, error: 'SMS service not configured' };
        }

        const { movieTitle, theaterName, showDate, showTime, seats } = reminderData;

        const message = `⏰ Reminder: Your movie starts soon!\n\nMovie: ${movieTitle}\nTheater: ${theaterName}\nDate: ${showDate}\nTime: ${showTime}\nSeats: ${seats}\n\nPlease arrive 15 minutes early.`;

        const result = await client.messages.create({
            body: message,
            from: twilioPhoneNumber,
            to: phoneNumber
        });

        console.log('[SMS] Reminder sent:', result.sid);
        return { success: true, messageSid: result.sid };

    } catch (error) {
        console.error('[SMS] Reminder error:', error.message);
        return { success: false, error: error.message };
    }
};

/**
 * Send cancellation SMS
 */
exports.sendCancellationSMS = async (phoneNumber, cancellationData) => {
    try {
        if (!client) {
            return { success: false, error: 'SMS service not configured' };
        }

        const { bookingId, movieTitle, refundAmount } = cancellationData;

        const message = `❌ Booking Cancelled\n\nBooking ID: ${bookingId}\nMovie: ${movieTitle}\nRefund: ₹${refundAmount}\n\nRefund will be processed in 5-7 business days.`;

        const result = await client.messages.create({
            body: message,
            from: twilioPhoneNumber,
            to: phoneNumber
        });

        console.log('[SMS] Cancellation sent:', result.sid);
        return { success: true, messageSid: result.sid };

    } catch (error) {
        console.error('[SMS] Cancellation error:', error.message);
        return { success: false, error: error.message };
    }
};
