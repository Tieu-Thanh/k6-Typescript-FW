import http, { RequestBody } from "k6/http";

/**
 * `APIClient` class handles making HTTP requests in k6, supporting multiple methods (GET, POST, etc.),
 * setting headers, request bodies, and query parameters, and sending the request.
 */
export class APIClient {
    private method: string;                       // HTTP method (GET, POST, PUT, etc.)
    private url: string;                          // Target URL for the request
    private body: RequestBody | null = null;      // Request body (can be JSON, URL-encoded form, or string)
    private params: { headers?: { [key: string]: string }, [key: string]: any } = {}; // Request parameters

    /**
     * Constructs the APIClient with a method and URL.
     * @param method - HTTP method (e.g., 'GET', 'POST')
     * @param url - The target URL for the request
     * @throws Error - If the method is not a valid HTTP method
     */
    constructor(method: string, url: string) {
        const allowedMethods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'];
        if (!allowedMethods.includes(method.toUpperCase())) {
            throw new Error(`Invalid HTTP method: ${method}`);
        }
        this.method = method.toUpperCase();
        this.url = url;
    }

    /**
     * Sets the request body. If it's an object and the Content-Type is 'application/x-www-form-urlencoded',
     * the body will be URL-encoded. Otherwise, the object will be JSON-stringified.
     * @param body - The request body as a string or object
     * @returns This APIClient instance for method chaining
     */
    setBody(body: string | object) {
        if (typeof body === 'object') {
            if (this.params.headers && this.params.headers['Content-Type'] === 'application/x-www-form-urlencoded') {
                // URL-encode the body for form submission
                this.body = Object.keys(body)
                    .map(key => encodeURIComponent(key) + '=' + encodeURIComponent(body[key as keyof typeof body]))
                    .join('&');
            } else {
                this.body = JSON.stringify(body); // Convert object to JSON string
                // Automatically set Content-Type if not already set
                if (!this.params.headers || !this.params.headers['Content-Type']) {
                    this.setContentType('application/json');
                }
            }
        } else {
            this.body = body; // Use the body as-is if it's a string
        }
        return this;
    }

    /**
     * Adds the 'Content-Type' header to the request.
     * @param contentType - The content type (e.g., 'application/json')
     * @returns This APIClient instance for method chaining
     */
    setContentType(contentType: string) {
        this.setHeader('Content-Type', contentType);
        return this;
    }

    /**
     * Sets the 'Authorization' header with a Bearer token.
     * @param token - The Bearer token to include in the header
     * @returns This APIClient instance for method chaining
     */
    setAuthorization(token: string) {
        this.setHeader('Authorization', `Bearer ${token}`);
        return this;
    }

    /**
     * Sets the 'Accept' header, which defines the types of content that are acceptable for the response.
     * @param acceptType - MIME type (e.g., 'application/json')
     * @returns This APIClient instance for method chaining
     */
    setAccept(acceptType: string) {
        this.setHeader('Accept', acceptType);
        return this;
    }

    // Other utility methods to set common headers (Accept-Language, Cookie, User-Agent, etc.)

    /**
     * Sets a custom header for the request.
     * @param headerName - The name of the header
     * @param headerValue - The value for the header
     * @returns This APIClient instance for method chaining
     */
    setCustomHeader(headerName: string, headerValue: string) {
        this.setHeader(headerName, headerValue);
        return this;
    }

    /**
     * Sets a header in the request.
     * @param header - The name of the header
     * @param value - The value of the header
     */
    private setHeader(header: string, value: string) {
        if (!this.params.headers) {
            this.params.headers = {};
        }
        this.params.headers[header] = value;
    }

    /**
     * Sets query parameters or additional request options.
     * @param paramName - The name of the query parameter or request option
     * @param value - The value for the parameter or option
     * @returns This APIClient instance for method chaining
     */
    setParam(paramName: string, value: any) {
        this.params[paramName] = value;
        return this;
    }

    /**
     * Sends the HTTP request using the method, URL, body, and parameters configured.
     * @returns The response from the HTTP request
     */
    send() {
        return http.request(this.method, this.url, this.body, this.params);
    }
}
