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
