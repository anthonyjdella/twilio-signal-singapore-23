// this file is a server that exposes one endpoint /inbound 
// it accepts a POST request with a url form encoded body
// it provides a /log endpoint that logs the body of the request
// it run on port 3000
// it also uses ngrok to expose the server to the internet

const express = require('express');
const bodyParser = require('body-parser');
const ngrok = require('ngrok');
const twilio = require('twilio');

const client = twilio(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN
);


const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.post('/inbound', async (req, res) => {
    const twiml = new twilio.twiml.MessagingResponse();
    console.log("incoming")
    const lookup = await client.lookups.v2
        .phoneNumbers(req.body.From.replace("whatsapp:", ""))
        .fetch({ fields: ['sms_pumping_risk'] });


    const numberScore = lookup.smsPumpingRisk.sms_pumping_risk_score;

    twiml.message(`Your number score is ${numberScore}`)
    res.set('Content-Type', 'text/xml');
    res.send(twiml.toString());
});

app.all('/log', (req, res) => {
    console.log(req.body);
    res.send();
});

app.listen(3000, () => {
    console.log('server listening on port 3000');
    ngrok.connect({ port: 3000, subdomain: "mobert" }).then(url => {
        console.log(`ngrok url: ${url}/inbound`);
    });
})