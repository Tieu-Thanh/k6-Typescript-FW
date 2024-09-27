import { APIClient } from "../../clients/api-client";
import { AccountDto } from "../../data-objects/account-dto";
import { CredentialDto } from "../../data-objects/credentials-dto";
import { CrocodileDto } from "../../data-objects/crocodile-dto";

const BASEURL: string = 'https://test-api.k6.io/';
const REGISTER_ENDPOINT: string = 'user/register/';
const LOGIN_ENDPOINT: string = 'auth/basic/login/';
const CROCODILE_ENDPOINT: string = 'my/crocodiles/';

export default class TestK6API {
    register(account: AccountDto){
        const url = `${BASEURL}${REGISTER_ENDPOINT}`;

        // const payload = {
        //     username: account.userName,
        //     first_name: account.firstName,
        //     last_name: account.lastName,
        //     email: account.email,
        //     password: account.password
        // };

        return new APIClient('POST', url)
            .setContentType('application/json')
            .setBody(account)
            .send();
    }

    login(creadential: CredentialDto) {
        const url = `${BASEURL}${LOGIN_ENDPOINT}`;

        // Send POST request using the APIClient
        return new APIClient('POST', url)
            .setContentType('application/json')
            .setBody(creadential)
            .send();
    }

    // Method to create a new crocodile
    createCrocodile(crocodile: CrocodileDto, token: string ="") {
        const url = `${BASEURL}${CROCODILE_ENDPOINT}`;

        // Create the payload for the POST request
        const payload = {
            name: crocodile.name,
            sex: crocodile.sex,
            date_of_birth: crocodile.date_of_birth
        };

        // Send POST request to create a new crocodile, including authorization token
        return new APIClient('POST', url)
            .setContentType('application/json')
            .setBody(payload)
            .send();
            // .setAuthorization(`Bearer ${token}`)
    }
}
