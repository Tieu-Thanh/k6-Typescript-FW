import { sleep } from "k6";
import TestK6API from "../api-service/test-k6-service/test-api-k6";
import { ResponseCheck } from "../clients/response-check";
import { K6Config } from "../config/k6-config";
import { ScenarioConfig } from "../config/scenario-config";
import { CredentialDto } from "../data-objects/credentials-dto";
import { DataProvider } from "../util/data-provider";
import { CrocodileDto } from "../data-objects/crocodile-dto";

var credentials = new DataProvider<CredentialDto>("credentials", "../../src/test-data/credentials.json");


const createCrocodile = new ScenarioConfig('iteratingly-creating-crocodiles')
    .usePerVUIterations(10, 5, '30s') // 5 concurrent users, each runs 5 iterations, max durations 30s
    .setExec('createCrocodileTest')


export const options = new K6Config()
    .addScenario(createCrocodile)
    .build();


export function createCrocodileTest() {
    const testK6API = new TestK6API();
    const credential = credentials.getItem(0);
    var resLogin = testK6API.login(credential);

    new ResponseCheck(resLogin, "Login successfully").status(200);

    var crocodile: CrocodileDto = {
        id: '',
        name: 'CrocMaster',
        sex: 'M',  // M for Male, F for Female
        date_of_birth: '2020-05-05',
        age: ''
    }

    var resCreateCrocodile = testK6API.createCrocodile(crocodile);
    new ResponseCheck(resCreateCrocodile, "Create Crocodile successfully").showBody().status(201);

    sleep(1);
}
