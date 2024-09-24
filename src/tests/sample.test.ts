import { APIClient } from "../clients/api-client";
import { ResponseCheck } from "../clients/response-check";
import { K6Config } from "../config/k6-config";
import { ScenarioConfig } from "../config/scenario-config";
import { ThresholdsConfig } from "../config/threshold-config";
import { check, sleep } from "k6";

const rampUpVUs = new ScenarioConfig('ramp-up-vus')  // Ramp-up VUs
    .useRampingVUs([
        { duration: '30s', target: 10 },
        { duration: '1m', target: 50 },
        { duration: '30s', target: 0 },
    ])
    .setExec('sampleTest');

// Define k6 options using K6Config
export const options = new K6Config()
    .setThresholds(
        new ThresholdsConfig()
            .setHttpReqDuration(['p(95)<500']) // Example condition
            .setHttpReqFailed(['rate<0.01'])
    )
    .addScenario(rampUpVUs)
    .build();

// Initialize the API client
const client = new APIClient('GET', 'https://test.k6.io');

// Define the default function that k6 will execute
export function sampleTest () {
    const response = client.send();

    // Use Chai directly
    new ResponseCheck(response).status(200).responseTimeLessThan(500);
    sleep(1);
}
