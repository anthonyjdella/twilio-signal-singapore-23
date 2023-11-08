// this file is an express server on 3000 that exposes a single endpoint /inbound
// it accepts POST requests with a urlencoded body
// it returns a 200 response with a JSON body
// it uses ngrok to expose the endpoint to the internet
// it has a second endpoint /log that logs the request body to the console

const express = require('express');
const bodyParser = require('body-parser');
const ngrok = require('ngrok');
const twilio = require('twilio');
const { default: TwiML } = require('twilio/lib/twiml/TwiML');
const app = express();

const client = twilio(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN
);

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.post('/inbound', async (req, res) => {
    console.log(req.body);

    const lookup = await client.lookups.v2
        .phoneNumbers(req.body.From.replace("whatsapp:", ""))
        .fetch({ fields: ['sms_pumping_risk'] });

    const twiml = new twilio.twiml.MessagingResponse();

    const numberScore = lookup.smsPumpingRisk.sms_pumping_risk_score;
    twiml.message(`You score is ${numberScore}!`);

    res.writeHead(200, { 'Content-Type': 'text/xml' });
    res.end(twiml.toString());
});

app.post('/log', (req, res) => {
    console.log(req.body);
    res.json({ success: true });
})

const port = 3000

app.listen(port, () => {
    console.log('Server is running on port 3000');
    ngrok.connect({ port, subdomain: "mobert" }).then(ngrokUrl => {
        console.log('Twilio webhook is live at', ngrokUrl);
    }).catch(error => {
        console.error('Error while starting ngrok', error);
    });
});