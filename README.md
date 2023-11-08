# Twilio SIGNAL Singapore 2023 Developer Track

These are code snippets for demos presented during the Developer Track at [SIGNAL Singapore 2023](https://signal.twilio.com/2023/singapore).


## Setup

1. `cd Singapore-23`
2. `python3 -m venv .venv`
3. `source .venv/bin/activate`
4. `pip install Flask twilio python-dotenv ngrok`
    OR
    `pip install -r requirements.txt`
5. `pip freeze > requirements.txt`


## Ngrok Setup

1. `ngrok config add-authtoken` [REPLACE WITH AUTHTOKEN](https://dashboard.ngrok.com/get-started/your-authtoken)


## Demo Web Server

- I've got a file called `inbound.py`
    - We are using Python and creating a Flask server on [localhost:8080](http://localhost:8080)
    - We will also use `ngrok` to expose the Flask server to the internet
    - We are importing `modules` from `libraries`
    - We've created an endpoint called `/inbound` and for now, we are returning `Ahoy World`
    - We are running this app locally on
    **[localhost:8080/inbound](http://localhost:8080/inbound)**
    - We are using ngrok to create a tunnel to
    **[ngrok.anthonydellavecchia.com/inbound](ngrok.anthonydellavecchia.com/inbound)**

<details>
    <summary>Code Snippet for Web Server</summary>

    from flask import Flask
    from dotenv import load_dotenv
    import ngrok

    load_dotenv()

    app = Flask(__name__)
    port = 8080


    @app.route("/inbound", methods=['GET', 'POST'])
    def singapore():
        return "Ahoy, World"


    if __name__ == "__main__":
        try:
            ngrok_tunnel = ngrok.connect(port, authtoken_from_env=True, domain="ngrok.anthonydellavecchia.com")
            print("Running live at: ", ngrok_tunnel.url())
        except Exception as e:
            print("Error while starting ngrok:", e)

        app.run(host='localhost', port=port)

</details>


## Demo Risk Score

- Now that our application is running, we want it to handle incoming messages. Whenever we receive a message, we want to print out that number's **RISK SCORE**
    - Let's add our Twilio Account SID and Auth Token using `os.getenv('')`
        - `import os` for `.env` variables
    - Initialize a Twilio client, `client = Client(account_sid, auth_token)`
        - `from twilio.rest import Client`
    - Within `/inbound`, create a TwiML object using `twiml = MessagingResponse()`
        - `from twilio.twiml.messaging_response import MessagingResponse`
    - Get the phone number of the sender and remove the WhatsApp prefix `from_number = request.form.get("From", "").replace("whatsapp:", "")`
        - Needs the request module: `from flask import Flask, request`
    - Use the Lookup API to fetch the SMS Pumping Risk field
        - `lookup = client.lookups.v2.phone_numbers(from_number).fetch(fields="sms_pumping_risk")`
    - Get the Risk score from the lookup object `number_score = lookup.sms_pumping_risk.sms_pumping_risk_score`
    - Create a message, passing in the score `twiml.message(f"Ahoy, your personal score is {number_score}")`
    - Return the TwiML as a String `return str(twiml)`
- Open [Messaging Service in Console](https://console.twilio.com/us1/service/sms/MG24e593711be6a8813ce4e12e445d46fe/sms-service-instance-configure?frameUrl=%2Fconsole%2Fsms%2Fservices%2FMG24e593711be6a8813ce4e12e445d46fe%3Fx-target-region%3Dus1)
    - **Integration** tab
    - Add `https://ngrok.anthonydellavecchia.com/inbound` as Webhook URL

<details>
    <summary>Code Snippet for Risk Score</summary>

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

</details>