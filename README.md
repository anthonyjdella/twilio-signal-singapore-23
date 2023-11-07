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


## Demo

1. I've got a file called `inbound.py`
    - We are using Python and creating a Flask server on [localhost:8080](http://localhost:8080)
    - We are importing `modules` from `libraries`
    - We've created an endpoint called `/inbound` and for now, we are returning `Ahoy World`
    - We are running this app locally on
    **[localhost:8080/inbound](http://localhost:8080/inbound)**
    - We are using ngrok to create a tunnel to
    **[ngrok.anthonydellavecchia.com/inbound](ngrok.anthonydellavecchia.com/inbound)**

<details>
    <summary>Code Snippet</summary>
    
    ```
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
    ```

</details>