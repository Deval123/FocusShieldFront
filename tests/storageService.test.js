import 'jest-webextension-mock';
import { saveData, getData, clearData } from '../src/service/storageService';

describe('chrome.storage - storageService', () => {
    beforeEach(() => {
        const store = {};

        chrome.storage.local.set = jest.fn((items, callback) => {
            Object.assign(store, items);
            callback?.();
        });

        chrome.storage.local.get = jest.fn((keys, callback) => {
            const result = {};
            if (Array.isArray(keys)) {
                keys.forEach(key => {
                    result[key] = store[key];
                });
            } else if (typeof keys === 'string') {
                result[keys] = store[keys];
            } else {
                Object.assign(result, store);
            }
            callback(result);
        });

        chrome.storage.local.clear = jest.fn(callback => {
            for (const key in store) {
                delete store[key];
            }
            callback?.();
        });
    });

    it('Saves and retrieves data correctly', async () => {
        await saveData('focusMode', true);
        const result = await getData('focusMode');
        expect(result).toBe(true);
    });

    it('Clears storage correctly', async () => {
        await saveData('myKey', 'value');
        await clearData();
        const result = await getData('myKey');
        expect(result).toBeUndefined();
    });

    it('Overwrites existing key', async () => {
        await saveData('theme', 'dark');
        await saveData('theme', 'light');
        const result = await getData('theme');
        expect(result).toBe('light');
    });
});