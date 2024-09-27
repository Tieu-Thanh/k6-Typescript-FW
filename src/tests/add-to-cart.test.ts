import { sleep } from 'k6';
import { K6Config } from '../config/k6-config';
import { ScenarioConfig } from '../config/scenario-config';
import { AccountDto } from '../data-objects/account-dto';
import { ProductDto } from '../data-objects/product-dto';
import { DataProvider } from '../util/data-provider';
import NopCommerceAPI from '../api-service/nop-commerce-service/nop-commerce-api';
import { ResponseCheck } from '../clients/response-check';

// Load users and products using DataProvider
const accounts = new DataProvider<AccountDto>('accounts', '../../src/test-data/accounts.json');
const products = new DataProvider<ProductDto>('products', '../../src/test-data/products.json');

// Define the scenario with 10 VUs (each user runs 5 iterations)
const addingScenario = new ScenarioConfig('adding-products')
    .usePerVUIterations(10, 5)  // 10 concurrent users, each runs 5 iterations
    .setExec('addToCartTest');

// Build the k6 configuration
export const options = new K6Config()
    .addScenario(addingScenario)
    .build();

// Main test function simulating user journey
export function addToCartTest() {
    const nopCommerceAPI = new NopCommerceAPI();

    // Select a user based on __VU (1-based, so use (__VU - 1))
    const user = accounts.getItem((__VU - 1) % accounts.getLength());

    // Login step
    var resLogin = nopCommerceAPI.login(user);
    sleep(1);

    // Browse products
    const product = products.getRandomItem();
    const tokenProduct = nopCommerceAPI.browseProducts(product);

    // Randomly decide whether to add the product to the cart
    const addProductFlag = Math.random() < 0.5;

    // Add to cart if the flag is true
    if (addProductFlag) {
        nopCommerceAPI.addToCart(product, tokenProduct);
        console.log(`Iteration ${__ITER + 1} - User: ${user.email} - Product: ${product.name} - ADDED to cart`);
        return;  // Exit the function early if the product is added
    }

    // If we reach here, the product was not added
    console.log(`Iteration ${__ITER + 1} - User: ${user.email} - Product: ${product.name} - SKIPPED`);
    sleep(1);
}
