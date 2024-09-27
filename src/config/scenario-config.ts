export class ScenarioConfig {
    private scenarioName: string;
    private config: { [key: string]: any } = {};

    constructor(scenarioName: string) {
        this.scenarioName = scenarioName;
    }

    setExecutor(executor: string) {
        this.config.executor = executor;
        return this;
    }

    setVUs(vus: number) {
        this.config.vus = vus;
        return this;
    }

    setDuration(duration: string) {
        this.config.duration = duration;
        return this;
    }

    setIterations(iterations: number) {
        this.config.iterations = iterations;
        return this;
    }

    setStartTime(startTime: string) {
        this.config.startTime = startTime;
        return this;
    }

    setGracefulStop(duration: string) {
        this.config.gracefulStop = duration;
        return this;
    }

    setEnv(envVars: { [key: string]: string }) {
        this.config.env = envVars;
        return this;
    }

    setTags(tags: { [key: string]: string }) {
        this.config.tags = tags;
        return this;
    }

    setExec(execFunctionName: string) {
        this.config.exec = execFunctionName;
        return this;
    }

    useConstantVUs(vus: number, duration: string) {
        this.config.executor = 'constant-vus';
        this.config.vus = vus;
        this.config.duration = duration;
        return this;
    }

    useRampingVUs(stages: { duration: string, target: number }[]) {
        this.config.executor = 'ramping-vus';
        this.config.stages = stages;
        return this;
    }

    usePerVUIterations(vus: number, iterations: number, maxDuration: string = '10m') {
        this.config.executor = 'per-vu-iterations';
        this.config.vus = vus;
        this.config.iterations = iterations;
        this.config.maxDuration = maxDuration;
        return this;
    }
    build() {
        return { [this.scenarioName]: this.config };
    }
}
