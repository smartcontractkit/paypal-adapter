import express from 'express';
import bodyParser from 'body-parser';
import {gcpservice} from "./index";
import {AddressInfo} from "net";

const app: express.Application = express();
app.use(bodyParser.json());

app.post('/', function (req: any, res: any) {
    gcpservice(req, res);
});

let listener = app.listen(process.env.EA_PORT || 8080, function () {
    let addressInfo = <AddressInfo>listener.address();
    console.log("Listening on ", addressInfo.address + ":" + addressInfo.port);
});

process.on('SIGINT', function () {
    process.exit();
});
