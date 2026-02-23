import { useEffect, useState } from "react";

export function readJSON(key, fallback) {
    try {
        const raw = localStorage.getItem(key);
        if (!raw) return fallback;
        const parsed = JSON.parse(raw);
        return parsed ?? fallback;
    } catch {
        return fallback;
    }
}

export function writeJSON(key, value) {
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch {
        /* ignore */
    }
}

export function removeKey(key) {
    try {
        localStorage.removeItem(key);
    } catch {
        /* ignore */
    }
}

export function useLocalStorageState(key, initialValue, { removeWhenNull = true } = {}) {
    const [state, setState] = useState(() => readJSON(key, initialValue));

    useEffect(() => {
        if ((state === null || state === undefined) && removeWhenNull) {
            removeKey(key);
            return;
        }
        writeJSON(key, state);
    }, [key, state, removeWhenNull]);

    return [state, setState];
}