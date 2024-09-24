import { ThresholdsConfig } from "./threshold-config";
import { ScenarioConfig } from "./scenario-config";

interface K6Options {
    hosts?: { [key: string]: string };
    thresholds?: { [key: string]: string[] };
    noConnectionReuse?: boolean;
    userAgent?: string;
    vus?: number;
    duration?: string;
    insecureSkipTLSVerify?: boolean;
    gracefulStop?: string;
    throw?: boolean;
    stages?: Array<{ duration: string; target: number }>;
    scenarios: { [key: string]: any };
    [key: string]: any; // For additional arbitrary properties
}

export class K6Config {
    private config: K6Options = {
        hosts: {},
        thresholds: {},
        noConnectionReuse: false,
        userAgent: '',
        insecureSkipTLSVerify: false,
        gracefulStop: '30s',
        throw: false,
        scenarios: {},
    };

    // Set hosts mapping for load testing different endpoints
    setHosts(hosts: { [key: string]: string }) {
        this.config.hosts = hosts;
        return this;
    }

    // Set thresholds, accepting either an object or ThresholdsConfig class
    setThresholds(thresholds: { [key: string]: string[] } | ThresholdsConfig) {
        if (thresholds instanceof ThresholdsConfig) {
            this.config.thresholds = thresholds.build();
        } else {
            this.config.thresholds = thresholds;
        }
        return this;
    }

    // Enable or disable connection reuse
    setConnectionReuse(reuse: boolean) {
        this.config.noConnectionReuse = !reuse;
        return this;
    }

    // Define the user agent for the requests
    setUserAgent(userAgent: string) {
        this.config.userAgent = userAgent;
        return this;
    }

    // Skip TLS verification (useful for self-signed certs)
    setInsecureSkipTLSVerify(skipVerify: boolean) {
        this.config.insecureSkipTLSVerify = skipVerify;
        return this;
    }

    // Set the grace period to allow iterations to finish before stopping
    setGracefulStop(duration: string) {
        if (!/^\d+(ms|s|m|h|d)$/.test(duration)) {
            throw new Error('Invalid duration format for gracefulStop');
        }
        this.config.gracefulStop = duration;
        return this;
    }

    // Enable throwing exceptions when certain errors occur
    enableThrow(enable: boolean = true) {
        this.config.throw = enable;
        return this;
    }

    // Add a scenario
    addScenario(scenario: ScenarioConfig) {
        Object.assign(this.config.scenarios, scenario.build());
        return this;
    }

    // Set multiple scenarios
    setScenarios(scenarios: ScenarioConfig[]) {
        scenarios.forEach((scenario) => {
            Object.assign(this.config.scenarios, scenario.build());
        });
        return this;
    }

    // Build and return the final configuration object
    build() {
        // If scenarios are defined, remove top-level vus, duration, and stages to prevent conflicts
        if (Object.keys(this.config.scenarios).length > 0) {
            delete this.config.vus;
            delete this.config.duration;
            delete this.config.stages;
        }
        return this.config;
    }

    // Set arbitrary options
    setOption(key: keyof K6Options, value: any) {
        this.config[key] = value;
        return this;
    }

    // Set multiple options at once
    setOptions(options: Partial<K6Options>) {
        Object.assign(this.config, options);
        return this;
    }
}
