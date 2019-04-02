import * as paypal from "paypal-rest-sdk";

export type reqData = {
    method: string | undefined,
    amount: number | string | undefined,
    currency: string | undefined,
    receiver: string | undefined,
    payout_id: string | undefined,
    email_subject: string | undefined,
    email_message: string | undefined,
    recipient_type: string | undefined,
    note: string | undefined,
    sender_item_id: string | undefined,
    type: string | undefined,
}

paypal.configure({
    "mode": process.env.MODE || "live",
    "client_id": process.env.CLIENT_ID,
    "client_secret": process.env.CLIENT_SECRET
});

const sendPayout = (data: reqData, callback: { (statusCode: number, msg: string): void }) => {
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

    paypal.payout.create(payoutItem, true, (error: any, payout: any) => {
        if (error) return callback(error.httpStatusCode, error);
        return callback(payout.httpStatusCode, payout)
    })
};

const getPayout = (data: reqData, callback: { (statusCode: number, msg: any): void }) => {
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

    request.get(data.payout_id, (error: any, payout: any) => {
        if (error) return callback(error.httpStatusCode, error);
        return callback(payout.httpStatusCode, payout);
    })
};

export const createRequest = (input: any = {}, callback: { (statusCode: number, data: any): void } = () => {
}) => {
    let action;
    const data = <reqData>input.data;
    const method = process.env.API_METHOD || data.method || "";
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

    action(data, (statusCode, data) => {
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
export const gcpservice = async (req: any = {}, res: any): Promise<any> => {
    createRequest(req.body, (statusCode, data) => {
        res.status(statusCode).send(data);
    });
};

// createRequest() wrapper for AWS Lambda
export const handler = async (
    event: any = {},
    context: any = {},
    callback: { (error: any, result: any): void }): Promise<any> => {
    createRequest(event, (statusCode, data) => {
        callback(null, data);
    });
};
