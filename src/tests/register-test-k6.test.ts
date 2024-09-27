import { sleep } from "k6";
import TestK6API from "../api-service/test-k6-service/test-api-k6";
import { ResponseCheck } from "../clients/response-check";
import { K6Config } from "../config/k6-config";
import { ScenarioConfig } from "../config/scenario-config";
import { AccountDto } from "../data-objects/account-dto";
import { DataProvider } from "../util/data-provider";


var accounts = new DataProvider<AccountDto>("accounts", "../../src/test-data/accounts.json");

const registeringAccount = new ScenarioConfig('iterating-registration')
    .usePerVUIterations(5, 5) // 5 concurrent users, each runs 5 iterations
    .setExec('registerTestK6Test');

export const options = new K6Config()
    .addScenario(registeringAccount)
    .build();


export function registerTestK6Test() {
    const testK6API = new TestK6API();
    const account = accounts.getItem((__VU - 1) % accounts.getLength());

    console.log(`Iteration ${__ITER + 1} - User: ${account.userName} registering...`)
    var response = testK6API.register(account);

    new ResponseCheck(response, "Register successfully").showStatusText();
    sleep(1);
}
