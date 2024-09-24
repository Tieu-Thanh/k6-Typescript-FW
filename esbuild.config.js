const esbuild = require('esbuild');
const fs = require('fs');
const path = require('path');

// Define source and distribution directories
const testsSrcDir = path.join(__dirname, 'src', 'tests');
const testsDistDir = path.join(__dirname, 'dist', 'tests');

// Ensure the distribution directory exists
if (!fs.existsSync(testsDistDir)) {
    fs.mkdirSync(testsDistDir, { recursive: true });
}

// Read all files in the source tests directory
const testFiles = fs.readdirSync(testsSrcDir)
    .filter(file => file.endsWith('.test.ts'))
    .map(file => path.join(testsSrcDir, file));

// Check if there are any test files to build
if (testFiles.length === 0) {
    console.error('No test files found in src/tests/*.test.ts');
    process.exit(1);
}

// Build all test files
esbuild.build({
    entryPoints: testFiles,
    bundle: true,
    format: 'esm',
    platform: 'neutral', // Ensures compatibility with k6
    target: 'es2017',     // Ensures compatibility with k6's JS runtime
    outdir: testsDistDir, // Output directory for bundled test files
    external: ['k6', 'k6/*'], // Exclude k6 modules from the bundle
    minify: false,        // Optional: Enable if you want minified output
    sourcemap: false,     // Optional: Disable source maps
    logLevel: 'info',     // Optional: Adjust log level as needed
})
.then(() => {
    console.log('All test files built successfully.');
})
.catch((error) => {
    console.error('Build failed:', error);
    process.exit(1);
});
