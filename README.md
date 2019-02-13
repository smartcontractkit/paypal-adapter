# PayPal External Adapter

## How to use

* Install dependencies `npm install`

* Set up [Environment variables](#environment-variables)

* *Optional:* Run tests `npm test`. Please read [Testing](#testing) first!

* Run `createRequest()` in one of the following ways:
    * call it directly
    * use the `handler()` wrapper for AWS Lambda
    * use the `gcpservice()` wrapper for GCP

* Use one of the available [Available methods](#available-methods)
    * Set method name in `data.method`, along with method-specific parameters

To create a ZIP file to upload to AWS/GCP, run:

```bash
zip -r cl-ea.zip .
```

## Environment variables

| Variable      |               | Description | Example |
|---------------|:-------------:|------------- |:---------:|
| `MODE`     | *Optional*  | `LIVE` or `SANDBOX` | `SANDBOX` |
| `CLIENT_ID`  | **Required**  | Your PayPal Client ID | `EBWKjlELKMYqRNQ6sYvFo64FtaRLRR5BdHEESmha49TM` |
| `CLIENT_SECRET`  | **Required**  | Your PayPal Client Secret | `EO422dn3gQLgDbuwqTjzrFgFtaRLRR5BdHEESmha49TM` |

To get PayPal developer credentials, please check out https://developer.paypal.com/.

## Testing

Before you start testing, make sure you have necessary PayPal developer credentials set up.
Set the `MODE` env variable to `sandbox`.

In order to test sending payouts, make sure your facilitator account is funded.
Also make sure you are sending in the default currency of your account.
Receiver should be your "buyer" account.
These env vars can be set with `TEST_CURRENCY` and `TEST_RECEIVER`.

To test the getPayout method with another payout other than the one created in the test, set the `TEST_PAYOUT_ID` env var.

## Available methods

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
