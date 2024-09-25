import { RefinedResponse } from "k6/http";
import { APIClient } from "../../clients/api-client";
import { AccountDto } from "../../data-objects/account-dto";
import { ProductDto } from "../../data-objects/product-dto";
import { FormEncoder } from "../../util/form-encoder";

const BASEURL: string = 'http://localhost:5000';
const LOGIN_ENDPOINT: string = '/login?returnurl=%2F';
const REGISTER_ENDPOINT: string = '/register?returnurl=%2F';
const ADD_TO_CART_ENDPOINT: string = '/addproducttocart/details/{}/1';
const BROWSE_PRODUCT_ENDPOINT: string = '/{}';

export default class NopCommerceAPI {

    // Register an account
    register(account: AccountDto) {
        const url = `${BASEURL}${REGISTER_ENDPOINT}`;

        const payload = FormEncoder.encodeToUrlEncodedForm({
            Gender: 'M',
            FirstName: account.firstName,
            LastName: account.lastName,
            Email: account.email,
            Company: 'TestCompany',
            Newsletter: true,
            Password: account.password,
            ConfirmPassword: account.password,
            'register-button': '',
            __RequestVerificationToken: 'CfDJ8PgrBNUkDq1JoPEuEbcjMds18gd6YOy06U1sntzaY9z4kSpIuJh0ZDXQYq3jVniSYfsBKvaCokK8qdzpxW3dGKMVLVPwaGEcy05JYwaiOCVly_7BBHmnHl8ddJeCVrZQHsvfkNgL_PmckcITDIHiax0'
        });

        return new APIClient('POST', url)
            .setContentType('application/x-www-form-urlencoded')
            .setCustomHeader('Cookie', '_ga=GA1.1.1513616435.1724383086; .Nop.Antiforgery=CfDJ8PgrBNUkDq1JoPEuEbcjMdupHu1SnrZsHO2ADIehxPjQWaraB-VJjj80xg2JrJnCD7x9zy_h_dGG1jTn86TeMO3Z-t66QP_DmDN0UusyG9hkBVqxTopNEaTGMbUrSe2QwIwkp5BSUg8kXB3UO1rFw7I; .Nop.Culture=c%3Den-US%7Cuic%3Den-US; _ga_XXXXXXXXXX=GS1.1.1724826059.2.1.1724830423.0.0.0; .Nop.Customer=d0915e67-fd6b-4d8c-aea1-d63996ab071c')
            .setBody(payload)
            .send();
    }

    // Login
    // Login
    login(account: AccountDto) {
        const url = `${BASEURL}${LOGIN_ENDPOINT}`;

        const payload = {
            Email: account.email,
            Password: account.password,
            '__RequestVerificationToken': 'CfDJ8PgrBNUkDq1JoPEuEbcjMdt56HpVvYIiTsdRMga9d_OuJsJylPXzKxkZX3r0rgIFGhTTw-SzhB6uVsUWMPt6lrQbUzBGxWRL1bC6qG9RMy_M80m1NVazmOqTYxijXNx0y3HgUdDvuX2iIDzw8JoJa6I',
            'RememberMe': 'false'
        };

        return new APIClient('POST', url)
            .setCookie('_ga=GA1.1.1513616435.1724383086; fpestid=OgoFqOzgQwUHkZSSOBEem0tx1nBBOO0zfIG-pfGmEbCZZuDUreunMcnpheo9-fuyToGfpg; .Nop.Antiforgery=CfDJ8PgrBNUkDq1JoPEuEbcjMdtcP-kBZK2CBEIjNJk30MRIrRyaqDmcKIFlr2MxhHY1jkBpG1kulVDp2P8eAtYWoz8JE91ziY58xb2pzrpOJN7w8gXBL-XVfsLjXGYUKOj_0Aeeqkp6sasu6L0Pl7WFywI; .Nop.RecentlyViewedProducts=4%2C13%2C1; .Nop.Culture=c%3Den-US%7Cuic%3Den-US; .Nop.Customer=12d45ef9-33e0-46b3-940d-2ef1dbb071c6; _ga_XXXXXXXXXX=GS1.1.1725522319.10.1.1725522542.0.0.0; .Nop.Culture=c%3Den-US%7Cuic%3Den-US; .Nop.Customer=b01768ba-a4f9-43fc-9add-63190eb55379')
            .setBody(payload)
            .send();
    }


    // Browse a product and extract the request verification token
    browseProducts(product: ProductDto): string | null {
        const url = `${BASEURL}${BROWSE_PRODUCT_ENDPOINT.replace('{}', convertToUrlForm(product.name))}`;

        const response = new APIClient('GET', url).send();
        return this.extractRequestVerificationToken(response.body);
    }

    // Add a product to the cart
    addToCart(product: ProductDto, token: string) {
        const url = `${BASEURL}${ADD_TO_CART_ENDPOINT.replace('{}', product.id.toString())}`;

        const payload = FormEncoder.encodeToUrlEncodedForm({
            EnteredQuantity: '2',
            __RequestVerificationToken: token
        });

        return new APIClient('POST', url)
            .setContentType('application/x-www-form-urlencoded; charset=UTF-8')
            .setAcceptLanguage('en-US,en;q=0.9')
            .setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36 Edg/128.0.0.0')
            .setCookie('_ga=GA1.1.1513616435.1724383086; fpestid=OgoFqOzgQwUHkZSSOBEem0tx1nBBOO0zfIG-pfGmEbCZZuDUreunMcnpheo9-fuyToGfpg; .Nop.Antiforgery=CfDJ8PgrBNUkDq1JoPEuEbcjMdt328X6MXq7B8kL-0-5b6iocpEWSAf0OMw1OfwyuwGojx_em0yHTgNv1RL0b-aS0lfbKBSXRb1jM_dHhGH4VkiVsWDveHl0obYmb9dALwIsA8I-yghhYdquZI4fOCxsVj0; .Nop.Authentication=CfDJ8PgrBNUkDq1JoPEuEbcjMdu9LRfLuB2DEDRb0OOx_UcODKqbfPB9R8xnPb4ypFjfTRKcF4p40YJg3R9eigMUN77T11hDM7q9s3AxNnoXdNz-EUv55DqSargvyVVNyLdlQhQQNZ_ays3HoMTbgW_BmU85ZIYldTjev_5_5ohO25GjjTm3xjtdmBW5sjxyQ32rrNjVd9PIzDHUKQcNndVjCijlcWN0Kn8DBI_V4XDYMxskq2EZWQ_E7apqoNs9M5QCAw_g0G_BNpUegePf75wYKf5HmRR1FhHPL0jhbinvZBbK7ecJss0pmf52XrekhcHVc0W9kza4piSlVsi39zIRW70hND5n5CyO7cqm9UvBBuYmA2gnFLTH-L_IVyG5rB00X7F2_cotjPFbsPpK7G75Qm3y6E6fcmZWGQd1a9CLW_U2OTgwk3hmFveMp_T2n5eUAlfUUOpZfwGJMHXbm33qGqFhITtXNelLsg8R_PKdvXuuYO3yY7IZXaqpVYWO2ly79ihVcWirRfTLqFr2HwjNb4zhrMKUwr74sEfm8zmv3-ZPLF9ZgDE3ugj5GVYfnssDJQ')
            .setBody(payload)
            .send();
    }

    // Extract request verification token
    private extractRequestVerificationToken(html: string): string | null {
        const tokenRegex = /<input[^>]*name="__RequestVerificationToken"[^>]*value="([^"]*)"/;
        const match = html.match(tokenRegex);
        return match ? match[1] : null;
    }
}

// Function to convert product name to a URL-friendly form
function convertToUrlForm(productName: string): string {
    return productName
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, '') // Remove all special characters
        .replace(/\s+/g, '-')        // Replace spaces with hyphens
        .trim();                     // Trim any leading/trailing spaces
}
