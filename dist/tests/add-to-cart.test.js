// src/tests/add-to-cart.test.ts
import { sleep } from "k6";

// src/config/threshold-config.ts
var ThresholdsConfig = class {
  constructor() {
    this.thresholds = {};
  }
  /**
   * Sets a threshold for HTTP request duration.
   * This is commonly used to ensure that most requests complete within a certain time.
   *
   * @param conditions - Array of conditions, e.g., ['p(95)<500'] to ensure the 95th percentile duration is below 500ms.
   * @returns This ThresholdsConfig instance for method chaining.
   */
  setHttpReqDuration(conditions) {
    this.thresholds["http_req_duration"] = conditions;
    return this;
  }
  /**
   * Sets a threshold for the HTTP request failure rate.
   * Ensures that the rate of failed requests remains below a certain percentage.
   *
   * @param conditions - Array of conditions, e.g., ['rate<0.01'] to ensure less than 1% of requests fail.
   * @returns This ThresholdsConfig instance for method chaining.
   */
  setHttpReqFailed(conditions) {
    this.thresholds["http_req_failed"] = conditions;
    return this;
  }
  /**
   * Sets a threshold for the number of virtual users (VUs).
   * Used to ensure a certain number of VUs are maintained or used during the test.
   *
   * @param conditions - Array of conditions, e.g., ['max>=50'] to ensure at least 50 VUs are running at peak.
   * @returns This ThresholdsConfig instance for method chaining.
   */
  setVUs(conditions) {
    this.thresholds["vus"] = conditions;
    return this;
  }
  /**
   * Sets a threshold for the total number of HTTP requests.
   * This is useful for ensuring a minimum or maximum request rate.
   *
   * @param conditions - Array of conditions, e.g., ['count>1000'] to ensure at least 1000 HTTP requests are made.
   * @returns This ThresholdsConfig instance for method chaining.
   */
  setHttpReqRate(conditions) {
    this.thresholds["http_reqs"] = conditions;
    return this;
  }
  /**
   * Sets a threshold for the duration of test iterations.
   * Ensures that each iteration completes within a certain time frame.
   *
   * @param conditions - Array of conditions, e.g., ['p(95)<1000'] to ensure the 95th percentile iteration duration is below 1000ms.
   * @returns This ThresholdsConfig instance for method chaining.
   */
  setIterationDuration(conditions) {
    this.thresholds["iteration_duration"] = conditions;
    return this;
  }
  /**
   * Sets a threshold for the amount of data sent.
   * Ensures that the total data sent during the test stays within certain limits.
   *
   * @param conditions - Array of conditions, e.g., ['sum<50MB'] to ensure no more than 50MB of data is sent.
   * @returns This ThresholdsConfig instance for method chaining.
   */
  setDataSent(conditions) {
    this.thresholds["data_sent"] = conditions;
    return this;
  }
  /**
   * Sets a threshold for the amount of data received.
   * Ensures that the total data received during the test stays within certain limits.
   *
   * @param conditions - Array of conditions, e.g., ['sum<100MB'] to ensure no more than 100MB of data is received.
   * @returns This ThresholdsConfig instance for method chaining.
   */
  setDataReceived(conditions) {
    this.thresholds["data_received"] = conditions;
    return this;
  }
  /**
   * Sets a threshold for any custom metric.
   * Custom thresholds allow you to define performance goals based on metrics you track manually during the test.
   *
   * @param metric - The name of the custom metric (e.g., 'my_custom_metric').
   * @param conditions - Array of conditions, e.g., ['avg<200'] to ensure the average value of the custom metric stays below 200.
   * @returns This ThresholdsConfig instance for method chaining.
   */
  setCustomThreshold(metric, conditions) {
    this.thresholds[metric] = conditions;
    return this;
  }
  /**
   * Builds and returns the final thresholds object.
   * This method should be called after all thresholds are set and returns the configuration to be used in the k6 test options.
   *
   * @returns The final object containing all thresholds.
   */
  build() {
    return this.thresholds;
  }
};

// src/config/k6-config.ts
var K6Config = class {
  constructor() {
    this.config = {
      hosts: {},
      // Initialize empty hosts object
      thresholds: {},
      // Initialize empty thresholds object
      noConnectionReuse: false,
      // By default, allow connection reuse
      userAgent: "",
      // Default to no user-agent
      insecureSkipTLSVerify: false,
      // Default to requiring TLS verification
      throw: false,
      // Do not throw exceptions by default
      scenarios: {}
      // Initialize empty scenarios object
    };
  }
  /**
   * Sets the hosts mapping for load testing multiple endpoints.
   * Useful for mapping domain names to IP addresses in load tests.
   *
   * @param hosts - Object containing host mappings (e.g., { "my-api.com": "192.168.0.1" }).
   * @returns This K6Config instance for method chaining.
   */
  setHosts(hosts) {
    this.config.hosts = hosts;
    return this;
  }
  /**
   * Sets the thresholds for performance metrics, allowing you to enforce performance goals.
   * You can either pass a plain object or use the ThresholdsConfig class.
   *
   * @param thresholds - An object or a ThresholdsConfig instance defining the thresholds.
   * @returns This K6Config instance for method chaining.
   */
  setThresholds(thresholds) {
    if (thresholds instanceof ThresholdsConfig) {
      this.config.thresholds = thresholds.build();
    } else {
      this.config.thresholds = thresholds;
    }
    return this;
  }
  /**
   * Enables or disables connection reuse across HTTP requests.
   * Disabling connection reuse might be useful for certain testing scenarios where new connections are required for each request.
   *
   * @param reuse - Boolean to enable (true) or disable (false) connection reuse.
   * @returns This K6Config instance for method chaining.
   */
  setConnectionReuse(reuse) {
    this.config.noConnectionReuse = !reuse;
    return this;
  }
  /**
   * Sets a custom user-agent string for the requests.
   *
   * @param userAgent - A custom string to use as the User-Agent header in requests.
   * @returns This K6Config instance for method chaining.
   */
  setUserAgent(userAgent) {
    this.config.userAgent = userAgent;
    return this;
  }
  /**
   * Enables or disables skipping of TLS verification (useful for testing against self-signed certificates).
   *
   * @param skipVerify - Boolean to enable (true) or disable (false) TLS verification.
   * @returns This K6Config instance for method chaining.
   */
  setInsecureSkipTLSVerify(skipVerify) {
    this.config.insecureSkipTLSVerify = skipVerify;
    return this;
  }
  /**
   * Defines a grace period before the test fully stops, allowing VUs to finish their current iteration.
   *
   * @param duration - The grace period duration (e.g., '30s').
   * @returns This K6Config instance for method chaining.
   * @throws Error - Throws an error if the duration is not in a valid format.
   */
  setGracefulStop(duration) {
    if (!/^\d+(ms|s|m|h|d)$/.test(duration)) {
      throw new Error("Invalid duration format for gracefulStop");
    }
    this.config.gracefulStop = duration;
    return this;
  }
  /**
   * Enables or disables throwing exceptions when certain errors occur.
   * This can be useful for stricter error handling during the load test.
   *
   * @param enable - Boolean to enable (true) or disable (false) throwing exceptions.
   * @returns This K6Config instance for method chaining.
   */
  enableThrow(enable = true) {
    this.config.throw = enable;
    return this;
  }
  /**
   * Adds a single scenario to the test configuration.
   * Scenarios define how virtual users (VUs) behave during the load test.
   *
   * @param scenario - An instance of ScenarioConfig that defines the scenario configuration.
   * @returns This K6Config instance for method chaining.
   */
  addScenario(scenario) {
    Object.assign(this.config.scenarios, scenario.build());
    return this;
  }
  /**
   * Adds multiple scenarios to the test configuration at once.
   * Each scenario controls the behavior of VUs in different parts of the test.
   *
   * @param scenarios - An array of ScenarioConfig instances defining the scenario configurations.
   * @returns This K6Config instance for method chaining.
   */
  setScenarios(scenarios) {
    scenarios.forEach((scenario) => {
      Object.assign(this.config.scenarios, scenario.build());
    });
    return this;
  }
  /**
   * Builds and returns the final k6 test configuration object.
   * If scenarios are defined, it removes top-level VU, duration, and stages to prevent conflicts.
   *
   * @returns The final k6 configuration object to be used in the k6 test.
   */
  build() {
    if (Object.keys(this.config.scenarios).length > 0) {
      delete this.config.vus;
      delete this.config.duration;
      delete this.config.stages;
    }
    return this.config;
  }
  /**
   * Sets a single arbitrary option key-value pair for the k6 test configuration.
   *
   * @param key - The option key.
   * @param value - The value for the option.
   * @returns This K6Config instance for method chaining.
   */
  setOption(key, value) {
    this.config[key] = value;
    return this;
  }
  /**
   * Sets multiple arbitrary options at once by merging a partial object into the current configuration.
   *
   * @param options - A partial object containing the key-value pairs of options to be set.
   * @returns This K6Config instance for method chaining.
   */
  setOptions(options2) {
    Object.assign(this.config, options2);
    return this;
  }
};

// src/config/scenario-config.ts
var ScenarioConfig = class {
  /**
   * Constructor to initialize a scenario configuration with a given name.
   *
   * @param scenarioName - The name of the scenario being configured.
   */
  constructor(scenarioName) {
    this.config = {};
    this.scenarioName = scenarioName;
  }
  /**
   * Sets the type of executor for the scenario.
   * Executors define how VUs behave during the test, such as `constant-vus`, `ramping-vus`, or `constant-arrival-rate`.
   *
   * @param executor - The name of the executor (e.g., 'constant-vus', 'ramping-vus', 'constant-arrival-rate').
   * @returns This scenario config instance for method chaining.
   */
  setExecutor(executor) {
    this.config.executor = executor;
    return this;
  }
  /**
   * Sets the number of virtual users (VUs) for the scenario.
   * Used primarily with `constant-vus` and `per-vu-iterations` executors.
   *
   * @param vus - Number of virtual users.
   * @returns This scenario config instance for method chaining.
   */
  setVUs(vus) {
    this.config.vus = vus;
    return this;
  }
  /**
   * Sets the duration for how long the scenario should run.
   * Commonly used with `constant-vus`, `constant-arrival-rate`, or `ramping-vus`.
   *
   * @param duration - Duration in time format (e.g., '30s', '5m').
   * @returns This scenario config instance for method chaining.
   */
  setDuration(duration) {
    this.config.duration = duration;
    return this;
  }
  /**
   * Sets the number of iterations each VU should run during the scenario.
   * Primarily used with `per-vu-iterations` executor, where each VU runs a set number of iterations.
   *
   * @param iterations - Number of iterations.
   * @returns This scenario config instance for method chaining.
   */
  setIterations(iterations) {
    this.config.iterations = iterations;
    return this;
  }
  /**
   * Sets a graceful stop duration, which defines how long the test will wait for ongoing VU iterations to complete before fully stopping.
   * Useful to ensure VUs finish their work gracefully before ending the scenario.
   *
   * @param duration - Graceful stop duration (e.g., '30s').
   * @returns This scenario config instance for method chaining.
   */
  setGracefulStop(duration) {
    this.config.gracefulStop = duration;
    return this;
  }
  /**
   * Specifies the function to execute in this scenario.
   * This is the k6 function that contains the actual testing logic to be run by each VU.
   *
   * @param execFunctionName - The name of the function to be executed.
   * @returns This scenario config instance for method chaining.
   */
  setExec(execFunctionName) {
    this.config.exec = execFunctionName;
    return this;
  }
  /**
   * Configures a scenario to run with a constant number of VUs for a specified duration.
   * Commonly used for steady-state testing where a fixed number of users is simulated.
   *
   * @param vus - Number of VUs.
   * @param duration - Duration for which the VUs should run.
   * @returns This scenario config instance for method chaining.
   */
  useConstantVUs(vus, duration) {
    this.config.executor = "constant-vus";
    this.config.vus = vus;
    this.config.duration = duration;
    return this;
  }
  /**
   * Configures a scenario to use a ramping pattern of VUs, where the number of VUs increases or decreases over time.
   * Commonly used for tests that need to gradually apply or reduce load.
   *
   * @param stages - An array of objects, each specifying a `duration` and a `target` number of VUs for that stage.
   * @returns This scenario config instance for method chaining.
   */
  useRampingVUs(stages) {
    this.config.executor = "ramping-vus";
    this.config.stages = stages;
    return this;
  }
  /**
   * Configures a scenario where each VU runs a specified number of iterations.
   * Each VU will execute the given number of iterations, and the scenario will terminate once all VUs have completed.
   *
   * @param vus - Number of VUs.
   * @param iterations - Number of iterations each VU will run.
   * @param maxDuration - Optional maximum duration allowed for the scenario.
   * @returns This scenario config instance for method chaining.
   */
  usePerVUIterations(vus, iterations, maxDuration = "10m") {
    this.config.executor = "per-vu-iterations";
    this.config.vus = vus;
    this.config.iterations = iterations;
    this.config.maxDuration = maxDuration;
    return this;
  }
  /**
   * Configures a scenario to use a constant arrival rate, which means a fixed number of iterations will be executed per time unit, regardless of the number of VUs.
   * Useful for scenarios that need to test the system's behavior under a specific number of requests per second.
   *
   * @param rate - Number of iterations to execute per time unit (e.g., 5 iterations per second).
   * @param duration - How long the scenario should run.
   * @param preAllocatedVUs - Number of VUs to pre-allocate to handle the load.
   * @param maxVUs - Maximum number of VUs that can be allocated.
   * @param timeUnit - The time unit for the rate (e.g., '1s' for per second).
   * @returns This scenario config instance for method chaining.
   */
  userConstantArrivalRate(rate, duration, preAllocatedVUs, maxVUs = preAllocatedVUs, timeUnit = "1s") {
    this.config.executor = "constant-arrival-rate";
    this.config.rate = rate;
    this.config.timeUnit = timeUnit;
    this.config.duration = duration;
    this.config.preAllocatedVUs = preAllocatedVUs;
    this.config.maxVUs = maxVUs;
    return this;
  }
  /**
   * Builds and returns the scenario configuration object.
   * This method should be called after setting all scenario parameters to return the final config object.
   *
   * @returns The final scenario configuration object to be used in the k6 test options.
   */
  build() {
    return { [this.scenarioName]: this.config };
  }
};

// src/util/data-provider.ts
import { SharedArray } from "k6/data";
import papaparse from "https://jslib.k6.io/papaparse/5.1.1/index.js";
var DataProvider = class {
  // Stores the loaded data (array of generic type T)
  /**
   * Constructs the DataProvider and loads data using the provided file path.
   * @param name - A unique name used to identify the shared data.
   * @param filePath - The path to the data file (JSON or CSV).
   */
  constructor(name, filePath) {
    this.data = new SharedArray(name, () => this.loadData(filePath));
  }
  /**
   * Loads data from the given file path. Supports both JSON and CSV file formats.
   * @param filePath - The path to the file containing test data (must be .json or .csv).
   * @returns An array of the loaded data.
   */
  loadData(filePath) {
    const fileContent = open(filePath);
    if (filePath.endsWith(".json")) {
      return JSON.parse(fileContent);
    } else if (filePath.endsWith(".csv")) {
      const parsedData = papaparse.parse(fileContent, {
        header: true,
        // Assuming CSV files have headers
        skipEmptyLines: true
        // Ignore empty lines in the CSV file
      });
      return parsedData.data;
    } else {
      throw new Error("Unsupported file format. Only JSON and CSV are supported.");
    }
  }
  /**
   * Gets all data entries.
   * @returns The entire data array.
   */
  getAll() {
    return this.data;
  }
  /**
   * Gets a random item from the data array.
   * @returns A randomly selected data item from the array.
   */
  getRandomItem() {
    const index = Math.floor(Math.random() * this.data.length);
    return this.data[index];
  }
  /**
   * Gets a specific item by index from the data array.
   * @param index - The index of the item in the array.
   * @returns The data item at the specified index.
   */
  getItem(index) {
    return this.data[index];
  }
  /**
   * Gets the length of the data array.
   * @returns The number of items in the array.
   */
  getLength() {
    return this.data.length;
  }
};

// src/clients/api-client.ts
import http from "k6/http";
var APIClient = class {
  // Request parameters
  /**
   * Constructs the APIClient with a method and URL.
   * @param method - HTTP method (e.g., 'GET', 'POST')
   * @param url - The target URL for the request
   * @throws Error - If the method is not a valid HTTP method
   */
  constructor(method, url) {
    // Target URL for the request
    this.body = null;
    // Request body (can be JSON, URL-encoded form, or string)
    this.params = {};
    const allowedMethods = ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"];
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
  setBody(body) {
    if (typeof body === "object") {
      if (this.params.headers && this.params.headers["Content-Type"] === "application/x-www-form-urlencoded") {
        this.body = Object.keys(body).map((key) => encodeURIComponent(key) + "=" + encodeURIComponent(body[key])).join("&");
      } else {
        this.body = JSON.stringify(body);
        if (!this.params.headers || !this.params.headers["Content-Type"]) {
          this.setContentType("application/json");
        }
      }
    } else {
      this.body = body;
    }
    return this;
  }
  /**
   * Adds the 'Content-Type' header to the request.
   * @param contentType - The content type (e.g., 'application/json')
   * @returns This APIClient instance for method chaining
   */
  setContentType(contentType) {
    this.setHeader("Content-Type", contentType);
    return this;
  }
  /**
   * Sets the 'Authorization' header with a Bearer token.
   * @param token - The Bearer token to include in the header
   * @returns This APIClient instance for method chaining
   */
  setAuthorization(token) {
    this.setHeader("Authorization", `Bearer ${token}`);
    return this;
  }
  /**
   * Sets the 'Accept' header, which defines the types of content that are acceptable for the response.
   * @param acceptType - MIME type (e.g., 'application/json')
   * @returns This APIClient instance for method chaining
   */
  setAccept(acceptType) {
    this.setHeader("Accept", acceptType);
    return this;
  }
  // Other utility methods to set common headers (Accept-Language, Cookie, User-Agent, etc.)
  /**
   * Sets a custom header for the request.
   * @param headerName - The name of the header
   * @param headerValue - The value for the header
   * @returns This APIClient instance for method chaining
   */
  setCustomHeader(headerName, headerValue) {
    this.setHeader(headerName, headerValue);
    return this;
  }
  /**
   * Sets a header in the request.
   * @param header - The name of the header
   * @param value - The value of the header
   */
  setHeader(header, value) {
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
  setParam(paramName, value) {
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
};

// src/util/form-encoder.ts
var FormEncoder = class {
  /**
   * Encodes an object into URL-encoded form data (application/x-www-form-urlencoded).
   * This format is often used in HTTP POST requests for form submissions.
   * @param data - An object where the keys and values represent form fields and their values.
   * @returns A URL-encoded string.
   */
  static encodeToUrlEncodedForm(data) {
    return Object.keys(data).map((key) => `${encodeURIComponent(key)}=${encodeURIComponent(data[key])}`).join("&");
  }
};

// src/api-service/nop-commerce-service/nop-commerce-api.ts
var BASEURL = "http://localhost:5000";
var LOGIN_ENDPOINT = "/login?returnurl=%2F";
var REGISTER_ENDPOINT = "/register?returnurl=%2F";
var ADD_TO_CART_ENDPOINT = "/addproducttocart/details/{}/1";
var BROWSE_PRODUCT_ENDPOINT = "/{}";
var NopCommerceAPI = class {
  // Extract request verification token
  extractRequestVerificationToken(html) {
    const tokenRegex = /<input[^>]*name="__RequestVerificationToken"[^>]*value="([^"]*)"/;
    const match = html.match(tokenRegex);
    return match ? match[1] : null;
  }
  // Register an account
  register(account) {
    const url = `${BASEURL}${REGISTER_ENDPOINT}`;
    const registerGetResponse = new APIClient("GET", url).send();
    var token = this.extractRequestVerificationToken(registerGetResponse.body.toString());
    const payload = {
      Gender: "M",
      FirstName: account.firstName,
      LastName: account.lastName,
      Email: account.email,
      Company: "TestCompany",
      Password: account.password,
      ConfirmPassword: account.password,
      "register-button": "",
      __RequestVerificationToken: token
    };
    return new APIClient("POST", url).setContentType("application/x-www-form-urlencoded").setBody(payload).send();
  }
  // Login
  login(account) {
    const url = `${BASEURL}${LOGIN_ENDPOINT}`;
    const loginGetResponse = new APIClient("GET", url).send();
    var token = this.extractRequestVerificationToken(loginGetResponse.body.toString());
    const payload = {
      Email: account.email,
      Password: account.password,
      "__RequestVerificationToken": token
    };
    const response = new APIClient("POST", url).setContentType("application/x-www-form-urlencoded").setBody(payload).send();
    return response;
  }
  // Browse a product and extract the request verification token
  browseProducts(product) {
    const url = `${BASEURL}${BROWSE_PRODUCT_ENDPOINT.replace("{}", convertToUrlForm(product.name))}`;
    const response = new APIClient("GET", url).send();
    const token = this.extractRequestVerificationToken(response.body);
    return token;
  }
  // Add a product to the cart
  addToCart(product, token) {
    const url = `${BASEURL}${ADD_TO_CART_ENDPOINT.replace("{}", product.id.toString())}`;
    const payload = FormEncoder.encodeToUrlEncodedForm({
      EnteredQuantity: "2",
      __RequestVerificationToken: token
    });
    const response = new APIClient("POST", url).setContentType("application/x-www-form-urlencoded; charset=UTF-8").setBody(payload).send();
    return response;
  }
};
function convertToUrlForm(productName) {
  return productName.toLowerCase().replace(/[^a-z0-9\s-]/g, "").replace(/\s*-\s*/g, "-").replace(/\s+/g, "-").trim();
}

// src/clients/response-check.ts
import { expect } from "https://jslib.k6.io/k6chaijs/4.3.4.3/index.js";
var ResponseCheck = class {
  /**
   * Constructs the ResponseCheck instance with the response object and an optional message.
   * @param response - The HTTP response to validate
   * @param msg - Optional message to log along with validations
   */
  constructor(response, msg) {
    this.response = response;
    this.msg = msg || "";
  }
  /**
   * Validates the response status code against the expected status.
   * @param expectedStatus - The expected HTTP status code (e.g., 200 for OK)
   * @param msg - Optional message for logging
   * @returns This ResponseCheck instance for method chaining
   */
  status(expectedStatus, msg) {
    expect(this.response.status, msg || this.msg).to.equal(expectedStatus);
    return this;
  }
  /**
   * Checks if a specific header is present and optionally validates its value.
   * @param headerName - The name of the header (e.g., 'Content-Type')
   * @param expectedValue - The expected value of the header
   * @returns This ResponseCheck instance for method chaining
   */
  header(headerName, expectedValue) {
    expect(this.response.headers, `header ${headerName}`).to.have.property(headerName);
    if (expectedValue !== void 0) {
      expect(this.response.headers[headerName], `header ${headerName}`).to.include(expectedValue);
    }
    return this;
  }
  /**
   * Checks if the response body contains a specific string.
   * @param searchString - The string to search for in the response body
   * @returns This ResponseCheck instance for method chaining
   */
  bodyContains(searchString) {
    expect(this.response.body, "response body").to.include(searchString);
    return this;
  }
  // Utility methods for logging response details (Status, Headers, Body, etc.)
  showStatus() {
    console.log(`Status: ${this.response.status}`);
    return this;
  }
  showHeaders() {
    console.log(`Headers: ${JSON.stringify(this.response.headers, null, 2)}`);
    return this;
  }
  showBody() {
    console.log(`Body: ${this.response.body}`);
    return this;
  }
  showError() {
    console.log(`Error: ${this.response.error}`);
    return this;
  }
  showErrorCode() {
    console.log(`Error Code: ${this.response.error_code}`);
    return this;
  }
  showDuration() {
    console.log(`Duration: ${this.response.timings.duration}ms`);
    return this;
  }
  showStatusText() {
    console.log(`Status Text: ${this.response.status_text}`);
    return this;
  }
  /**
   * Validates the response body against a JSON schema (if applicable).
   * @param schema - The JSON schema to validate the response against
   * @returns This ResponseCheck instance for method chaining
   */
  jsonSchema(schema) {
    const data = this.response.json();
    expect(data).to.be.jsonSchema(schema);
    return this;
  }
  /**
   * Validates that the response time is less than the specified threshold.
   * @param thresholdMs - The threshold in milliseconds (e.g., 500 for 500ms)
   * @returns This ResponseCheck instance for method chaining
   */
  responseTimeLessThan(thresholdMs) {
    expect(this.response.timings.duration, "response time").to.be.below(thresholdMs);
    return this;
  }
};

// src/tests/add-to-cart.test.ts
var accounts = new DataProvider("accounts", "../../src/test-data/accounts.json");
var products = new DataProvider("products", "../../src/test-data/products.json");
var addingScenario = new ScenarioConfig("adding-products").usePerVUIterations(10, 5).setExec("addToCartTest");
var options = new K6Config().addScenario(addingScenario).build();
function addToCartTest() {
  const nopCommerceAPI = new NopCommerceAPI();
  const user = accounts.getItem((__VU - 1) % accounts.getLength());
  var resLogin = nopCommerceAPI.login(user);
  new ResponseCheck(resLogin, "Login successfully").status(200);
  sleep(1);
  const product = products.getRandomItem();
  const tokenProduct = nopCommerceAPI.browseProducts(product);
  const addProductFlag = Math.random() < 0.5;
  if (addProductFlag) {
    const resAddToCart = nopCommerceAPI.addToCart(product, tokenProduct);
    new ResponseCheck(resAddToCart, `Add product ${product.name} to cart successfully`).status(200);
    console.log(`Iteration ${__ITER + 1} - User: ${user.email} - Product: ${product.name} - ADDED to cart`);
    return;
  }
  console.log(`Iteration ${__ITER + 1} - User: ${user.email} - Product: ${product.name} - SKIPPED`);
  sleep(1);
}
export {
  addToCartTest,
  options
};
