// util/form-encoder.ts
export class FormEncoder {
    static encodeToUrlEncodedForm(data: { [key: string]: any }): string {
        return Object.keys(data)
            .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(data[key])}`)
            .join('&');
    }
}
