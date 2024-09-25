// ResponseCheck.ts
import { expect } from 'https://jslib.k6.io/k6chaijs/4.3.4.3/index.js';
import { Response } from 'k6/http';

export class ResponseCheck {
    private response: Response;

    constructor(response: Response) {
        this.response = response;
    }

    // Check that the status code is equal to expectedStatus
    status(expectedStatus: number): this {
        expect(this.response.status, 'response status').to.equal(expectedStatus);
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

    showResponse(): void {
        console.log(`Status: ${this.response.status}`);
        console.log(`Headers: ${JSON.stringify(this.response.headers, null, 2)}`);
        console.log(`Body: ${this.response.body}`);
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
