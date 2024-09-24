import { SharedArray } from 'k6/data';

export class DataProvider<T> {
    private data: T[];

    constructor(name: string, loader: () => T[]) {
        this.data = new SharedArray<T>(name, loader);
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
