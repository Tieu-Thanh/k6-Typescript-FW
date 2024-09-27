export class FormEncoder {
    /**
     * Encodes an object into URL-encoded form data (application/x-www-form-urlencoded).
     * This format is often used in HTTP POST requests for form submissions.
     * @param data - An object where the keys and values represent form fields and their values.
     * @returns A URL-encoded string.
     */
    static encodeToUrlEncodedForm(data: { [key: string]: any }): string {
        return Object.keys(data)
            .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(data[key])}`)  // Encode each key-value pair
            .join('&');  // Join all key-value pairs with '&'
    }
}
