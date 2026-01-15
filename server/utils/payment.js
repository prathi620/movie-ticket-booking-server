// Payment Implementation (Stripe + Mock Fallback)
const Stripe = require('stripe');
const stripe = process.env.STRIPE_SECRET_KEY ? Stripe(process.env.STRIPE_SECRET_KEY) : null;

// Create Payment Intent
exports.createPaymentIntent = async (amount, bookingId) => {
    console.log(`[Payment] Creating intent for Booking ${bookingId}, Amount: ${amount}`);

    if (stripe) {
        try {
            const paymentIntent = await stripe.paymentIntents.create({
                amount: Math.round(amount * 100), // Stripe expects cents
                currency: 'inr',
                metadata: { bookingId },
                automatic_payment_methods: {
                    enabled: true,
                },
            });

            return {
                success: true,
                clientSecret: paymentIntent.client_secret,
                paymentIntentId: paymentIntent.id
            };
        } catch (error) {
            console.error('Stripe Error:', error);
            return { success: false, error: error.message };
        }
    } else {
        // Mock Implementation
        console.log('[Payment] Using Mock Payment (No Stripe Key)');
        await new Promise(resolve => setTimeout(resolve, 1000));
        return {
            success: true,
            clientSecret: `mock_secret_${bookingId}_${Date.now()}`,
            paymentIntentId: `mock_pi_${bookingId}_${Date.now()}`
        };
    }
};

// Verify Payment
exports.verifyPayment = async (paymentIntentId) => {
    console.log(`[Payment] Verifying payment: ${paymentIntentId}`);

    if (stripe && !paymentIntentId.startsWith('mock_')) {
        try {
            const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
            if (paymentIntent.status === 'succeeded') {
                return { success: true, status: 'succeeded', amount: paymentIntent.amount / 100 };
            }
            return { success: false, status: paymentIntent.status };
        } catch (error) {
            return { success: false, error: error.message };
        }
    } else {
        // Mock Verification
        await new Promise(resolve => setTimeout(resolve, 500));
        return {
            success: true,
            status: 'succeeded',
            amount: 0
        };
    }
};

// Create Refund
exports.createRefund = async (paymentIntentId, amount) => {
    console.log(`[Payment] Refunding payment: ${paymentIntentId}, Amount: ${amount}`);

    if (stripe && !paymentIntentId.startsWith('mock_')) {
        try {
            const refund = await stripe.refunds.create({
                payment_intent: paymentIntentId,
            });
            return { success: true, refundId: refund.id, status: refund.status };
        } catch (error) {
            return { success: false, error: error.message };
        }
    } else {
        await new Promise(resolve => setTimeout(resolve, 1000));
        return {
            success: true,
            refundId: `mock_refund_${paymentIntentId}`,
            status: 'refunded'
        };
    }
};
