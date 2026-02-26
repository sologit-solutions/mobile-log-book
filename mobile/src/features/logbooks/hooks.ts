import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Alert } from "react-native";
import { useSQLiteContext } from "expo-sqlite";
import { getLogbooks, addLogbook, deleteLogbook, syncLogbooks } from "@/src/database/db";
import { createRemoteLogbook, deleteRemoteLogbook, fetchRemoteLogbooks } from "@/src/utils/api";

export const LOGBOOK_KEYS = {
	all: ["logbooks"] as const,
};

export function useVessels() {
	const db = useSQLiteContext();
	return useQuery({
		queryKey: LOGBOOK_KEYS.all,
		queryFn: () => getLogbooks(db),
	});
}

export function useAddVessel() {
	const db = useSQLiteContext();
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (data: { name: string; type: string; registration: string }) => {
			const localId = await addLogbook(db, data.name, data.type, data.registration);

			// Push to backend
			createRemoteLogbook(localId, data.name, data.type, data.registration).catch((err) => {
				console.log("Device offline or sync failed. Vessel saved locally and will sync later.", err.message);
			});

			return localId;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: LOGBOOK_KEYS.all });
		},
	});
}

export function useDeleteVessel() {
	const db = useSQLiteContext();
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (id: string) => {
			await deleteLogbook(db, id);

			deleteRemoteLogbook(id).catch((err) => {
				console.log("Device offline. Deletion will need to be reconciled later.", err.message);
			});

			return id;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: LOGBOOK_KEYS.all });
		},
	});
}

/**
 * Synchronizes the local SQLite db with the remote PostgreSQL backend
 * Fetches the users logbook array and executes an INSERT OR IGNORE merge
 */
export function useSyncVessels() {
	const db = useSQLiteContext();
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async () => {
			// Fetch remote DTOs
			const remoteLogbooks = await fetchRemoteLogbooks();

			// Execute local SQLite merge
			await syncLogbooks(db, remoteLogbooks);

			return remoteLogbooks.length;
		},
		onSuccess: (syncedCount) => {
			// Force the UI to re-read from SQLite and update the vessel list
			queryClient.invalidateQueries({ queryKey: LOGBOOK_KEYS.all });
			Alert.alert("Sync Complete", `Successfully restored ${syncedCount} vessels from the server.`);
		},
		onError: (error: any) => {
			Alert.alert("Sync Failed", error.message || "Could not reach the server.");
		},
	});
}
