require('dotenv').config();
const twilio = require('twilio');

class CardSMSService {
    constructor() {
        this.client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
        this.fromNumber = process.env.TWILIO_FINANCIAL_NUMBER;
        this.messageTemplates = {
            login: "Your card authentication code is: {{otp}}. Valid for 5 minutes. Never share this code.",
            transaction: "Verify card transaction of ${{amount}} with code: {{otp}}. Valid for 5 minutes."
        };
    }

    async sendCardOTP(phoneNumber, otp, cardDetails) {
        try {
            const messageText = this.prepareMessage(otp, cardDetails);

            const message = await this.client.messages.create({
                body: messageText,
                from: this.fromNumber,
                to: phoneNumber,
            });

            return {
                success: true,
                messageId: message.sid,
                status: 'queued', // Since this is using Twilio test credentials, messages won't actually be sent
                carrier: "Twilio Test Carrier",
                expiresAt: cardDetails.otpExpiresAt
            };
        } catch (error) {
            console.error('Card SMS sending failed:', error);
            throw new Error(`Failed to send authentication code: ${error.message}`);
        }
    }

    prepareMessage(otp, cardDetails) {
        const template = cardDetails.amount ? 
            this.messageTemplates.transaction : 
            this.messageTemplates.login;

        return template
            .replace('{{otp}}', otp)
            .replace('{{amount}}', (cardDetails.amount / 100).toFixed(2));
    }
}

module.exports = CardSMSService;
