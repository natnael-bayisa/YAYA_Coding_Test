# YaYa Wallet Webhook Receiver

## Overview

This project implements a **secure webhook endpoint** for YaYa Wallet.

## Setup

This project simulates YaYa webhook events and validates them with HMAC signatures, replay protection, IP verification, and rate limiting.

## Setup

1. Clone the project and install dependencies:

```bash
git clone https://github.com/natnael-bayisa/yaya_webhook
cd yaya_webhook
npm install
```

Running the Project

Open two separate terminal windows in the project folder.

Terminal 1: Run the server
npm run dev

Terminal 2: Run the autoWebhookTestLoop.js
This will generate payloads and print the YAYA-SIGNATURE for each event with a response:
Response: { message: 'Event received' }

Testing with Postman

Open Postman.

Create a POST request to:
http://localhost:8080/webhooks/yaya

3. In the Body tab, select raw → JSON, and paste a payload similar to the one printed by autoWebhookTestLoop.js:

{
"id": "evt_476832",
"event": "transaction.completed",
"timestamp": 1756018554,
"createdAt": "2025-08-24T06:55:54.768Z",
"data": {
"amount": 757,
"currency": "ETB",
"cause": "Testing",
"full_name": "Abebe Kebede",
"account_name": "abebekebede1",
"invoice_url": "https://yayawallet.com/en/invoice/xxxx"
}
}

4. In the Headers tab, add:
   Content-Type: application/json
   YAYA-SIGNATURE: <the HMAC signature you got from autoWebhookTestLoop.js>

Send the request.

- If the same event ID is sent again, you will see: "Duplicate ignored".

- If you send more than 5 requests per minute, you will get: "Too many requests, please try again later." because the rate limiter is set to 5 requests per minute.

Running Automated Tests

The project includes Jest tests for webhook verification. To run:

- npx jest tests/webhook.test.js

Notes

- The webhook server verifies the HMAC signature to ensure payload integrity.

- Replay protection ignores duplicate events within 5 minutes (REPLAY_TOLERANCE_SECONDS=300).

- Only requests from trusted IPs are accepted if TRUSTED_YAYA_IPS is set.

- Rate limiter prevents more than 5 requests per minute per IP for security.

- Always update the JSON payload from autoWebhookTestLoop.js to get a valid signature.

- The included .env file in this repository is for demonstration and simplicity; update sensitive values as needed.
