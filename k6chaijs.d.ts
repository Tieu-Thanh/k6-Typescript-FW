// Purpose: This tells TypeScript that when we import from the given URL, we get the expect function from the chai library.
// Assumption: We're assuming that the expect function behaves like the one from chai.
declare module 'https://jslib.k6.io/k6chaijs/4.3.4.3/index.js' {
    import { expect } from 'chai';
    export { expect };
}

// This extends the Assertion interface to include jsonSchema, allowing us to use expect(data).to.be.jsonSchema(schema); with TypeScript support.
// import { ChaiStatic } from 'chai';

declare module 'chai' {
    interface Assertion {
        jsonSchema(schema: object): Assertion;
    }

    interface Assert {
        jsonSchema(val: any, schema: object, msg?: string): void;
    }
}

declare module 'https://jslib.k6.io/k6chaijs/4.3.4.3/index.js' {
    const expect: Chai.ExpectStatic;
    export { expect };
}
