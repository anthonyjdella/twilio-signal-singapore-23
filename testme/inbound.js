// this fils is a web server that listens for incoming requests on port 3000
// it exposes and endpoint /incoming that accepts POST requests with JSON payloads
// there is another endpoint /clicktrack that log the click event to the console
// it uses ngrok to expose the web server to the internet


const express = require('express');
const bodyParser = require('body-parser');
const ngrok = require('ngrok');
const twilio = require('twilio');
const app = express();
const port = 3000;

const client = new twilio(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN
);

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use("/incoming", async (req, res) => {
    console.log("incoming request");
    const twiml = new twilio.twiml.MessagingResponse();
    const phone = req.body?.From?.replace("whatsapp:", "");
    if (phone) {
        const lookup = await client.lookups.v2.phoneNumbers(phone).fetch({ fields: ["sms_pumping_risk"] });
        twiml.message(`Your risk is ${lookup.smsPumpingRisk.sms_pumping_risk_score}`)
    } else {
        twiml.message("Hello from Mobert!");
    }

    res.set("Content-Type", "text/xml");
    res.send(twiml.toString());
});
app.use("/clicktrack", (req, res) => {
    console.log(req.body);
    console.log("clicktrack request");
    res.send("ok");
});

app.listen(port, () => {
    console.log(`Example app listening on port ${port}!`)
    ngrok.connect({ port, subdomain: "mobert" }).then(url => {
        console.log(`ngrok forwarding to ${url}/incoming`);
    });
});