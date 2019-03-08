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
        const timeout = 5000;

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
            req.data = {
                method: "sendPayout",
                amount: process.env.TEST_AMOUNT || 10,
                currency: process.env.TEST_CURRENCY || "USD",
                receiver: process.env.TEST_RECEIVER || "your-buyer@example.com"
            };
            createRequest(req, (statusCode, data) => {
                assert.equal(statusCode, 201, "status code");
                assert.equal(data.jobRunID, jobID, "job id");
                assert.isNotEmpty(data.data, "response data");
                payoutId = data.data.batch_header.payout_batch_id;
                done();
            })
        }).timeout(timeout);

        it('should get payout details', (done) => {
            req.data = {
                method: "getPayout",
                payout_id: process.env.TEST_PAYOUT_ID || payoutId
            };
            createRequest(req, (statusCode, data) => {
                assert.equal(statusCode, 200, "status code");
                assert.equal(data.jobRunID, jobID, "job id");
                assert.isNotEmpty(data.data, "response data");
                done();
            })
        }).timeout(timeout);

        it('should get payout details using ENV variable', (done) => {
            process.env.API_METHOD = "getPayout";
            req.data = {
                method: "sendPayout",
                payout_id: process.env.TEST_PAYOUT_ID || payoutId
            };
            createRequest(req, (statusCode, data) => {
                assert.equal(statusCode, 200, "status code");
                assert.equal(data.jobRunID, jobID, "job id");
                assert.isNotEmpty(data.data, "response data");
                done();
            })
        }).timeout(timeout);

        it('should fail sendPayout with missing amount', (done) => {
            req.data = {
                method: "sendPayout",
                receiver: "your-buyer@example.com"
            };
            createRequest(req, (statusCode, data) => {
                assert.equal(statusCode, 400, "status code");
                assert.equal(data.jobRunID, jobID, "job id");
                assert.isUndefined(data.data, "response data");
                done();
            })
        }).timeout(timeout);

        it('should fail sendPayout with missing receiver', (done) => {
            req.data = {
                method: "sendPayout",
                amount: 10
            };
            createRequest(req, (statusCode, data) => {
                assert.equal(statusCode, 400, "status code");
                assert.equal(data.jobRunID, jobID, "job id");
                assert.isUndefined(data.data, "response data");
                done();
            })
        }).timeout(timeout);

        it('should fail getPayout with missing payout id', (done) => {
            req.data = {
                method: "getPayout"
            };
            createRequest(req, (statusCode, data) => {
                assert.equal(statusCode, 400, "status code");
                assert.equal(data.jobRunID, jobID, "job id");
                assert.isUndefined(data.data, "response data");
                done();
            })
        }).timeout(timeout);
    })
});
