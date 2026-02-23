import React, { createContext, useContext, useMemo } from "react";
import { useLocalStorageState } from "../utils/storage.js";

const VesselContext = createContext(null);

const STORAGE_KEY = "logify:vessel";

export function VesselProvider({ children }) {
    const [vessel, setVessel] = useLocalStorageState(STORAGE_KEY, null);

    function createVessel(data) {
        const now = Date.now();
        let didCreate = false;

        setVessel((prev) => {
            if (prev) return prev; // only one vessel allowed
            didCreate = true;
            return {
                ...data,
                createdAt: now,
                updatedAt: now,
            };
        });

        return didCreate
            ? { ok: true }
            : { ok: false, message: "Only one vessel can be added" };
    }

    function updateVessel(patch) {
        const now = Date.now();
        let didUpdate = false;

        setVessel((prev) => {
            if (!prev) return prev;
            didUpdate = true;
            return {
                ...prev,
                ...patch,
                // preserve createdAt
                createdAt: prev.createdAt ?? now,
                updatedAt: now,
            };
        });

        return didUpdate ? { ok: true } : { ok: false, message: "No vessel found" };
    }

    function deleteVessel() {
        setVessel(null);
        return { ok: true };
    }

    const value = useMemo(
        () => ({
            vessel,
            createVessel,
            updateVessel,
            deleteVessel,
            hasVessel: !!vessel,
        }),
        [vessel]
    );
    return <VesselContext.Provider value={value}>{children}</VesselContext.Provider>;
}

export function useVessel() {
    const ctx = useContext(VesselContext);
    if (!ctx) throw new Error("useVessel must be used inside <VesselProvider>");
    return ctx;
}