export class ThresholdsConfig {
    private thresholds: { [key: string]: string[] } = {};

    // Add a threshold for HTTP request duration with various conditions
    setHttpReqDuration(conditions: string[]) {
        this.thresholds['http_req_duration'] = conditions;
        return this;
    }

    // Add a threshold for HTTP request failure rate
    setHttpReqFailed(conditions: string[]) {
        this.thresholds['http_req_failed'] = conditions;
        return this;
    }

    // Add a threshold for Virtual Users (VUs)
    setVUs(conditions: string[]) {
        this.thresholds['vus'] = conditions;
        return this;
    }

    // Add a threshold for HTTP request rate
    setHttpReqRate(conditions: string[]) {
        this.thresholds['http_reqs'] = conditions;
        return this;
    }

    // Add a threshold for iterations duration
    setIterationDuration(conditions: string[]) {
        this.thresholds['iteration_duration'] = conditions;
        return this;
    }

    // Add a threshold for data sent
    setDataSent(conditions: string[]) {
        this.thresholds['data_sent'] = conditions;
        return this;
    }

    // Add a threshold for data received
    setDataReceived(conditions: string[]) {
        this.thresholds['data_received'] = conditions;
        return this;
    }

    // Add a threshold for custom metric
    setCustomThreshold(metric: string, conditions: string[]) {
        this.thresholds[metric] = conditions;
        return this;
    }

    // Build and return the final thresholds object
    build() {
        return this.thresholds;
    }
}
