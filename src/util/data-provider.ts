import { SharedArray } from 'k6/data';
import papaparse from 'https://jslib.k6.io/papaparse/5.1.1/index.js'; // For CSV parsing

export class DataProvider<T> {
    private data: T[];  // Stores the loaded data (array of generic type T)

    /**
     * Constructs the DataProvider and loads data using the provided file path.
     * @param name - A unique name used to identify the shared data.
     * @param filePath - The path to the data file (JSON or CSV).
     */
    constructor(name: string, filePath: string) {
        this.data = new SharedArray<T>(name, () => this.loadData(filePath));  // Load data and share it across VUs
    }

    /**
     * Loads data from the given file path. Supports both JSON and CSV file formats.
     * @param filePath - The path to the file containing test data (must be .json or .csv).
     * @returns An array of the loaded data.
     */
    private loadData(filePath: string): T[] {
        const fileContent = open(filePath);  // Open the file content using k6's `open()` function

        if (filePath.endsWith('.json')) {
            // Parse and return JSON content
            return JSON.parse(fileContent);
        } else if (filePath.endsWith('.csv')) {
            // Parse CSV content using papaparse library and return parsed data
            const parsedData = papaparse.parse<T>(fileContent, {
                header: true,          // Assuming CSV files have headers
                skipEmptyLines: true,  // Ignore empty lines in the CSV file
            });
            return parsedData.data;
        } else {
            throw new Error('Unsupported file format. Only JSON and CSV are supported.');
        }
    }

    /**
     * Gets all data entries.
     * @returns The entire data array.
     */
    getAll(): T[] {
        return this.data;
    }

    /**
     * Gets a random item from the data array.
     * @returns A randomly selected data item from the array.
     */
    getRandomItem(): T {
        const index = Math.floor(Math.random() * this.data.length);
        return this.data[index];
    }

    /**
     * Gets a specific item by index from the data array.
     * @param index - The index of the item in the array.
     * @returns The data item at the specified index.
     */
    getItem(index: number): T {
        return this.data[index];
    }

    /**
     * Gets the length of the data array.
     * @returns The number of items in the array.
     */
    getLength(): number {
        return this.data.length;
    }
}
