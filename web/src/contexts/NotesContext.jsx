import React, { createContext, useContext, useMemo } from "react";
import { useLocalStorageState } from "../utils/storage";
import { normalizeTags } from "../utils/tags";

const NotesContext = createContext(null);

const STORAGE_KEY = "logify:notes";

const seedNotes = [
    {
        id: "note-1",
        title: "Check engine",
        text: "Strange coughing sound on startup.",
        tags: ["Engine"],
        createdAt: Date.now() - 1000 * 60 * 60 * 24 * 3,
        updatedAt: Date.now() - 1000 * 60 * 60 * 24 * 2,
    },
    {
        id: "note-2",
        title: "Packing list",
        text: "Deck shoes, sunglasses, sunscreen, headlamp, meds.",
        tags: [],
        createdAt: Date.now() - 1000 * 60 * 60 * 24,
        updatedAt: Date.now() - 1000 * 60 * 60 * 12,
    },
];

function makeId() {
    return `note-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function NotesProvider({ children }) {
    const [notes, setNotes] = useLocalStorageState(STORAGE_KEY, seedNotes);

    function addNote({ title, text, tags }) {
        const now = Date.now();
        const note = {
            id: makeId(),
            title: String(title ?? "").trim(),
            text: String(text ?? "").trim(),
            tags: normalizeTags(tags ?? []),
            createdAt: now,
            updatedAt: now,
        };

        setNotes((prev) => [note, ...(Array.isArray(prev) ? prev : [])]);
        return note;
    }

    function deleteNote(id) {
        setNotes((prev) => (Array.isArray(prev) ? prev.filter((n) => n.id !== id) : []));
    }

    function updateNote(id, patch) {
        const now = Date.now();
        setNotes((prev) =>
            (Array.isArray(prev) ? prev : []).map((n) => {
                if (n.id !== id) return n;

                return {
                    ...n,
                    ...patch,
                    tags: patch?.tags !== undefined ? normalizeTags(patch.tags) : n.tags ?? [],
                    createdAt: n.createdAt ?? now,
                    updatedAt: now,
                };
            })
        );
    }

    const value = useMemo(() => ({ notes, addNote, deleteNote, updateNote }), [notes]);

    return <NotesContext.Provider value={value}>{children}</NotesContext.Provider>;
}

export function useNotes() {
    const ctx = useContext(NotesContext);
    if (!ctx) throw new Error("useNotes must be used inside <NotesProvider>");
    return ctx;
}