## This is a server on port 3000 that exposes a single endpoint /inbound



from flask import Flask, request
from twilio.twiml.messaging_response import MessagingResponse
from twilio.rest import Client
from twilio.base.exceptions import TwilioException
from twilio.lookup import TwilioLookupsClient
import os
from dotenv import load_dotenv
import ngrok

load_dotenv()

app = Flask(__name__)
port = 3000

account_sid = os.environ.get("ACCOUNT_SID")
auth_token = os.environ.get("AUTH_TOKEN")

client = Client(account_sid, auth_token)
lookup_client = TwilioLookupsClient(account_sid, auth_token)

@app.route("/inbound", methods=["POST"])
def handle_inbound():
    print("Received inbound message")
    twiml = MessagingResponse()

    from_number = request.form.get("From", "").replace("whatsapp:", "")
    
    if from_number:
        try:
            lookup = lookup_client.phone_numbers(from_number).fetch(fields="sms_pumping_risk")
            number_score = lookup.sms_pumping_risk.sms_pumping_risk_score
            twiml.message(f"Ahoy, your personal score is {number_score}")
        except TwilioException as e:
            print(f"Error fetching lookup information: {str(e)}")

    return str(twiml)

@app.route("/log", methods=["POST"])
def log():
    print("Tracked link clicked")
    return "OK"

if __name__ == "__main__":
    print("Server is running on port 3000")
    
    try:
        ngrok_tunnel = ngrok.connect(port, subdomain="mobert")
        print("Twilio webhook is live at", ngrok_tunnel.public_url)
    except Exception as e:
        print("Error while starting ngrok:", e)

    app.run(port=port)
