import http, { RequestBody } from "k6/http";

export class APIClient {
    private method: string;
    private url: string;
    private body: RequestBody | null = null;
    private params: { headers?: { [key: string]: string }, [key: string]: any } = {};

    constructor(method: string, url: string) {
        const allowedMethods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'];
        if (!allowedMethods.includes(method.toUpperCase())) {
            throw new Error(`Invalid HTTP method: ${method}`);
        }
        this.method = method.toUpperCase();
        this.url = url;
    }

    // Accepts both JSON objects and strings
    setBody(body: string | object) {
        if (typeof body === 'object') {
            this.body = JSON.stringify(body); // Convert object to JSON string
            // Automatically set Content-Type if not already set
            if (!this.params.headers || !this.params.headers['Content-Type']) {
                this.setContentType('application/json');
            }
        } else {
            this.body = body; // Use as-is if it's already a string
        }
        return this;
    }

    // Add common headers
    setContentType(contentType: string) {
        this.setHeader('Content-Type', contentType);
        return this;
    }

    setAuthorization(token: string) {
        this.setHeader('Authorization', `Bearer ${token}`);
        return this;
    }

    setAccept(acceptType: string) {
        this.setHeader('Accept', acceptType);
        return this;
    }

    setUserAgent(agent: string) {
        this.setHeader('User-Agent', agent);
        return this;
    }

    setCustomHeader(headerName: string, headerValue: string) {
        this.setHeader(headerName, headerValue);
        return this;
    }

    // Generic method to set a header
    private setHeader(header: string, value: string) {
        if (!this.params.headers) {
            this.params.headers = {};
        }
        this.params.headers[header] = value;
    }

    // Set multiple headers at once
    setHeaders(headers: { [key: string]: string }) {
        if (!this.params.headers) {
            this.params.headers = {};
        }
        this.params.headers = { ...this.params.headers, ...headers };
        return this;
    }

    // Set any custom parameters (e.g., redirects, query params)
    setParam(paramName: string, value: any) {
        this.params[paramName] = value;
        return this;
    }

    // Set multiple params at once
    setParams(params: { [key: string]: any }) {
        this.params = { ...this.params, ...params };
        return this;
    }

    // Execute the HTTP request
    send() {
        return http.request(this.method, this.url, this.body, this.params);
    }
}
