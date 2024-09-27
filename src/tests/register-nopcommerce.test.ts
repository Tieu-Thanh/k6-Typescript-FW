import { sleep } from "k6";
import NopCommerceAPI from "../api-service/nop-commerce-service/nop-commerce-api";
import { ResponseCheck } from "../clients/response-check";
import { DataProvider } from "../util/data-provider";
import { ScenarioConfig } from "../config/scenario-config";
import { ThresholdsConfig } from "../config/threshold-config";
import { K6Config } from "../config/k6-config";
import { AccountDto } from "../data-objects/account-dto";

var accounts = new DataProvider<AccountDto>("accounts", "../../src/test-data/accounts.json");

const rampingVUs = new ScenarioConfig('ramp-up-vus')
    .useRampingVUs([
        { duration: '10s', target: 5 }, // ramp-up to 5 users in 10 seconds
        { duration: '1m', target: 5 },  // stay at 5 users for 1 minute
        { duration: '10s', target: 0 }, // ramp-down to 0 users in 10 seconds
    ])
    .setExec('registerNopCommerceTest');

const thresholds = new ThresholdsConfig()
    .setHttpReqDuration(['p(95)<500'])
    .setHttpReqFailed(['rate<0.01'])

export const options = new K6Config()
    .setThresholds(thresholds)
    .addScenario(rampingVUs)
    .build();

export function registerNopCommerceTest() {
    const nopCommerceAPI = new NopCommerceAPI();
    const account = accounts.getItem(__VU % accounts.getLength());
    var response = nopCommerceAPI.register(account);
    new ResponseCheck(response, "Register successfully").status(200);
    sleep(1);
}
