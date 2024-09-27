# k6 Framework in TypeScript

This repository contains a load testing framework using [k6](https://k6.io/) built with TypeScript. This framework allows for writing and executing performance tests on various endpoints.

For demonstration, the project implements test scripts on NopCommerce and the Test K6 API with the scenarios described below.

---

## Table of Contents
1. [Scenarios](#scenarios)
2. [Project Structure](#project-structure)
3. [Dependencies](#dependencies)
4. [Prerequisites](#prerequisites)
5. [Setup Data for Tests](#setup-data-for-tests)
6. [Build and Run](#build-and-run)

---

## Scenarios

### 1. `register-nopcommerce.test.ts`:
   - Simulates 5 concurrent users registering new accounts on NopCommerce.
   - **Ramp up**: 10 seconds to 5 users.
   - **Loading time**: 1 minute.
   - **Ramp down**: 10 seconds.

### 2. `add-to-cart.test.ts`:
   - Simulates 10 concurrent users logging in and browsing products.
   - Some users add products to the shopping cart.
   - Each user runs 5 iterations.

### 3. `register-test-k6.test.ts`:
   - Simulates 5 concurrent users registering new accounts on [this site](https://test-api.k6.io/).
   - Runs for a total of 5 iterations only.

### 4. `create-crocodile.test.ts`:
   - Simulates 10 concurrent users logging in and creating new records (crocodiles).
   - Users log out after creating records.
   - **Rate**: 5 iterations per second.
   - **Loading time**: 30 seconds.

### TODO:
- Refactor/clean up class definitions.
- Handle parallel runs.
- Allow subdirectories in `/tests`.

---

## Project Structure

- **src/**: Contains the source files, including all test cases written in TypeScript.
  - **api-service/**: Contains services for interacting with external APIs.
    - **nop-commerce-service/**: Service for interacting with the NopCommerce API.
    - **test-api-k6.ts**: Service for interacting with the test API using the `APIClient` class.

  - **clients/**: Contains reusable client components.
    - **api-client.ts**:
      - Manages HTTP requests using k6.
      - Key methods:
        - **`setBody()`**: Sets the request body, supporting JSON and URL-encoded formats.
        - **`setHeader()`**: Allows setting common headers like `Content-Type` and `Authorization`.
        - **`send()`**: Executes the configured HTTP request.

    - **response-check.ts**:
      - Provides tools for validating and checking HTTP responses in k6 tests.
      - Key methods:
        - **`status()`**: Verifies the response status code.
        - **`header()`**: Checks for the presence and value of specific headers.
        - **`show*()` methods**: Logs the status, headers, and other response details.
        - **`jsonSchema()`**: Validates the response against a given JSON schema.

  - **config/**: Contains configuration classes for scenarios and thresholds in k6 tests.
    - **k6-config.ts**:
      - Provides methods to configure virtual users (VUs), durations, scenarios, thresholds, etc.
      - Key methods:
        - **`setHosts()`**: Sets host mapping for load testing.
        - **`addScenario()`**: Adds scenarios to the configuration.
        - **`build()`**: Finalizes the configuration.

    - **scenario-config.ts**:
      - Defines load scenarios, such as how many virtual users are used, iterations, and durations.
      - Key methods:
        - **`useConstantVUs()`**: Defines a scenario with a constant number of virtual users.
        - **`usePerVUIterations()`**: Defines a scenario with a specific number of iterations per VU.
        - **`userConstantArrivalRate()`**: Defines a scenario where iterations arrive at a constant rate.

    - **threshold-config.ts**:
      - Defines performance thresholds like request durations, failure rates, etc.
      - Key methods:
        - **`setHttpReqDuration()`**: Sets a threshold for request duration.
        - **`setHttpReqFailed()`**: Sets a threshold for failed requests.
        - **`build()`**: Builds the thresholds object for use in the k6 configuration.

  - **data-objects/**: Contains TypeScript interfaces defining data structures used in tests.
    - Example: **account-dto.ts** defines the structure of account-related data (e.g., username, email, password).

  - **test-data/**: Stores test data files (e.g., JSON or CSV) used in the test scenarios.
    - Example: **accounts.json** contains predefined user accounts for registration tests.

  - **util/**: Contains utility functions to assist in testing.
    - **data-provider.ts**:
      - Loads and manages data from JSON or CSV files using `SharedArray`.
      - Provides methods to retrieve data randomly or by index.

    - **form-encoder.ts**:
      - Converts objects into a URL-encoded string suitable for form submissions.
      - Encodes key-value pairs using `encodeURIComponent()` to handle special characters.

---

## Dependencies

The project uses the following key dependencies:

- **k6**: The main load testing tool.
- **typescript**: Allows writing test cases in TypeScript.
- **@types/k6**: Type definitions for k6.
- **eslint**: Linting and enforcing code quality.
- **prettier**: Code formatting tool.
- **ts-node**: Runs TypeScript files directly.
- **rimraf**: Cleans directories like `dist` before rebuilding.

You can find all dependencies listed in the `package.json` file.

---

## Prerequisites

Make sure you have the following installed:

- **Node.js** (v16.x or higher)
- **npm** or **yarn** (to install dependencies)

---

## Setup Data for Tests

To run the tests, you need to prepare some data in the form of JSON files. Below is the structure of the required data for each test.

### 1. **credentials.json** (for login tests):

```json
[
    {
        "username": "******",
        "password": "********"
    }
]
```

### 2. **accounts.json** (for registration tests):

```json
[
    {
        "userName": "******",
        "firstName": "******",
        "lastName": "******",
        "email": "**********@example.com",
        "password": "********"
    },
    {
        "userName": "******",
        "firstName": "******",
        "lastName": "******",
        "email": "**********@example.com",
        "password": "********"
    }
    // Add more accounts as needed...
]
```

**Note**: The sensitive information in this data has been masked. Be sure to replace the placeholders (like `******`) with actual data before running tests.

---

## Build and Run

### Name test script
Test scripts should follow the naming convention: `[name].test.ts`.

### To Build
Run the following command to compile the TypeScript files into JavaScript:
```bash
yarn build
```

### To Run Tests
Run a single test script using:
```bash
yarn run-tests <script-name>
```

For example, to run a test script named `register-nopcommerce.test.ts`:
```bash
yarn run-tests register-nopcommerce
```

To run multiple test scripts at once:
```bash
yarn run-tests <script1> <script2> <script3>
```

If a test file is not found:
```bash
Test file "nonexist.test.ts" does not exist in src/tests/
```
