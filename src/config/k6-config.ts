import { ThresholdsConfig } from "./threshold-config";
import { ScenarioConfig } from "./scenario-config";

interface K6Options {
    hosts?: { [key: string]: string };                // Mapping of hosts for load testing different endpoints
    thresholds?: { [key: string]: string[] };         // Thresholds for performance metrics
    noConnectionReuse?: boolean;                      // Disable or enable connection reuse
    userAgent?: string;                               // Custom user-agent for requests
    vus?: number;                                     // Global number of VUs (if no scenarios are defined)
    duration?: string;                                // Global test duration (if no scenarios are defined)
    insecureSkipTLSVerify?: boolean;                  // Skip TLS verification (useful for self-signed certs)
    gracefulStop?: string;                            // Graceful stop duration to allow iterations to finish
    throw?: boolean;                                  // Whether exceptions should be thrown on certain errors
    stages?: Array<{ duration: string; target: number }>; // Stages for ramping VUs if not using scenario-based executors
    scenarios: { [key: string]: any };                // Scenario configurations
    [key: string]: any;                               // Allows additional arbitrary properties
}

export class K6Config {
    private config: K6Options = {
        hosts: {},                                 // Initialize empty hosts object
        thresholds: {},                            // Initialize empty thresholds object
        noConnectionReuse: false,                  // By default, allow connection reuse
        userAgent: '',                             // Default to no user-agent
        insecureSkipTLSVerify: false,              // Default to requiring TLS verification
        throw: false,                              // Do not throw exceptions by default
        scenarios: {},                             // Initialize empty scenarios object
    };

    /**
     * Sets the hosts mapping for load testing multiple endpoints.
     * Useful for mapping domain names to IP addresses in load tests.
     *
     * @param hosts - Object containing host mappings (e.g., { "my-api.com": "192.168.0.1" }).
     * @returns This K6Config instance for method chaining.
     */
    setHosts(hosts: { [key: string]: string }) {
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
    setThresholds(thresholds: { [key: string]: string[] } | ThresholdsConfig) {
        if (thresholds instanceof ThresholdsConfig) {
            this.config.thresholds = thresholds.build();  // Build from ThresholdsConfig
        } else {
            this.config.thresholds = thresholds;          // Directly set thresholds object
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
    setConnectionReuse(reuse: boolean) {
        this.config.noConnectionReuse = !reuse;  // Set noConnectionReuse based on the opposite of reuse
        return this;
    }

    /**
     * Sets a custom user-agent string for the requests.
     *
     * @param userAgent - A custom string to use as the User-Agent header in requests.
     * @returns This K6Config instance for method chaining.
     */
    setUserAgent(userAgent: string) {
        this.config.userAgent = userAgent;
        return this;
    }

    /**
     * Enables or disables skipping of TLS verification (useful for testing against self-signed certificates).
     *
     * @param skipVerify - Boolean to enable (true) or disable (false) TLS verification.
     * @returns This K6Config instance for method chaining.
     */
    setInsecureSkipTLSVerify(skipVerify: boolean) {
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
    setGracefulStop(duration: string) {
        if (!/^\d+(ms|s|m|h|d)$/.test(duration)) {
            throw new Error('Invalid duration format for gracefulStop');
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
    enableThrow(enable: boolean = true) {
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
    addScenario(scenario: ScenarioConfig) {
        Object.assign(this.config.scenarios, scenario.build());  // Merge the scenario configuration into the scenarios object
        return this;
    }

    /**
     * Adds multiple scenarios to the test configuration at once.
     * Each scenario controls the behavior of VUs in different parts of the test.
     *
     * @param scenarios - An array of ScenarioConfig instances defining the scenario configurations.
     * @returns This K6Config instance for method chaining.
     */
    setScenarios(scenarios: ScenarioConfig[]) {
        scenarios.forEach((scenario) => {
            Object.assign(this.config.scenarios, scenario.build());  // Merge each scenario into the scenarios object
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
        // If scenarios are defined, remove top-level vus, duration, and stages to avoid conflicts with scenario-specific settings
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
    setOption(key: keyof K6Options, value: any) {
        this.config[key] = value;
        return this;
    }

    /**
     * Sets multiple arbitrary options at once by merging a partial object into the current configuration.
     *
     * @param options - A partial object containing the key-value pairs of options to be set.
     * @returns This K6Config instance for method chaining.
     */
    setOptions(options: Partial<K6Options>) {
        Object.assign(this.config, options);  // Merge new options into the existing config
        return this;
    }
}
