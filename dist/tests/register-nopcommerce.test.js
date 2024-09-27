var __defProp = Object.defineProperty;
var __getOwnPropSymbols = Object.getOwnPropertySymbols;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __propIsEnum = Object.prototype.propertyIsEnumerable;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __spreadValues = (a, b) => {
  for (var prop in b || (b = {}))
    if (__hasOwnProp.call(b, prop))
      __defNormalProp(a, prop, b[prop]);
  if (__getOwnPropSymbols)
    for (var prop of __getOwnPropSymbols(b)) {
      if (__propIsEnum.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    }
  return a;
};

// src/tests/register-nopcommerce.test.ts
import { sleep } from "k6";

// src/clients/api-client.ts
import http from "k6/http";
var APIClient = class {
  constructor(method, url) {
    this.body = null;
    this.params = {};
    const allowedMethods = ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"];
    if (!allowedMethods.includes(method.toUpperCase())) {
      throw new Error(`Invalid HTTP method: ${method}`);
    }
    this.method = method.toUpperCase();
    this.url = url;
  }
  // Accepts both JSON objects and strings
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
  // Add common headers
  setContentType(contentType) {
    this.setHeader("Content-Type", contentType);
    return this;
  }
  setAuthorization(token) {
    this.setHeader("Authorization", `Bearer ${token}`);
    return this;
  }
  setAccept(acceptType) {
    this.setHeader("Accept", acceptType);
    return this;
  }
  setAcceptLanguage(language) {
    this.setHeader("Accept-Language", language);
    return this;
  }
  setCookie(cookie) {
    this.setHeader("Cookie", cookie);
    return this;
  }
  setUserAgent(agent) {
    this.setHeader("User-Agent", agent);
    return this;
  }
  setCustomHeader(headerName, headerValue) {
    this.setHeader(headerName, headerValue);
    return this;
  }
  // Generic method to set a header
  setHeader(header, value) {
    if (!this.params.headers) {
      this.params.headers = {};
    }
    this.params.headers[header] = value;
  }
  // Set multiple headers at once
  setHeaders(headers) {
    if (!this.params.headers) {
      this.params.headers = {};
    }
    this.params.headers = __spreadValues(__spreadValues({}, this.params.headers), headers);
    return this;
  }
  // Set any custom parameters (e.g., redirects, query params)
  setParam(paramName, value) {
    this.params[paramName] = value;
    return this;
  }
  // Set multiple params at once
  setParams(params) {
    this.params = __spreadValues(__spreadValues({}, this.params), params);
    return this;
  }
  // Execute the HTTP request
  send() {
    return http.request(this.method, this.url, this.body, this.params);
  }
};

// src/util/form-encoder.ts
var FormEncoder = class {
  static encodeToUrlEncodedForm(data) {
    return Object.keys(data).map((key) => `${encodeURIComponent(key)}=${encodeURIComponent(data[key])}`).join("&");
  }
};

// src/clients/response-check.ts
import { expect } from "https://jslib.k6.io/k6chaijs/4.3.4.3/index.js";
var ResponseCheck = class {
  constructor(response, msg) {
    this.response = response;
    this.msg = msg || "";
  }
  // Check that the status code is equal to expectedStatus
  status(expectedStatus, msg) {
    expect(this.response.status, msg || this.msg).to.equal(expectedStatus);
    return this;
  }
  // Check that the response has a specific header
  header(headerName, expectedValue) {
    expect(this.response.headers, `header ${headerName}`).to.have.property(headerName);
    if (expectedValue !== void 0) {
      expect(this.response.headers[headerName], `header ${headerName}`).to.include(expectedValue);
    }
    return this;
  }
  // Check that the response body contains a string
  bodyContains(searchString) {
    expect(this.response.body, "response body").to.include(searchString);
    return this;
  }
  showResponse() {
    console.log(`Status: ${this.response.status}`);
    console.log(`Headers: ${JSON.stringify(this.response.headers, null, 2)}`);
    console.log(`Body: ${this.response.body}`);
  }
  // Validate the response body against a JSON schema
  jsonSchema(schema) {
    const data = this.response.json();
    expect(data).to.be.jsonSchema(schema);
    return this;
  }
  // Check that the response time is less than a threshold
  responseTimeLessThan(thresholdMs) {
    expect(this.response.timings.duration, "response time").to.be.below(thresholdMs);
    return this;
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
    new ResponseCheck(response, "Login successfully").status(200);
    return response;
  }
  // Browse a product and extract the request verification token
  browseProducts(product) {
    const url = `${BASEURL}${BROWSE_PRODUCT_ENDPOINT.replace("{}", convertToUrlForm(product.name))}`;
    const response = new APIClient("GET", url).send();
    new ResponseCheck(response, `Browse product ${product.name} successfully`).status(200);
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
    new ResponseCheck(response, `Add product ${product.name} to cart successfully`).status(200);
    return response;
  }
};
function convertToUrlForm(productName) {
  return productName.toLowerCase().replace(/[^a-z0-9\s-]/g, "").replace(/\s*-\s*/g, "-").replace(/\s+/g, "-").trim();
}

// src/util/data-provider.ts
import { SharedArray } from "k6/data";
import papaparse from "https://jslib.k6.io/papaparse/5.1.1/index.js";
var DataProvider = class {
  constructor(name, filePath) {
    this.data = new SharedArray(name, () => this.loadData(filePath));
  }
  // Load data based on file type (JSON or CSV)
  loadData(filePath) {
    const fileContent = open(filePath);
    if (filePath.endsWith(".json")) {
      return JSON.parse(fileContent);
    } else if (filePath.endsWith(".csv")) {
      const parsedData = papaparse.parse(fileContent, {
        header: true,
        // Assuming the CSV file has headers
        skipEmptyLines: true
      });
      return parsedData.data;
    } else {
      throw new Error("Unsupported file format. Only JSON and CSV are supported.");
    }
  }
  // Get the entire data array
  getAll() {
    return this.data;
  }
  // Get a random item from the data array
  getRandomItem() {
    const index = Math.floor(Math.random() * this.data.length);
    return this.data[index];
  }
  // Get an item by index
  getItem(index) {
    return this.data[index];
  }
  // Get the number of items in the data array
  getLength() {
    return this.data.length;
  }
};

// src/config/scenario-config.ts
var ScenarioConfig = class {
  constructor(scenarioName) {
    this.config = {};
    this.scenarioName = scenarioName;
  }
  setExecutor(executor) {
    this.config.executor = executor;
    return this;
  }
  setVUs(vus) {
    this.config.vus = vus;
    return this;
  }
  setDuration(duration) {
    this.config.duration = duration;
    return this;
  }
  setIterations(iterations) {
    this.config.iterations = iterations;
    return this;
  }
  setStartTime(startTime) {
    this.config.startTime = startTime;
    return this;
  }
  setGracefulStop(duration) {
    this.config.gracefulStop = duration;
    return this;
  }
  setEnv(envVars) {
    this.config.env = envVars;
    return this;
  }
  setTags(tags) {
    this.config.tags = tags;
    return this;
  }
  setExec(execFunctionName) {
    this.config.exec = execFunctionName;
    return this;
  }
  useConstantVUs(vus, duration) {
    this.config.executor = "constant-vus";
    this.config.vus = vus;
    this.config.duration = duration;
    return this;
  }
  useRampingVUs(stages) {
    this.config.executor = "ramping-vus";
    this.config.stages = stages;
    return this;
  }
  usePerVUIterations(vus, iterations) {
    this.config.executor = "per-vu-iterations";
    this.config.vus = vus;
    this.config.iterations = iterations;
    return this;
  }
  build() {
    return { [this.scenarioName]: this.config };
  }
};

// src/config/threshold-config.ts
var ThresholdsConfig = class {
  constructor() {
    this.thresholds = {};
  }
  // Add a threshold for HTTP request duration with various conditions
  setHttpReqDuration(conditions) {
    this.thresholds["http_req_duration"] = conditions;
    return this;
  }
  // Add a threshold for HTTP request failure rate
  setHttpReqFailed(conditions) {
    this.thresholds["http_req_failed"] = conditions;
    return this;
  }
  // Add a threshold for Virtual Users (VUs)
  setVUs(conditions) {
    this.thresholds["vus"] = conditions;
    return this;
  }
  // Add a threshold for HTTP request rate
  setHttpReqRate(conditions) {
    this.thresholds["http_reqs"] = conditions;
    return this;
  }
  // Add a threshold for iterations duration
  setIterationDuration(conditions) {
    this.thresholds["iteration_duration"] = conditions;
    return this;
  }
  // Add a threshold for data sent
  setDataSent(conditions) {
    this.thresholds["data_sent"] = conditions;
    return this;
  }
  // Add a threshold for data received
  setDataReceived(conditions) {
    this.thresholds["data_received"] = conditions;
    return this;
  }
  // Add a threshold for custom metric
  setCustomThreshold(metric, conditions) {
    this.thresholds[metric] = conditions;
    return this;
  }
  // Build and return the final thresholds object
  build() {
    return this.thresholds;
  }
};

// src/config/k6-config.ts
var K6Config = class {
  constructor() {
    this.config = {
      hosts: {},
      thresholds: {},
      noConnectionReuse: false,
      userAgent: "",
      insecureSkipTLSVerify: false,
      throw: false,
      scenarios: {}
    };
  }
  // Set hosts mapping for load testing different endpoints
  setHosts(hosts) {
    this.config.hosts = hosts;
    return this;
  }
  // Set thresholds, accepting either an object or ThresholdsConfig class
  setThresholds(thresholds2) {
    if (thresholds2 instanceof ThresholdsConfig) {
      this.config.thresholds = thresholds2.build();
    } else {
      this.config.thresholds = thresholds2;
    }
    return this;
  }
  // Enable or disable connection reuse
  setConnectionReuse(reuse) {
    this.config.noConnectionReuse = !reuse;
    return this;
  }
  // Define the user agent for the requests
  setUserAgent(userAgent) {
    this.config.userAgent = userAgent;
    return this;
  }
  // Skip TLS verification (useful for self-signed certs)
  setInsecureSkipTLSVerify(skipVerify) {
    this.config.insecureSkipTLSVerify = skipVerify;
    return this;
  }
  // Set the grace period to allow iterations to finish before stopping
  setGracefulStop(duration) {
    if (!/^\d+(ms|s|m|h|d)$/.test(duration)) {
      throw new Error("Invalid duration format for gracefulStop");
    }
    this.config.gracefulStop = duration;
    return this;
  }
  // Enable throwing exceptions when certain errors occur
  enableThrow(enable = true) {
    this.config.throw = enable;
    return this;
  }
  // Add a scenario
  addScenario(scenario) {
    Object.assign(this.config.scenarios, scenario.build());
    return this;
  }
  // Set multiple scenarios
  setScenarios(scenarios) {
    scenarios.forEach((scenario) => {
      Object.assign(this.config.scenarios, scenario.build());
    });
    return this;
  }
  // Build and return the final configuration object
  build() {
    if (Object.keys(this.config.scenarios).length > 0) {
      delete this.config.vus;
      delete this.config.duration;
      delete this.config.stages;
    }
    return this.config;
  }
  // Set arbitrary options
  setOption(key, value) {
    this.config[key] = value;
    return this;
  }
  // Set multiple options at once
  setOptions(options2) {
    Object.assign(this.config, options2);
    return this;
  }
};

// src/tests/register-nopcommerce.test.ts
var accounts = new DataProvider("accounts", "../../src/test-data/accounts.json");
var rampingVUs = new ScenarioConfig("ramp-up-vus").useRampingVUs([
  { duration: "10s", target: 5 },
  // ramp-up to 5 users in 10 seconds
  { duration: "1m", target: 5 },
  // stay at 5 users for 1 minute
  { duration: "10s", target: 0 }
  // ramp-down to 0 users in 10 seconds
]).setExec("registerNopCommerceTest");
var thresholds = new ThresholdsConfig().setHttpReqDuration(["p(95)<500"]).setHttpReqFailed(["rate<0.01"]);
var options = new K6Config().setThresholds(thresholds).addScenario(rampingVUs).build();
function registerNopCommerceTest() {
  const nopCommerceAPI = new NopCommerceAPI();
  const account = accounts.getItem(__VU % accounts.getLength());
  var response = nopCommerceAPI.register(account);
  new ResponseCheck(response, "Register successfully").status(200);
  sleep(1);
}
export {
  options,
  registerNopCommerceTest
};
