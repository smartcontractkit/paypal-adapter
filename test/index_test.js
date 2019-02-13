const assert = require('chai').assert;
const createRequest = require('../index.js').createRequest;

describe('create request', () => {
    context('requests data', () => {
        const jobID = "278c97ffadb54a5bbb93cfec5f7b5503";
        const req = {
            id: jobID,
            data: {
                method: ""
            }
        };

        it('should fail on invalid method', (done) => {
            // Notice method not set.
            createRequest(req, (statusCode, data) => {
                assert.equal(statusCode, 400, "status code");
                assert.equal(data.jobRunID, jobID, "job id");
                assert.isUndefined(data.data, "response data");
                done();
            })
        });

        let payoutId = "";

        it('should send payment/payout', (done) => {
            req.data.method = "sendPayout";
            req.data.amount = process.env.TEST_AMOUNT || 10;
            req.data.currency = process.env.TEST_CURRENCY || "USD";
            req.data.receiver = process.env.TEST_RECEIVER || "your-buyer@example.com";
            createRequest(req, (statusCode, data) => {
                assert.equal(statusCode, 201, "status code");
                assert.equal(data.jobRunID, jobID, "job id");
                assert.isNotEmpty(data.data, "response data");
                payoutId = data.data.batch_header.payout_batch_id;
                done();
            })
        }).timeout(5000);

        it('should get payout details', (done) => {
            req.data.method = "getPayout";
            req.data.payout_id = process.env.TEST_PAYOUT_ID || payoutId;
            createRequest(req, (statusCode, data) => {
                assert.equal(statusCode, 200, "status code");
                assert.equal(data.jobRunID, jobID, "job id");
                assert.isNotEmpty(data.data, "response data");
                done();
            })
        }).timeout(5000);
    })
});
