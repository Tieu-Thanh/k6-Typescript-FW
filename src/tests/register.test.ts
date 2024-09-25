import { sleep } from "k6";
import { K6Config } from "../config/k6-config";
import { ScenarioConfig } from "../config/scenario-config";
import { ThresholdsConfig } from "../config/threshold-config";
import { AccountDto } from "../data-objects/account-dto";
import { DataProvider } from "../util/data-provider";
import NopCommerceAPI from "../api-service/nop-commerce-service/nop-commerce-api";
import { ResponseCheck } from "../clients/response-check";


// const accounts = new DataProvider<AccountDto>('accounts', () => {
//     return JSON.parse(open('../../src/test-data/accounts.json'));
// })

const accounts = new DataProvider<AccountDto>('accounts', '../../src/test-data/accounts.json');

const rampingVUs = new ScenarioConfig('ramp-up-vus')
    .useRampingVUs([
        { duration: '10s', target: 5 }, // ramp-up to 5 users in 10 seconds
        { duration: '1m', target: 5 },  // stay at 5 users for 1 minute
        { duration: '10s', target: 0 }, // ramp-down to 0 users in 10 seconds
    ])
    .setExec('registerTest');

const thresholds = new ThresholdsConfig()
    .setHttpReqDuration(['p(95)<500'])
    .setHttpReqFailed(['rate<0.01'])

export const options = new K6Config()
    .setThresholds(thresholds)
    .addScenario(rampingVUs)
    .build();

export function registerTest() {
    // Instantiate NopCommerceAPI
    const nopCommerceAPI = new NopCommerceAPI();

    // Get a random account from the DataProvider
    const account = accounts.getItem(__VU % accounts.getLength());

    // Log which account is being registered
    console.log(`VU ${__VU} is registering with email: ${account.email}`);

    // Call the register function
    const response = nopCommerceAPI.register(account);

    // Verify status code
    new ResponseCheck(response).status(200);

    // Sleep to simulate real user behavior
    sleep(1);
}
