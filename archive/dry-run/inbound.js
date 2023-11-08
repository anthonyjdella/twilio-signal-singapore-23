// This file uses express to expose a webhook with ngrok that returns a twiml messaging response
// It also parses the json body of the request
// it also initialized the twilio client and does a lookup on the incoming phone number to get the SMS pumping risk score
// the server also has a second endpoint that logs the request body to the console

const express = require('express');
const twilio = require('twilio');
const ngrok = require('ngrok');
const bodyParser = require('body-parser');
require("dotenv").config();

const app = express();
const port = 3000;

const client = twilio(process.env.ACCOUNT_SID, process.env.AUTH_TOKEN);

app.use(bodyParser.urlencoded({ extended: false }));

app.all('/inbound', async (req, res) => {
    console.log('Received inbound message');
    const twiml = new twilio.twiml.MessagingResponse();

    if (req.body.From) {
        const lookup = await client.lookups.v2.phoneNumbers(req.body.From.replace("whatsapp:","")).fetch({ fields: 'sms_pumping_risk' });
        
        const numberScore = lookup.smsPumpingRisk.sms_pumping_risk_score;

        twiml.message(`Ahoy, your personal score is ${numberScore}`);
    }
    res.writeHead(200, { 'Content-Type': 'text/xml' });
    res.end(twiml.toString());
});

app.post('/log', (req, res) => {
    // console.log(req.body);
    console.log("tracked link clicked")
    res.sendStatus(200);
});

app.listen(port, () => {
    console.log('Server is running on port 3000');
    ngrok.connect({ port, subdomain: "mobert" }).then(ngrokUrl => {
        console.log('Twilio webhook is live at', ngrokUrl);
    }).catch(error => {
        console.error('Error while starting ngrok', error);
    });
});