import * as paypal from "paypal-rest-sdk";

class Response {
    jobRunID: string;
    statusCode: number;
    status?: string;
    data?: any;
    error?: any;
}

export class JobRequest {
    id: string;
    data: Request;
}

export class Request {
    method?: string;
}

export class GetRequest extends Request {
    payout_id: string;
    type?: string;
}

export class SendRequest extends Request {
    amount: string;
    receiver: string;
    currency?: string;
    recipient_type?: string;
    note?: string;
    sender_item_id?: string;
    email_subject?: string;
    email_message?: string
}

paypal.configure({
    "mode": process.env.MODE || "live",
    "client_id": process.env.CLIENT_ID,
    "client_secret": process.env.CLIENT_SECRET
});

const sendPayout = async (data: SendRequest) => {
    return new Promise(((resolve, reject) => {
        if (!('amount' in data) || !('receiver' in data)) {
            return reject({statusCode: 400, data: "missing required parameters"});
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
            if (error) return reject({statusCode: error.httpStatusCode, data: error});
            return resolve({statusCode: payout.httpStatusCode, data: payout});
        })
    }))
};

const getPayout = async (data: GetRequest) => {
    return new Promise(((resolve, reject) => {
        if (!('payout_id' in data))
            return reject({statusCode: 400, data: "missing required parameters"});

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
                return reject({statusCode: 400, data: "invalid method"});
        }

        request.get(data.payout_id, (error: any, payout: any) => {
            if (error) return reject({statusCode: error.httpStatusCode, data: error});
            return resolve({statusCode: payout.httpStatusCode, data: payout});
        })
    }))
};

export const createRequest = async (input: JobRequest) => {
    return new Promise((resolve, reject) => {
        const data = input.data;
        const method = process.env.API_METHOD || data.method || "";
        switch (method.toLowerCase()) {
            case "sendpayout":
                sendPayout(<SendRequest>data)
                    .then((response: any) => {
                        response.data.result = response.data.batch_header.payout_batch_id || "";
                        return resolve(response);
                    }).catch(reject);
                break;
            case "getpayout":
                getPayout(<GetRequest>data)
                    .then((response: any) => {
                        response.data.result = response.data.batch_header.payout_batch_id || "";
                        return resolve(response);
                    }).catch(reject);
                break;
            default:
                return reject({statusCode: 400, data: "Invalid method"})
        }
    })
};

export const requestWrapper = async (req: JobRequest): Promise<Response> => {
    return new Promise<Response>(resolve => {
        let response = <Response>{jobRunID: req.id || ""};
        createRequest(req).then(({statusCode, data}) => {
            response.status = "success";
            response.data = data;
            response.statusCode = statusCode;
            resolve(response)
        }).catch(({statusCode, data}) => {
            response.status = "errored";
            response.error = data;
            response.statusCode = statusCode;
            resolve(response)
        });
    });
};

// createRequest() wrapper for GCP
export const gcpservice = async (req: any = {}, res: any): Promise<any> => {
    let response = await requestWrapper(<JobRequest>req.body);
    res.status(response.statusCode).send(response);
};

// createRequest() wrapper for AWS Lambda
export const handler = async (
    event: JobRequest,
    context: any = {},
    callback: { (error: any, result: any): void }): Promise<any> => {
    callback(null, await requestWrapper(event));
};
