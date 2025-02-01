const crypto = require('crypto');
const twilio = require('twilio');

/**
 * Handles all OTP-related operations for card authentication
 */
class CardOTPService {
    constructor(secretKey) {
        this.secretKey = secretKey;
        this.attempts = new Map();
        this.otpWindowSeconds = 300; // 5 minutes
    }

    /**
     * Generate OTP for card authentication
     */
    generateCardOTP(cardDetails) {
        const timestamp = Math.floor(Date.now() / (this.otpWindowSeconds * 1000));
        const message = `${cardDetails.cardLast4}:${cardDetails.customerId}:${timestamp}`;
        
        // Generate HMAC
        const hmac = crypto.createHmac('sha256', this.secretKey);
        hmac.update(message);
        const hmacResult = hmac.digest();

        // Convert to 6-digit OTP
        const otpNumber = parseInt(hmacResult.toString('hex'), 16) % 1000000;
        
        return {
            otp: otpNumber.toString().padStart(6, '0'),
            expiresAt: new Date(Date.now() + (this.otpWindowSeconds * 1000))
        };
    }

    /**
     * Verify OTP for card authentication
     */
    verifyCardOTP(cardDetails, providedOTP) {
        // Check rate limiting first
        if (this.isRateLimited(cardDetails.customerId)) {
            throw new Error('Too many verification attempts. Please wait 1 hour.');
        }

        // Generate current and previous window OTPs for comparison
        const currentOTP = this.generateCardOTP(cardDetails).otp;
        const timestamp = Math.floor(Date.now() / (this.otpWindowSeconds * 1000)) - 1;
        const previousOTP = this.generateCardOTP({...cardDetails, timestamp}).otp;

        // Record verification attempt
        this.recordAttempt(cardDetails.customerId);

        return providedOTP === currentOTP || providedOTP === previousOTP;
    }

    /**
     * Check if customer is rate limited
     */
    isRateLimited(customerId) {
        const attempts = this.attempts.get(customerId) || [];
        const recentAttempts = attempts.filter(
            timestamp => timestamp > Date.now() - 3600000 // 1 hour window
        );
        return recentAttempts.length >= 3; // Max 3 attempts per hour
    }

    /**
     * Record verification attempt
     */
    recordAttempt(customerId) {
        const attempts = this.attempts.get(customerId) || [];
        attempts.push(Date.now());
        this.attempts.set(customerId, attempts);
    }
}