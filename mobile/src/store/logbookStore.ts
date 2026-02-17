import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface LogbookInfo {
	id: string;
	name: string;
}

interface LogbookState {
	currentLogbook: LogbookInfo | null;
	setCurrentLogbook: (logbook: LogbookInfo | null) => void;
}

export const useLogbookStore = create<LogbookState>()(
	persist(
		(set) => ({
			currentLogbook: null,
			setCurrentLogbook: (logbook) => set({ currentLogbook: logbook }),
		}),
		{
			name: "logbook-storage",
			storage: createJSONStorage(() => AsyncStorage),
		},
	),
);
