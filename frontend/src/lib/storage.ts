// Safe localStorage wrapper to handle environments where localStorage is not available
export const safeLocalStorage = {
    getItem: (key: string): string | null => {
        try {
            if (typeof window !== 'undefined' && window.localStorage) {
                return localStorage.getItem(key);
            }
            return null;
        } catch (error) {
            console.warn(`Error accessing localStorage for key "${key}":`, error);
            return null;
        }
    },

    setItem: (key: string, value: string): void => {
        try {
            if (typeof window !== 'undefined' && window.localStorage) {
                localStorage.setItem(key, value);
            }
        } catch (error) {
            console.warn(`Error setting localStorage for key "${key}":`, error);
        }
    },

    removeItem: (key: string): void => {
        try {
            if (typeof window !== 'undefined' && window.localStorage) {
                localStorage.removeItem(key);
            }
        } catch (error) {
            console.warn(`Error removing localStorage for key "${key}":`, error);
        }
    }
};
