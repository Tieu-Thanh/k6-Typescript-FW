/**
 * ScenarioConfig is a utility class for configuring k6 scenarios.
 * Scenarios in k6 define how virtual users (VUs) behave during a load test,
 * controlling aspects such as the number of users, iteration rate, and test duration.
 */
export class ScenarioConfig {
    private scenarioName: string;
    private config: { [key: string]: any } = {};

    /**
     * Constructor to initialize a scenario configuration with a given name.
     *
     * @param scenarioName - The name of the scenario being configured.
     */
    constructor(scenarioName: string) {
        this.scenarioName = scenarioName;
    }

    /**
     * Sets the type of executor for the scenario.
     * Executors define how VUs behave during the test, such as `constant-vus`, `ramping-vus`, or `constant-arrival-rate`.
     *
     * @param executor - The name of the executor (e.g., 'constant-vus', 'ramping-vus', 'constant-arrival-rate').
     * @returns This scenario config instance for method chaining.
     */
    setExecutor(executor: string) {
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
    setVUs(vus: number) {
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
    setDuration(duration: string) {
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
    setIterations(iterations: number) {
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
    setGracefulStop(duration: string) {
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
    setExec(execFunctionName: string) {
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
    useConstantVUs(vus: number, duration: string) {
        this.config.executor = 'constant-vus';
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
    useRampingVUs(stages: { duration: string, target: number }[]) {
        this.config.executor = 'ramping-vus';
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
    usePerVUIterations(vus: number, iterations: number, maxDuration: string = '10m') {
        this.config.executor = 'per-vu-iterations';
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
    userConstantArrivalRate(rate: number, duration: string, preAllocatedVUs: number, maxVUs: number = preAllocatedVUs, timeUnit: string = '1s') {
        this.config.executor = 'constant-arrival-rate';
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
}
