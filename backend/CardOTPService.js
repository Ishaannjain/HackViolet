require('dotenv').config();
const crypto = require('crypto');

class CardOTPService {
    constructor() {
        this.secretKey = process.env.OTP_SECRET_KEY || "default_secret_key";
        this.attempts = new Map();
        this.otpWindowSeconds = 300; // 5 minutes
    }

    generateCardOTP(cardDetails) {
        const timestamp = Math.floor(Date.now() / (this.otpWindowSeconds * 1000));
        const message = `${cardDetails.cardLast4}:${cardDetails.customerId}:${timestamp}`;
        
        const hmac = crypto.createHmac('sha256', this.secretKey);
        hmac.update(message);
        const hmacResult = hmac.digest();

        const otpNumber = parseInt(hmacResult.toString('hex'), 16) % 1000000;
        
        return {
            otp: otpNumber.toString().padStart(6, '0'),
            expiresAt: new Date(Date.now() + (this.otpWindowSeconds * 1000))
        };
    }

    verifyCardOTP(cardDetails, providedOTP) {
        if (this.isRateLimited(cardDetails.customerId)) {
            throw new Error('Too many verification attempts. Please wait 1 hour.');
        }

        const currentOTP = this.generateCardOTP(cardDetails).otp;
        const timestamp = Math.floor(Date.now() / (this.otpWindowSeconds * 1000)) - 1;
        const previousOTP = this.generateCardOTP({...cardDetails, timestamp}).otp;

        this.recordAttempt(cardDetails.customerId);

        return providedOTP === currentOTP || providedOTP === previousOTP;
    }

    isRateLimited(customerId) {
        const attempts = this.attempts.get(customerId) || [];
        const recentAttempts = attempts.filter(
            timestamp => timestamp > Date.now() - 3600000
        );
        return recentAttempts.length >= 3;
    }

    recordAttempt(customerId) {
        const attempts = this.attempts.get(customerId) || [];
        attempts.push(Date.now());
        this.attempts.set(customerId, attempts);
    }
}

module.exports = CardOTPService;
