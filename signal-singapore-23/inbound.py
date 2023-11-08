## Using Python to create a Flask server on localhost:8080 that exposes a single endpoint /inbound
## Use ngrok to expose this server to the internet


from flask import Flask, request
from dotenv import load_dotenv
from twilio.rest import Client
from twilio.twiml.messaging_response import MessagingResponse
import ngrok
import os

load_dotenv()

app = Flask(__name__)
port = 8080

account_sid = os.getenv('TWILIO_ACCOUNT_SID')
auth_token = os.getenv('TWILIO_AUTH_TOKEN')

client = Client(account_sid, auth_token)


@app.route("/inbound", methods=['GET', 'POST'])
def singapore():
    twiml = MessagingResponse()

    from_number = request.form.get("From", "").replace("whatsapp:", "")
    lookup = client.lookups.v2.phone_numbers(from_number).fetch(fields="sms_pumping_risk")

    number_score = lookup.sms_pumping_risk.sms_pumping_risk_score
    twiml.message(f"Ahoy, your personal score is {number_score}")

    return str(twiml)


if __name__ == "__main__":
    try:
        ngrok_tunnel = ngrok.connect(port, authtoken_from_env=True, domain="ngrok.anthonydellavecchia.com")
        print("Running live at: ", ngrok_tunnel.url())
    except Exception as e:
        print("Error while starting ngrok:", e)

    app.run(host='localhost', port=port)
