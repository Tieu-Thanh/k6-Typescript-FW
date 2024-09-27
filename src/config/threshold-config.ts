/**
 * The `ThresholdsConfig` class allows setting various thresholds for a k6 load test.
 * Thresholds define performance goals (e.g., request duration, failure rate) that determine the success of the test.
 * This class supports configuring multiple built-in metrics and allows adding custom thresholds.
 */
export class ThresholdsConfig {
    private thresholds: { [key: string]: string[] } = {};

    /**
     * Sets a threshold for HTTP request duration.
     * This is commonly used to ensure that most requests complete within a certain time.
     *
     * @param conditions - Array of conditions, e.g., ['p(95)<500'] to ensure the 95th percentile duration is below 500ms.
     * @returns This ThresholdsConfig instance for method chaining.
     */
    setHttpReqDuration(conditions: string[]) {
        this.thresholds['http_req_duration'] = conditions;
        return this;
    }

    /**
     * Sets a threshold for the HTTP request failure rate.
     * Ensures that the rate of failed requests remains below a certain percentage.
     *
     * @param conditions - Array of conditions, e.g., ['rate<0.01'] to ensure less than 1% of requests fail.
     * @returns This ThresholdsConfig instance for method chaining.
     */
    setHttpReqFailed(conditions: string[]) {
        this.thresholds['http_req_failed'] = conditions;
        return this;
    }

    /**
     * Sets a threshold for the number of virtual users (VUs).
     * Used to ensure a certain number of VUs are maintained or used during the test.
     *
     * @param conditions - Array of conditions, e.g., ['max>=50'] to ensure at least 50 VUs are running at peak.
     * @returns This ThresholdsConfig instance for method chaining.
     */
    setVUs(conditions: string[]) {
        this.thresholds['vus'] = conditions;
        return this;
    }

    /**
     * Sets a threshold for the total number of HTTP requests.
     * This is useful for ensuring a minimum or maximum request rate.
     *
     * @param conditions - Array of conditions, e.g., ['count>1000'] to ensure at least 1000 HTTP requests are made.
     * @returns This ThresholdsConfig instance for method chaining.
     */
    setHttpReqRate(conditions: string[]) {
        this.thresholds['http_reqs'] = conditions;
        return this;
    }

    /**
     * Sets a threshold for the duration of test iterations.
     * Ensures that each iteration completes within a certain time frame.
     *
     * @param conditions - Array of conditions, e.g., ['p(95)<1000'] to ensure the 95th percentile iteration duration is below 1000ms.
     * @returns This ThresholdsConfig instance for method chaining.
     */
    setIterationDuration(conditions: string[]) {
        this.thresholds['iteration_duration'] = conditions;
        return this;
    }

    /**
     * Sets a threshold for the amount of data sent.
     * Ensures that the total data sent during the test stays within certain limits.
     *
     * @param conditions - Array of conditions, e.g., ['sum<50MB'] to ensure no more than 50MB of data is sent.
     * @returns This ThresholdsConfig instance for method chaining.
     */
    setDataSent(conditions: string[]) {
        this.thresholds['data_sent'] = conditions;
        return this;
    }

    /**
     * Sets a threshold for the amount of data received.
     * Ensures that the total data received during the test stays within certain limits.
     *
     * @param conditions - Array of conditions, e.g., ['sum<100MB'] to ensure no more than 100MB of data is received.
     * @returns This ThresholdsConfig instance for method chaining.
     */
    setDataReceived(conditions: string[]) {
        this.thresholds['data_received'] = conditions;
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
    setCustomThreshold(metric: string, conditions: string[]) {
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
}
