import { SharedArray } from 'k6/data';
import papaparse from 'https://jslib.k6.io/papaparse/5.1.1/index.js'; // For CSV parsing
// import { open } from 'k6/fs'; // For file operations in k6

export class DataProvider<T> {
    private data: T[];

    constructor(name: string, filePath: string) {
        this.data = new SharedArray<T>(name, () => this.loadData(filePath));
    }

    // Load data based on file type (JSON or CSV)
    private loadData(filePath: string): T[] {
        const fileContent = open(filePath);  // This `open()` is provided by K6, not `k6/fs`

        if (filePath.endsWith('.json')) {
            // Parse JSON content
            return JSON.parse(fileContent);
        } else if (filePath.endsWith('.csv')) {
            // Parse CSV content
            const parsedData = papaparse.parse<T>(fileContent, {
                header: true, // Assuming the CSV file has headers
                skipEmptyLines: true,
            });
            return parsedData.data;
        } else {
            throw new Error('Unsupported file format. Only JSON and CSV are supported.');
        }
    }

    // Get the entire data array
    getAll(): T[] {
        return this.data;
    }

    // Get a random item from the data array
    getRandomItem(): T {
        const index = Math.floor(Math.random() * this.data.length);
        return this.data[index];
    }

    // Get an item by index
    getItem(index: number): T {
        return this.data[index];
    }

    // Get the number of items in the data array
    getLength(): number {
        return this.data.length;
    }
}
