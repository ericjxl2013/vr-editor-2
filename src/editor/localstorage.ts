export class LocalStorage {

    public constructor() {
        // Get a key from the local storage
        editor.method('localStorage:get', function (key: string) {
            var value = localStorage.getItem(key);
            if (value) {
                try {
                    value = JSON.parse(value);
                } catch (e) {
                    console.error(e);
                }
            }

            return value;
        });

        // Set a key-value pair in localStorage
        editor.method('localStorage:set', function (key: string, value: any) {
            localStorage.setItem(key, JSON.stringify(value));
        });

        // Returns true if the key exists in the local storage
        editor.method('localStorage:has', function (key: string) {
            return !!localStorage.getItem(key);
        });
    }
}