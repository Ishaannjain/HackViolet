const express = require('express');
const router = express.Router();
const CardOTPService = require('../services/card-auth/CardOTPService');
const CardSMSService = require('../services/card-auth/CardSMSService');

const otpService = new CardOTPService(process.env.OTP_SECRET_KEY);
const smsService = new CardSMSService({
    accountSid: process.env.TWILIO_ACCOUNT_SID,
    authToken: process.env.TWILIO_AUTH_TOKEN,
    fromNumber: process.env.TWILIO_FINANCIAL_NUMBER
});

router.post('/authenticate', async (req, res) => {
    try {
        const { phoneNumber, cardLast4, customerId, amount } = req.body;

        const cardDetails = {
            cardLast4,
            customerId,
            amount
        };

        const { otp, expiresAt } = otpService.generateCardOTP(cardDetails);

        const smsResult = await smsService.sendCardOTP(
            phoneNumber,
            otp,
            { ...cardDetails, otpExpiresAt: expiresAt }
        );

        res.json({
            success: true,
            message: 'Authentication code sent',
            expiresAt,
            ...smsResult
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
});

router.post('/verify', (req, res) => {
    try {
        const { otp, cardLast4, customerId } = req.body;

        const isValid = otpService.verifyCardOTP({ cardLast4, customerId }, otp);

        res.json({
            success: true,
            valid: isValid
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
});

module.exports = router;