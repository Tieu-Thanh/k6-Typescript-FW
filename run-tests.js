#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Get command-line arguments
const args = process.argv.slice(2);

// Define directories
const testsDir = path.join(__dirname, 'src', 'tests');
const distTestsDir = path.join(__dirname, 'dist', 'tests');

// Function to check if a test file exists
function testFileExists(filename) {
    const testFile = `${filename}.test.ts`;
    const fullPath = path.join(testsDir, testFile);
    return fs.existsSync(fullPath);
}

// Function to build a test file using esbuild
function buildTest(filename) {
    console.log(`Building ${filename}.test.ts...`);
    try {
        execSync(
            `esbuild ${path.join('src', 'tests', `${filename}.test.ts`)} --bundle --platform=neutral --target=es2017 --outfile=${path.join('dist', 'tests', `${filename}.test.js`)} --external:k6 --external:k6/*`,
            { stdio: 'inherit' }
        );
        console.log(`Build succeeded for ${filename}.test.ts`);
    } catch (error) {
        console.error(`Build failed for ${filename}.test.ts`);
        process.exit(1);
    }
}

// Function to run a test file using k6
function runTest(filename) {
    console.log(`Running ${filename}.test.js with k6...`);
    try {
        execSync(
            `k6 run ${path.join('dist', 'tests', `${filename}.test.js`)}`,
            { stdio: 'inherit' }
        );
        console.log(`Test completed for ${filename}.test.js`);
    } catch (error) {
        console.error(`Test failed for ${filename}.test.js`);
        process.exit(1);
    }
}

// Main logic
async function main() {
    if (args.length === 0) {
        console.error('Usage: yarn run-tests <test1> <test2> ...');
        console.error('Example: yarn run-tests login signup');
        process.exit(1);
    }

    const testFilenames = args;

    // Validate all test files
    for (const filename of testFilenames) {
        if (!testFileExists(filename)) {
            console.error(`Test file "${filename}.test.ts" does not exist in src/tests/`);
            process.exit(1);
        }
    }

    // Ensure dist/tests directory exists
    if (!fs.existsSync(distTestsDir)) {
        fs.mkdirSync(distTestsDir, { recursive: true });
    }

    // Build and run each test
    for (const filename of testFilenames) {
        buildTest(filename);
        runTest(filename);
    }
}

main();
