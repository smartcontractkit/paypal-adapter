const paypal = require('paypal-rest-sdk');

paypal.configure({
    "mode": process.env.MODE || "live",
    "client_id": process.env.CLIENT_ID,
    "client_secret": process.env.CLIENT_SECRET
});

const sendPayout = (data, callback) => {
    if (!('amount' in data) || !('receiver' in data)) {
        return callback(400, "missing required parameters")
    }
    
    let sender_batch_id = Math.random().toString(36).substring(9);
    let payoutItem = {
        "sender_batch_header": {
            "sender_batch_id": sender_batch_id,
            "email_subject": data.email_subject || "",
            "email_message": data.email_message || "",
        },
        "items": [
            {
                "recipient_type": data.recipient_type || "EMAIL",
                "amount": {
                    "value": data.amount,
                    "currency": data.currency || "USD"
                },
                "receiver": data.receiver,
                "note": data.note || "",
                "sender_item_id": data.sender_item_id || ""
            }
        ]
    };

    paypal.payout.create(payoutItem, true, (error, payout) => {
        if (error) return callback(error.httpStatusCode, error);
        return callback(payout.httpStatusCode, payout)
    })
};

const getPayout = (data, callback) => {
    if (!('payout_id' in data)) {
        return callback(400, "missing required parameters")
    }

    let type = data.type || "batch";
    let request;
    switch (type.toLowerCase()) {
        case "item":
            request = paypal.payoutItem;
            break;
        case "batch":
            request = paypal.payout;
            break;
        default:
            return callback(400, "invalid method")
    }

    request.get(data.payout_id, (error, payout) => {
        if (error) return callback(error.httpStatusCode, error);
        return callback(payout.httpStatusCode, payout);
    })
};

const createRequest = (input, callback) => {
    let action;
    const method = process.env.API_METHOD || input.data.method || "";
    switch (method.toLowerCase()) {
        case "sendpayout":
            action = sendPayout;
            break;
        case "getpayout":
            action = getPayout;
            break;
        default:
            return callback(400, {
                jobRunID: input.id,
                status: "errored",
                error: "Invalid method",
                statusCode: 400
            })
    }

    action(input.data, (statusCode, data) => {
        if (statusCode < 200 || statusCode >= 300) {
            return callback(statusCode, {
                jobRunID: input.id,
                status: "errored",
                error: data,
                statusCode: statusCode
            })
        }

        data.result = data.batch_header.payout_batch_id || "";
        return callback(statusCode, {
            jobRunID: input.id,
            data: data,
            statusCode: statusCode
        })
    })
};

// createRequest() wrapper for GCP
exports.gcpservice = (req, res) => {
    createRequest(req.body, (statusCode, data) => {
        res.status(statusCode).send(data);
    });
};

// createRequest() wrapper for AWS Lambda
exports.handler = (event, context, callback) => {
    createRequest(event, (statusCode, data) => {
        callback(null, data);
    });
};

// Used for testing
module.exports.createRequest = createRequest;
