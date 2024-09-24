import { APIClient } from "../clients/api-client";
import { K6Config } from "../config/k6-config";
import { ScenarioConfig } from "../config/scenario-config";
import { ThresholdsConfig } from "../config/threshold-config";
import { check, sleep } from "k6";
import { ResponseCheck } from "../clients/response-check";

// Define thresholds for assertion
const thresholds = new ThresholdsConfig()
    .setHttpReqDuration(['p(95)<500'])
    .setHttpReqFailed(['rate<0.01'])

// Define scenarios with VUs and Duration
const scenario1 = new ScenarioConfig('scenario_1')
    .useConstantVUs(10, '1m')
    .setExec('loginTest');

// Define k6 options using K6Config
export const options = new K6Config()
    .setThresholds(thresholds)
    .addScenario(scenario1)
    .build();

// Initialize the API client
const client = new APIClient('GET', 'https://test.k6.io/login');

// Define the default function that k6 will execute
export function loginTest() {
    const response = client.send();

    // Use Chai directly
    new ResponseCheck(response).status(200).responseTimeLessThan(500);
    sleep(1);
}
