/**
 * Handles all SMS operations for card authentication
 */
class CardSMSService {
    constructor(twilioConfig) {
        this.client = twilio(twilioConfig.accountSid, twilioConfig.authToken);
        this.fromNumber = twilioConfig.fromNumber;
        this.messageTemplates = {
            login: "Your card authentication code is: {{otp}}. Valid for 5 minutes. Never share this code.",
            transaction: "Verify card transaction of ${{amount}} with code: {{otp}}. Valid for 5 minutes."
        };
    }

    /**
     * Send card authentication OTP via SMS
     */
    async sendCardOTP(phoneNumber, otp, cardDetails) {
        try {
            // Verify phone number first
            const verificationCheck = await this.client.lookups.v2
                .phoneNumbers(phoneNumber)
                .fetch();

            if (!verificationCheck.valid) {
                throw new Error('Invalid phone number');
            }

            // Prepare message based on context
            const messageText = this.prepareMessage(otp, cardDetails);

            // Send with high priority routing for financial services
            const message = await this.client.messages.create({
                body: messageText,
                from: this.fromNumber,
                to: verificationCheck.phoneNumber,
                statusCallback: 'https://your-domain.com/sms/delivery-status',
                priority: 'high',
                contentRetention: 'retain',
                contentSid: 'card-auth'
            });

            // Monitor delivery
            const deliveryResult = await this.monitorDelivery(message.sid);

            return {
                success: true,
                messageId: message.sid,
                status: deliveryResult.status,
                carrier: verificationCheck.carrier,
                expiresAt: cardDetails.otpExpiresAt
            };
        } catch (error) {
            console.error('Card SMS sending failed:', error);
            throw new Error(`Failed to send authentication code: ${error.message}`);
        }
    }

    /**
     * Monitor SMS delivery status
     */
    async monitorDelivery(messageSid, attempts = 0) {
        if (attempts >= 5) return { status: 'unknown' };

        const message = await this.client.messages(messageSid).fetch();
        
        switch (message.status) {
            case 'delivered':
                return { status: 'delivered' };
            case 'failed':
            case 'undelivered':
                throw new Error(`SMS delivery failed: ${message.errorMessage}`);
            default:
                await new Promise(resolve => setTimeout(resolve, 1000));
                return this.monitorDelivery(messageSid, attempts + 1);
        }
    }

    /**
     * Prepare message text based on context
     */
    prepareMessage(otp, cardDetails) {
        const template = cardDetails.amount ? 
            this.messageTemplates.transaction : 
            this.messageTemplates.login;

        return template
            .replace('{{otp}}', otp)
            .replace('{{amount}}', (cardDetails.amount / 100).toFixed(2));
    }
}

// Example usage:
async function demonstrateCardAuthentication() {
    try {
        // Initialize services
        const otpService = new CardOTPService(process.env.OTP_SECRET_KEY);
        const smsService = new CardSMSService({
            accountSid: process.env.TWILIO_ACCOUNT_SID,
            authToken: process.env.TWILIO_AUTH_TOKEN,
            fromNumber: process.env.TWILIO_FINANCIAL_NUMBER
        });

        // Card authentication request
        const cardDetails = {
            cardLast4: '1234',
            customerId: 'CUST123',
            amount: 10000, // Optional, for transaction authentication
        };

        // Step 1: Generate OTP
        const { otp, expiresAt } = otpService.generateCardOTP(cardDetails);

        // Step 2: Send OTP via SMS
        const smsResult = await smsService.sendCardOTP(
            '+1234567890',
            otp,
            { ...cardDetails, otpExpiresAt: expiresAt }
        );
        console.log('SMS sent:', smsResult);

        // Step 3: Verify OTP (in real scenario, this would be user input)
        const isValid = otpService.verifyCardOTP(cardDetails, otp);
        console.log('OTP verification:', isValid);

    } catch (error) {
        console.error('Authentication failed:', error);
    }
}