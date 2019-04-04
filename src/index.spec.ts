import {GetRequest, JobRequest, Request, requestWrapper, SendRequest} from './index';
import {assert} from 'chai';
import 'mocha';

describe('create request', () => {
    context('requests data', () => {
        const jobID = "278c97ffadb54a5bbb93cfec5f7b5503";
        const req = <JobRequest>{
            id: jobID,
            data: <Request>{}
        };
        const timeout = 5000;

        it('should fail on invalid method', (done) => {
            // Notice method not set.
            requestWrapper(req).then((response) => {
                assert.equal(response.statusCode, 400, "status code");
                assert.equal(response.jobRunID, jobID, "job id");
                assert.isUndefined(response.data, "response data");
                done();
            });
        });

        let payoutId = "";

        it('should send payment/payout', (done) => {
            req.data = <SendRequest>{
                method: "sendPayout",
                amount: process.env.TEST_AMOUNT || 10,
                currency: process.env.TEST_CURRENCY || "USD",
                receiver: process.env.TEST_RECEIVER || "your-buyer@example.com"
            };
            requestWrapper(req).then((response) => {
                assert.equal(response.statusCode, 201, "status code");
                assert.equal(response.jobRunID, jobID, "job id");
                assert.isNotEmpty(response.data, "response data");
                assert.isNotEmpty(response.data.result, "payout id");
                payoutId = response.data.batch_header.payout_batch_id;
                done();
            });
        }).timeout(timeout);

        it('should get payout details', (done) => {
            req.data = <GetRequest>{
                method: "getPayout",
                payout_id: process.env.TEST_PAYOUT_ID || payoutId
            };
            requestWrapper(req).then((response) => {
                assert.equal(response.statusCode, 200, "status code");
                assert.equal(response.jobRunID, jobID, "job id");
                assert.isNotEmpty(response.data, "response data");
                assert.isNotEmpty(response.data.result, "payout id");
                done();
            });
        }).timeout(timeout);

        it('should get payout details using ENV variable', (done) => {
            process.env.API_METHOD = "getPayout";
            req.data = <Request>{
                method: "sendPayout",
                payout_id: process.env.TEST_PAYOUT_ID || payoutId
            };
            requestWrapper(req).then((response) => {
                assert.equal(response.statusCode, 200, "status code");
                assert.equal(response.jobRunID, jobID, "job id");
                assert.isNotEmpty(response.data, "response data");
                assert.isNotEmpty(response.data.result, "payout id");
                done();
            });
        }).timeout(timeout);

        it('should fail sendPayout with missing amount', (done) => {
            req.data = <SendRequest>{
                method: "sendPayout",
                receiver: "your-buyer@example.com"
            };
            requestWrapper(req).then((response) => {
                assert.equal(response.statusCode, 400, "status code");
                assert.equal(response.jobRunID, jobID, "job id");
                assert.isUndefined(response.data, "response data");
                done();
            });
        }).timeout(timeout);

        it('should fail sendPayout with missing receiver', (done) => {
            req.data = <Request>{
                method: "sendPayout",
                amount: 10
            };
            requestWrapper(req).then((response) => {
                assert.equal(response.statusCode, 400, "status code");
                assert.equal(response.jobRunID, jobID, "job id");
                assert.isUndefined(response.data, "response data");
                done();
            });
        }).timeout(timeout);

        it('should fail getPayout with missing payout id', (done) => {
            req.data = <GetRequest>{
                method: "getPayout"
            };
            requestWrapper(req).then((response) => {
                assert.equal(response.statusCode, 400, "status code");
                assert.equal(response.jobRunID, jobID, "job id");
                assert.isUndefined(response.data, "response data");
                done();
            });
        }).timeout(timeout);
    })
});
