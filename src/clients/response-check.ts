// ResponseCheck.ts
import { expect } from 'https://jslib.k6.io/k6chaijs/4.3.4.3/index.js';
import { Response } from 'k6/http';

export class ResponseCheck {
    private response: Response;
    private msg: string;

    constructor(response: Response, msg?: string) {
        this.response = response;
        this.msg = msg || '';
    }

    // Check that the status code is equal to expectedStatus
    status(expectedStatus: number, msg?: string): this {
        expect(this.response.status, msg || this.msg).to.equal(expectedStatus);
        return this;
    }

    // Check that the response has a specific header
    header(headerName: string, expectedValue?: string): this {
        expect(this.response.headers, `header ${headerName}`).to.have.property(headerName);

        if (expectedValue !== undefined) {
            expect(this.response.headers[headerName], `header ${headerName}`).to.include(expectedValue);
        }

        return this;
    }

    // Check that the response body contains a string
    bodyContains(searchString: string): this {
        expect(this.response.body, 'response body').to.include(searchString);
        return this;
    }

    showStatus(): this {
        console.log(`Status: ${this.response.status}`);
        return this;
    }

    showHeaders(): this {
        console.log(`Headers: ${JSON.stringify(this.response.headers, null, 2)}`);
        return this;
    }

    showBody(): this {
        console.log(`Body: ${this.response.body}`);
        return this;
    }

    showError(): this {
        console.log(`Error: ${this.response.error}`);
        return this;
    }

    showErrorCode(): this {
        console.log(`Status: ${this.response.error_code}`);
        return this;
    }

    showDuration(): this {
        console.log(`Duration: ${this.response.timings.duration}`);
        return this;
    }

    showStatusText(): this {
        console.log(`Status Text: ${this.response.status_text}`);
        return this;
    }

    // Validate the response body against a JSON schema
    jsonSchema(schema: object): this {
        const data = this.response.json();
        expect(data).to.be.jsonSchema(schema);
        return this;
    }

    // Check that the response time is less than a threshold
    responseTimeLessThan(thresholdMs: number): this {
        expect(this.response.timings.duration, 'response time').to.be.below(thresholdMs);
        return this;
    }
}
