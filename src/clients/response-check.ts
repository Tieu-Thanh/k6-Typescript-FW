// Import Chai expect for assertions
import { expect } from 'https://jslib.k6.io/k6chaijs/4.3.4.3/index.js';
import { Response } from 'k6/http';

/**
 * `ResponseCheck` class is used to verify and log details about HTTP responses in k6.
 * It uses Chai's `expect` syntax to validate response status codes, headers, and body content.
 */
export class ResponseCheck {
    private response: Response;
    private msg: string;

    /**
     * Constructs the ResponseCheck instance with the response object and an optional message.
     * @param response - The HTTP response to validate
     * @param msg - Optional message to log along with validations
     */
    constructor(response: Response, msg?: string) {
        this.response = response;
        this.msg = msg || '';
    }

    /**
     * Validates the response status code against the expected status.
     * @param expectedStatus - The expected HTTP status code (e.g., 200 for OK)
     * @param msg - Optional message for logging
     * @returns This ResponseCheck instance for method chaining
     */
    status(expectedStatus: number, msg?: string): this {
        expect(this.response.status, msg || this.msg).to.equal(expectedStatus);
        return this;
    }

    /**
     * Checks if a specific header is present and optionally validates its value.
     * @param headerName - The name of the header (e.g., 'Content-Type')
     * @param expectedValue - The expected value of the header
     * @returns This ResponseCheck instance for method chaining
     */
    header(headerName: string, expectedValue?: string): this {
        expect(this.response.headers, `header ${headerName}`).to.have.property(headerName);

        if (expectedValue !== undefined) {
            expect(this.response.headers[headerName], `header ${headerName}`).to.include(expectedValue);
        }

        return this;
    }

    /**
     * Checks if the response body contains a specific string.
     * @param searchString - The string to search for in the response body
     * @returns This ResponseCheck instance for method chaining
     */
    bodyContains(searchString: string): this {
        expect(this.response.body, 'response body').to.include(searchString);
        return this;
    }

    // Utility methods for logging response details (Status, Headers, Body, etc.)

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
        console.log(`Error Code: ${this.response.error_code}`);
        return this;
    }

    showDuration(): this {
        console.log(`Duration: ${this.response.timings.duration}ms`);
        return this;
    }

    showStatusText(): this {
        console.log(`Status Text: ${this.response.status_text}`);
        return this;
    }

    /**
     * Validates the response body against a JSON schema (if applicable).
     * @param schema - The JSON schema to validate the response against
     * @returns This ResponseCheck instance for method chaining
     */
    jsonSchema(schema: object): this {
        const data = this.response.json();
        expect(data).to.be.jsonSchema(schema);
        return this;
    }

    /**
     * Validates that the response time is less than the specified threshold.
     * @param thresholdMs - The threshold in milliseconds (e.g., 500 for 500ms)
     * @returns This ResponseCheck instance for method chaining
     */
    responseTimeLessThan(thresholdMs: number): this {
        expect(this.response.timings.duration, 'response time').to.be.below(thresholdMs);
        return this;
    }
}
