import { sleep } from 'k6';
import { K6Config } from '../config/k6-config';
import { ScenarioConfig } from '../config/scenario-config';
import { ThresholdsConfig } from '../config/threshold-config';
import { AccountDto } from '../data-objects/account-dto';
import { ProductDto } from '../data-objects/product-dto';
import { DataProvider } from '../util/data-provider';
import NopCommerceAPI from '../api-service/nop-commerce-service/nop-commerce-api';
import { ResponseCheck } from '../clients/response-check';

// Load users and products using DataProvider
const accounts = new DataProvider<AccountDto>('accounts', '../../src/test-data/accounts.json');
const products = new DataProvider<ProductDto>('products', '../../src/test-data/products.json');

const rampingVUs = new ScenarioConfig('ramp-up-vus')
    .useRampingVUs([
        { duration: '10s', target: 10 },  // Ramp-up to 10 users in 10 seconds
        { duration: '10s', target: 10 },   // Stay at 10 users for 1 minute
        { duration: '10s', target: 0 },   // Ramp-down to 0 users in 10 seconds
    ])
    .setExec('addToCartTest');

const thresholds = new ThresholdsConfig()
    .setHttpReqDuration(['p(95)<500'])
    .setHttpReqFailed(['rate<0.01']);

export const options = new K6Config()
    .setThresholds(thresholds)
    .addScenario(rampingVUs)
    .build();

// Main test function simulating user journey
export function addToCartTest() {
    const nopCommerceAPI = new NopCommerceAPI();
    const user = accounts.getItem(__VU % accounts.getLength());

    nopCommerceAPI.login(user);
    sleep(1);

    const product = products.getRandomItem();
    const token = nopCommerceAPI.browseProducts(product);
    sleep(1);

    nopCommerceAPI.addToCart(product, token);
    sleep(1);
}
