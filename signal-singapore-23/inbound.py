## Using Python to create a Flask server on localhost:8080 that exposes a single endpoint /inbound


from flask import Flask, request
from twilio.twiml.messaging_response import MessagingResponse
from twilio.rest import Client
from twilio.base.exceptions import TwilioException
import os
from dotenv import load_dotenv
import ngrok

load_dotenv()

app = Flask(__name__)
port = 8080


@app.route("/inbound", methods=['GET', 'POST'])
def test():
    return "Ahoy, World"


if __name__ == "__main__":
    try:
        ngrok_tunnel = ngrok.connect(port, authtoken_from_env=True, domain="ngrok.anthonydellavecchia.com")
        print("Running live at: ", ngrok_tunnel.url())
    except Exception as e:
        print("Error while starting ngrok:", e)

    app.run(host='localhost', port=port)
