const twilio = require('twilio');

const client = twilio(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN
);

client.messages.create({
    to: process.env.DEV_PHONE,
    from: process.env.TWILIO_SENDER,
    shortenUrls: true,
    body: "Hi, check out this page https://partycookies.store/signup?param=1234456789876545678987654345678987654345678"
}).then(message => console.log(message.sid));