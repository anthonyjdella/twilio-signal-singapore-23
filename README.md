# Twilio SIGNAL Singapore 2023 Developer Track

These are code snippets for demos presented during the Developer Track at [SIGNAL Singapore 2023](https://signal.twilio.com/2023/singapore).


## Presentation Prep

1. Open the [Deck](https://docs.google.com/presentation/d/15kUrOvhqseMp2Nk7Nlmw9TGIHNrXIHj55Kk360_N9K0/edit?usp=sharing)
2. Complete below [setup](#Setup) and make sure **Virtual Environment is active**
3. Open Console -> Messaging Service **Leao DEMO** configure the **Integration**
    - Then show **SMS Pumping Protection** in General Settings
    - Then show **Quick Replies** in Content Template Builder
4. Open Console -> Messaging Service **Signal Singapore 23** configure the **Link Shortening**
    - Open the **Admin Console** and show a domain
5. Open screenshot of DNS settings in **Namecheap**
6. Open **Dev Phone**
7. Open [partycookies.store/signup](partycookies.store/signup)
    - Show the code in **signupActions.ts**
8. Open [partycookies.store/management](partycookies.store/management)
    - Show the code in **sendAction.ts**


## Setup

2. `cd signal-singapore-23`
3. `python3 -m venv venv`
4. `source venv/bin/activate`
5. `pip3 install Flask twilio python-dotenv ngrok`
    OR
    `pip3 install -r requirements.txt`
6. `pip3 freeze > requirements.txt`


## Ngrok Setup

1. `ngrok config add-authtoken` [REPLACE WITH AUTHTOKEN](https://dashboard.ngrok.com/get-started/your-authtoken)

| `ngrok http --region=us --hostname=ngrok.anthonydellavecchia.com 8080`

## Dev Phone Setup

1. `twilio phone-numbers:list`
2. `twilio login`
3. `twilio profiles:use PROFILE_ID`
4. `twilio plugins:install @twilio-labs/plugin-dev-phone`
5. `twilio dev-phone`
6. Dev Phone Number **+12286788904** - Using Leao-Demo account
7. From Phone Number **+18882942698** - Using Signal Singapore 2023 account


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
    - Within `/inbound`, create a TwiML object using `twiml = MessagingResponse()` this is going to be part of the response for this webhook
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
- This is our **Sender Pool** with a WhatsApp number already added as a Sender
    - Open QR Code Generator Chrome extension and enter `https://wa.me/WHATSAPP-SENDER?text=What%20is%20my%20risk%20score?`
- Additionally, if you want to be more hands-off, you can use SMS Pumping Protection by enabling it in the Console
    - [Messaging->General->Settings](https://console.twilio.com/us1/develop/sms/settings/general)

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


    @app.route("/inbound", methods=['POST'])
    def singapore():
        twiml = MessagingResponse()

        from_number = request.values.get("From").replace("whatsapp:", "")
        lookup = client.lookups.v2.phone_numbers(from_number).fetch(fields="sms_pumping_risk")

        number_score = lookup.sms_pumping_risk['sms_pumping_risk_score']
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


## Demo Link Shortening

- Let me quickly show you the Content Template Builder in the Console.
    - [https://console.twilio.com/us1/develop/sms/content-template-builder](https://console.twilio.com/us1/develop/sms/content-template-builder)
    - This is what we mean by Quick Reply buttons and other Content Types
- Back in our editor, let's create `link_shortener.py`
    - We will send a message using a Shortened Link
    - For the Account Sid and Auth Token, `ALT_TWILIO_ACCOUNT_SID` `ALT_TWILIO_AUTH_TOKEN`
    - The from number is `ALT_TWILIO_NUMBER`
    - The to number is `DEV_NUMBER`
    - In the body, add the link `https://partycookies.store/signup`
    - Add `shorten_urls=True`
- In the Console, go to Link Shortening and add a Domain.
    - Enter in your domain name i.e.`link.anthonydellavecchia.com`
    - Open Namecheap and go to your **Advanced DNS** settings
        - Add a `TXT Record` with host `_twilio.link` `PASTE_THE_ACCESS_TOKEN_FROM_CONSOLE`
- In the Console, add DNS Records to Namecheap
    - Use the **subdomain option** and **CNAME**
    - In Namecheap, `CNAME RECORD` with host `link` `PASTE_SUBDOMAIN_RECORD_FROM_CONSOLE`

<details>
    <summary>Code Snippet for Link Shortening</summary>

    from dotenv import load_dotenv
    from twilio.rest import Client
    import os

    load_dotenv()

    account_sid = os.getenv('ALT_TWILIO_ACCOUNT_SID')
    auth_token = os.getenv('ALT_TWILIO_AUTH_TOKEN')

    client = Client(account_sid, auth_token)


    client.messages.create(
        from_=os.getenv('ALT_MSG_SERVICE'),
        to=os.getenv('DEV_NUMBER'),
        body="Welcome to SIGNAL Singapore 🇸🇬 🏙️ https://partycookies.store/signup",
        shorten_urls=True
    )

</details>


## Demo Link Tracking
- Let's go back to the file `inbound.py` and track logs for when users click on our link

<details>
    <summary>Code Snippet for Link Tracking</summary>

    import json

    @app.route('/log', methods=['GET', 'POST'])
    def log():
        data = request.json
        print(json.dumps(data, indent=2))
        return "OK", 200

</details>