const twilio = require('twilio');

const client = new twilio(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN
);

client.messages.create({
    to: process.env.DEV_PHONE,
    from: process.env.TWILIO_SENDER,
    body: "Hello, come and visit https://partycookies.store/signup",
    shortenUrls: true
}).then(message => console.log(message.sid));