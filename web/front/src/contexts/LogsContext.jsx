import React, { createContext, useContext, useMemo } from "react";
import { useLocalStorageState } from "../utils/storage";
import { normalizeTags } from "../utils/tags";

const LogsContext = createContext(null);

const STORAGE_KEY = "logify:logs";

const seedLogs = [
    {
        id: "log-1",
        date: "18.07.2025",
        title: "Sunny sail",
        weather: "Sunny, 30°C",
        coords: "59.92606995766071, 21.63265575451144",
        tags: ["Weather", "Rest stop"],
        text:
            "Weather conditions were good and the sun was shining.\n" +
            "Shared a sandwich with the seagulls at a rest stop.\n\n" +
            "Note: The engine had a funny sound in the beginning. Should maybe check it out?",
        createdAt: Date.now() - 1000 * 60 * 60 * 24 * 10,
        updatedAt: Date.now() - 1000 * 60 * 60 * 24 * 2,
    },
    {
        id: "log-2",
        date: "15.06.2025",
        title: "Birthday sail",
        weather: "Windy",
        coords: "60.46738007849999, 21.290280255974455",
        tags: ["Birthday"],
        text: "Went sailing for my birthday... Strong winds today. Ate cake.",
        createdAt: Date.now() - 1000 * 60 * 60 * 24 * 30,
        updatedAt: Date.now() - 1000 * 60 * 60 * 24 * 30,
    },
];

function makeId() {
    return `log-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function LogsProvider({ children }) {
    const [logs, setLogs] = useLocalStorageState(STORAGE_KEY, seedLogs);

    function addLog(log) {
        const now = Date.now();
        const withMeta = {
            id: log.id ?? makeId(),
            date: String(log.date ?? "").trim(),
            title: String(log.title ?? "").trim(),
            weather: String(log.weather ?? "—").trim() || "—",
            coords: String(log.coords ?? "—").trim() || "—",
            text: String(log.text ?? "").trim(),
            tags: normalizeTags(log.tags ?? []),
            createdAt: log.createdAt ?? now,
            updatedAt: log.updatedAt ?? now,
        };

        setLogs((prev) => [withMeta, ...(Array.isArray(prev) ? prev : [])]);
        return withMeta;
    }

    function deleteLog(id) {
        setLogs((prev) => (Array.isArray(prev) ? prev.filter((l) => l.id !== id) : []));
    }

    function updateLog(id, patch) {
        const now = Date.now();
        setLogs((prev) =>
            (Array.isArray(prev) ? prev : []).map((l) => {
                if (l.id !== id) return l;

                const next = {
                    ...l,
                    ...patch,
                    // normalize tags if they were part of patch
                    tags: patch?.tags !== undefined ? normalizeTags(patch.tags) : l.tags ?? [],
                    // preserve createdAt; always bump updatedAt
                    createdAt: l.createdAt ?? now,
                    updatedAt: now,
                };
                return next;
            })
        );
    }

    const value = useMemo(() => ({ logs, addLog, deleteLog, updateLog }), [logs]);

    return <LogsContext.Provider value={value}>{children}</LogsContext.Provider>;
}

export function useLogs() {
    const ctx = useContext(LogsContext);
    if (!ctx) throw new Error("useLogs must be used inside <LogsProvider>");
    return ctx;
}