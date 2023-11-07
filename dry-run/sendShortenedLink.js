// script sending a sms message to the dev phone number with a shortened link


const twilio = require('twilio');
require("dotenv").config();

const client = twilio(process.env.ACCOUNT_SID, process.env.AUTH_TOKEN);

client.messages.create({
    body: 'Hello there! This is a link https://docs.google.com/presentation/d/1Gm58lBisv7aa6_3zEonDa_UTPDjmp1XhfC698Omx4jk/edit#slide=id.g24dce7d0500_0_762',
    shortenUrls: true,
    from: process.env.TWILIO_SENDER,
    to: process.env.DEV_PHONE
}).then(message => console.log(message.sid));
