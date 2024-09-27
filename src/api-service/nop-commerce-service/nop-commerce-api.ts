import { RefinedResponse } from "k6/http";
import { APIClient } from "../../clients/api-client";
import { AccountDto } from "../../data-objects/account-dto";
import { ProductDto } from "../../data-objects/product-dto";
import { FormEncoder } from "../../util/form-encoder";
import { ResponseCheck } from "../../clients/response-check";

const BASEURL: string = 'http://localhost:5000';
const LOGIN_ENDPOINT: string = '/login?returnurl=%2F';
const REGISTER_ENDPOINT: string = '/register?returnurl=%2F';
const ADD_TO_CART_ENDPOINT: string = '/addproducttocart/details/{}/1';
const BROWSE_PRODUCT_ENDPOINT: string = '/{}';

export default class NopCommerceAPI {
    // Extract request verification token
    private extractRequestVerificationToken(html: string): string | null {
        const tokenRegex = /<input[^>]*name="__RequestVerificationToken"[^>]*value="([^"]*)"/;
        const match = html.match(tokenRegex);
        return match ? match[1] : null;
    }

    // Register an account
    register(account: AccountDto) {
        const url = `${BASEURL}${REGISTER_ENDPOINT}`;
        // go to register page to get token from html
        const registerGetResponse = new APIClient('GET', url).send();
        var token = this.extractRequestVerificationToken(registerGetResponse.body.toString());

        // send POST request
        const payload = {
            Gender: 'M',
            FirstName: account.firstName,
            LastName: account.lastName,
            Email: account.email,
            Company: 'TestCompany',
            Password: account.password,
            ConfirmPassword: account.password,
            'register-button': '',
            __RequestVerificationToken: token
        };

        return new APIClient('POST', url)
            .setContentType('application/x-www-form-urlencoded')
            .setBody(payload)
            .send();
    }

    // Login
    login(account: AccountDto) {
        const url = `${BASEURL}${LOGIN_ENDPOINT}`;

        const loginGetResponse = new APIClient('GET', url).send();
        var token = this.extractRequestVerificationToken(loginGetResponse.body.toString());

        const payload = {
            Email: account.email,
            Password: account.password,
            '__RequestVerificationToken': token,
        };

        const response = new APIClient('POST', url)
            .setContentType('application/x-www-form-urlencoded')
            .setBody(payload)
            .send();

        new ResponseCheck(response, 'Login successfully').status(200);

        return response;
    }


    // Browse a product and extract the request verification token
    browseProducts(product: ProductDto): string | null {
        const url = `${BASEURL}${BROWSE_PRODUCT_ENDPOINT.replace('{}', convertToUrlForm(product.name))}`;

        const response = new APIClient('GET', url).send();
        new ResponseCheck(response, `Browse product ${product.name} successfully`).status(200);

        const token = this.extractRequestVerificationToken(response.body);
        return token;
    }

    // Add a product to the cart
    addToCart(product: ProductDto, token: string) {
        const url = `${BASEURL}${ADD_TO_CART_ENDPOINT.replace('{}', product.id.toString())}`;

        const payload = FormEncoder.encodeToUrlEncodedForm({
            EnteredQuantity: '2',
            __RequestVerificationToken: token
        });

        const response = new APIClient('POST', url)
            .setContentType('application/x-www-form-urlencoded; charset=UTF-8')
            .setBody(payload)
            .send();

        new ResponseCheck(response, `Add product ${product.name} to cart successfully`).status(200);

        return response;
    }

}

// Function to convert product name to a URL-friendly form
function convertToUrlForm(productName: string): string {
    return productName
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')     // Remove all special characters except hyphens
        .replace(/\s*-\s*/g, '-')         // Normalize spaces around hyphens
        .replace(/\s+/g, '-')              // Replace spaces with hyphens
        .trim();                     // Trim any leading/trailing spaces
}
