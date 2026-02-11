import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Vessel {
    id: string;
    name: string;
}

interface VesselState {
    currentVessel: Vessel | null;
    setCurrentVessel: (vessel: Vessel | null) => void;
}

export const useVesselStore = create<VesselState>()(
    persist(
        (set) => ({
            currentVessel: null,
            setCurrentVessel: (vessel) => set({ currentVessel: vessel }),
        }),
        {
            name: 'vessel-storage',
            storage: createJSONStorage(() => AsyncStorage),
        }
    )
);