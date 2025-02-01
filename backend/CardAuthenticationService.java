const crypto = require('crypto');

class CardAuthenticationService {
    constructor(twilioConfig, secretKey) {
        // Initialize the OTP generator
        this.otpGenerator = new TransactionOTPGenerator(secretKey);
        
        // Initialize the SMS service
        this.smsService = new FinancialSMSService(
            twilioConfig.accountSid,
            twilioConfig.authToken,
            twilioConfig.fromNumber
        );
        
        // Store attempts to prevent brute force
        this.attempts = new Map();
    }

    /**
     * Process card authentication request
     * @param {Object} cardDetails - Card and transaction details
     * @param {string} phoneNumber - Customer's phone number
     * @returns {Promise} Authentication process result
     */
    async initiateAuthentication(cardDetails, phoneNumber) {
        try {
            // Validate rate limiting
            if (this.isRateLimited(phoneNumber)) {
                throw new Error('Too many attempts. Please try again later.');
            }

            // Generate OTP
            const otp = this.otpGenerator.generateOTP(
                cardDetails.transactionId,
                cardDetails.cardLast4,
                cardDetails.amount
            );

            // Send OTP via SMS
            const smsResult = await this.smsService.sendFinancialOTP(
                phoneNumber,
                otp
            );

            if (!smsResult.success) {
                throw new Error('Failed to send authentication code');
            }

            // Store attempt
            this.recordAttempt(phoneNumber);

            return {
                success: true,
                transactionId: cardDetails.transactionId,
                messageId: smsResult.messageId,
                status: smsResult.status,
                expiresIn: '5 minutes'
            };
        } catch (error) {
            console.error('Authentication initiation failed:', error);
            throw error;
        }
    }

    /**
     * Verify the OTP provided by the user
     * @param {Object} cardDetails - Original card and transaction details
     * @param {string} userOTP - OTP provided by user
     * @returns {boolean} Verification result
     */
    verifyOTP(cardDetails, userOTP) {
        return this.otpGenerator.validateOTP(
            userOTP,
            cardDetails.transactionId,
            cardDetails.cardLast4,
            cardDetails.amount
        );
    }

    /**
     * Check if phone number is rate limited
     * @param {string} phoneNumber - Phone number to check
     * @returns {boolean} Whether rate limited
     * @private
     */
    isRateLimited(phoneNumber) {
        const attempts = this.attempts.get(phoneNumber) || [];
        const recentAttempts = attempts.filter(
            timestamp => timestamp > Date.now() - 3600000 // 1 hour window
        );
        return recentAttempts.length >= 5; // Max 5 attempts per hour
    }

    /**
     * Record authentication attempt
     * @param {string} phoneNumber - Phone number to record
     * @private
     */
    recordAttempt(phoneNumber) {
        const attempts = this.attempts.get(phoneNumber) || [];
        attempts.push(Date.now());
        this.attempts.set(phoneNumber, attempts);
    }
}

// Example usage:
async function demonstrateCardAuthentication() {
    try {
        // Configuration
        const twilioConfig = {
            accountSid: process.env.TWILIO_ACCOUNT_SID,
            authToken: process.env.TWILIO_AUTH_TOKEN,
            fromNumber: process.env.TWILIO_FINANCIAL_NUMBER
        };

        const secretKey = process.env.OTP_SECRET_KEY;

        // Initialize service
        const authService = new CardAuthenticationService(twilioConfig, secretKey);

        // Example card transaction details
        const cardDetails = {
            transactionId: `TXN${Date.now()}`,
            cardLast4: '1234',
            amount: 10000  // $100.00 in cents
        };

        // Step 1: Initiate authentication
        const authResult = await authService.initiateAuthentication(
            cardDetails,
            '+1234567890'
        );
        console.log('Authentication initiated:', authResult);

        // Step 2: Verify OTP (in real scenario, this would be user input)
        const isValid = authService.verifyOTP(cardDetails, '123456');
        console.log('OTP verification result:', isValid);

    } catch (error) {
        console.error('Authentication process failed:', error);
    }
}

// Run demonstration if needed
// demonstrateCardAuthentication().catch(console.error);