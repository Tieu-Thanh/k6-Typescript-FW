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

// src/tests/create-crocodile.test.ts
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

// src/api-service/test-k6-service/test-api-k6.ts
var BASEURL = "https://test-api.k6.io/";
var REGISTER_ENDPOINT = "user/register/";
var LOGIN_ENDPOINT = "auth/basic/login/";
var CROCODILE_ENDPOINT = "my/crocodiles/";
var TestK6API = class {
  register(account) {
    const url = `${BASEURL}${REGISTER_ENDPOINT}`;
    return new APIClient("POST", url).setContentType("application/json").setBody(account).send();
  }
  login(creadential) {
    const url = `${BASEURL}${LOGIN_ENDPOINT}`;
    return new APIClient("POST", url).setContentType("application/json").setBody(creadential).send();
  }
  // Method to create a new crocodile
  createCrocodile(crocodile, token = "") {
    const url = `${BASEURL}${CROCODILE_ENDPOINT}`;
    const payload = {
      name: crocodile.name,
      sex: crocodile.sex,
      date_of_birth: crocodile.date_of_birth
    };
    return new APIClient("POST", url).setContentType("application/json").setBody(payload).send();
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
    console.log(`Status: ${this.response.error_code}`);
    return this;
  }
  showDuration() {
    console.log(`Duration: ${this.response.timings.duration}`);
    return this;
  }
  showStatusText() {
    console.log(`Status Text: ${this.response.status_text}`);
    return this;
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
  setThresholds(thresholds) {
    if (thresholds instanceof ThresholdsConfig) {
      this.config.thresholds = thresholds.build();
    } else {
      this.config.thresholds = thresholds;
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
  usePerVUIterations(vus, iterations, maxDuration = "10m") {
    this.config.executor = "per-vu-iterations";
    this.config.vus = vus;
    this.config.iterations = iterations;
    this.config.maxDuration = maxDuration;
    return this;
  }
  build() {
    return { [this.scenarioName]: this.config };
  }
};

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

// src/tests/create-crocodile.test.ts
var credentials = new DataProvider("credentials", "../../src/test-data/credentials.json");
var createCrocodile = new ScenarioConfig("iteratingly-creating-crocodiles").usePerVUIterations(10, 5, "30s").setExec("createCrocodileTest");
var options = new K6Config().addScenario(createCrocodile).build();
function createCrocodileTest() {
  const testK6API = new TestK6API();
  const credential = credentials.getItem(0);
  var resLogin = testK6API.login(credential);
  new ResponseCheck(resLogin, "Login successfully").status(200);
  var crocodile = {
    id: "",
    name: "CrocMaster",
    sex: "M",
    // M for Male, F for Female
    date_of_birth: "2020-05-05",
    age: ""
  };
  var resCreateCrocodile = testK6API.createCrocodile(crocodile);
  new ResponseCheck(resCreateCrocodile, "Create Crocodile successfully").showBody().bodyContains("You have already reached the limit.");
  sleep(1);
}
export {
  createCrocodileTest,
  options
};
