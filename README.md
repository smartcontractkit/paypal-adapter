# PayPal External Adapter

## How to use

* Install dependencies `yarn install`

* Build TypeScript files `yarn build`

* Set up [Environment variables](#environment-variables)

* *Optional:* Run tests `yarn test`. Please read [Testing](#testing) first!

* Run this adapter using a serverless provider:
    * use the `handler()` wrapper for AWS Lambda
    * use the `gcpservice()` wrapper for GCP

* Use one of the available [Available methods](#available-methods)
    * Set method name in `data.method`, along with method-specific parameters

To create a ZIP file to upload to AWS/GCP, run:

```bash
zip -r cl-ea.zip .
```

## Run with Docker

```bash
docker build . -t paypal-adapter
docker run -d \
    -p 8080:8080 \
    -e EA_PORT=8080 \
    -e CLIENT_ID="Your_client_id" \
    -e CLIENT_SECRET="Your_client_secret" \
    paypal-adapter
```

## Environment variables

| Variable      |               | Description | Example |
|---------------|:-------------:|------------- |:---------:|
| `MODE`     | *Optional*  | `LIVE` or `SANDBOX` | `SANDBOX` |
| `CLIENT_ID`  | **Required**  | Your PayPal Client ID | `EBWKjlELKMYqRNQ6sYvFo64FtaRLRR5BdHEESmha49TM` |
| `CLIENT_SECRET`  | **Required**  | Your PayPal Client Secret | `EO422dn3gQLgDbuwqTjzrFgFtaRLRR5BdHEESmha49TM` |
| `API_METHOD` | *Optional* | Set a specific method to use for this adapter. Overwrites `method` in request body. | `sendPayout` |

To get PayPal developer credentials, please check out https://developer.paypal.com/.

## Testing

Before you start testing, make sure you have necessary PayPal developer credentials set up.
Set the `MODE` env variable to `sandbox`.

In order to test sending payouts, make sure your facilitator account is funded.
Also make sure you are sending in the default currency of your account.
Receiver should be your "buyer" account.
These env vars can be set with `TEST_CURRENCY` and `TEST_RECEIVER`, as well as `TEST_AMOUNT`.

To test the getPayout method with another payout other than the one created in the test, set the `TEST_PAYOUT_ID` env var.

## Available methods

Method can be specified by the `method` key in the request body or the `API_METHOD` environment variable. If the 
environment variable is set, it takes precedence over the method specified in the request body.

### sendPayout

Send a payout with the Payouts API.

#### Request

| Variable | Type |   | Description |
|----------|------|---|-------------|
| `amount` | Integer, decimal | **Required** | Amount to send. Please refer to the [PayPal docs](https://developer.paypal.com/docs/api/payments.payouts-batch/v1/#definition-currency). |
| `currency` | String | *Optional* | Three-character ISO-4217 currency code. Defaults to `USD`. Please refer to the [full list of available currencies](https://developer.paypal.com/docs/integration/direct/rest/currency-codes/). |
| `receiver` | String | **Required** | Receiver of the payout |
| `recipient_type` | String | *Optional* | The type of `receiver`. Can be one of `EMAIL`, `PHONE` and `PAYPAL_ID`. Defaults to `EMAIL`. |
| `note` | String | *Optional* | Custom note for this payout |
| `sender_item_id` | String | *Optional* | Custom sender-specified ID for this payout |
| `email_subject` | String | *Optional* | Custom email subject for the payment notification |
| `email_message` | String | *Optional* | Custom email message for the payment notification |

Please refer to the PayPal docs for more information on each parameter: https://developer.paypal.com/docs/api/payments.payouts-batch/v1/#payouts_create

#### Response

```json
{  
  "result":"5UXD2E8A7EBQJ",
   "batch_header":{  
      "sender_batch_header":{  
         "sender_batch_id":"Payouts_2018_100008",
         "email_subject":"You have a payout!",
         "email_message":"You have received a payout! Thanks for using our service!"
      },
      "payout_batch_id":"5UXD2E8A7EBQJ",
      "batch_status":"PENDING"
   }
}
```

### getPayout

Get details on a payout.

#### Request

| Variable | Type |   | Description |
|----------|------|---|-------------|
| `type` | String | *Optional* | Type of payout to look up. One of `ITEM` and `BATCH`. Defaults to `BATCH`. |
| `payout_id` | String | **Required** | Payout item ID to look up |

Please refer to the PayPal docs for more information on each parameter: https://developer.paypal.com/docs/api/payments.payouts-batch/v1/#payouts_create

#### Response

```json
{  
   "result":"5UXD2E8A7EBQJ",
   "batch_header":{  
      "sender_batch_header":{  
         "sender_batch_id":"Payouts_2018_100008",
         "email_subject":"You have a payout!",
         "email_message":"You have received a payout! Thanks for using our service!"
      },
      "payout_batch_id":"5UXD2E8A7EBQJ",
      "batch_status":"PENDING"
   }
}
```

## Disclaimer

In order to use this adapter, you will need to create an account with and obtain credentials from PayPal and agree to and comply with PayPal’s applicable terms, conditions and policies.  In no event will SmartContract Chainlink Limited SEZC be liable for your or your user’s failure to comply with any or all of PayPal’s terms, conditions or policies or any other applicable license terms.
