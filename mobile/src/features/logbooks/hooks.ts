import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Alert } from "react-native";
import { useSQLiteContext } from "expo-sqlite";
import { LogbookRepository } from '@/src/database/repositories/LogbookRepository';
import { createRemoteLogbook, deleteRemoteLogbook, fetchRemoteLogbooks } from "@/src/utils/api";
import { useAuthStore } from "@/src/store/authStore";
import {useLogbookStore} from "@/src/store/logbookStore";

export const LOGBOOK_KEYS = {
	all: (ownerId: string) => ["logbooks", ownerId] as const,
};

export function useVessels() {
	const db = useSQLiteContext();
	const user = useAuthStore((state) => state.user);
	const ownerId = user?.id || "local";

	return useQuery({
		queryKey: LOGBOOK_KEYS.all(ownerId),
		queryFn: () => LogbookRepository.getLogbooks(db, ownerId),
	});
}

export function useAddVessel() {
	const db = useSQLiteContext();
	const queryClient = useQueryClient();
	const user = useAuthStore((state) => state.user);

	const { setCurrentLogbook } = useLogbookStore();

	const ownerId = user?.id || "local";

	return useMutation({
		mutationFn: async (data: { name: string; type: string; registration: string }) => {
			const localId = await LogbookRepository.addLogbook(db, ownerId, data.name, data.type, data.registration);

			// Push to backend
			if(user?.id){
				createRemoteLogbook(localId, data.name, data.type, data.registration).catch((err) => {
					console.log("Device offline or sync failed. Vessel saved locally and will sync later.", err.message);
				});
			} else {
				console.log("Offline mode active: Vessel saved to local device storage");
			}

			return localId;
		},
		onSuccess: (localId, variables) => {
			queryClient.invalidateQueries({ queryKey: LOGBOOK_KEYS.all(ownerId) });
			setCurrentLogbook({ id: localId, name: variables.name });
		},
	});
}

export function useDeleteVessel() {
	const db = useSQLiteContext();
	const queryClient = useQueryClient();
	const user = useAuthStore((state) => state.user);

	const ownerId = user?.id || "local";

	return useMutation({
		mutationFn: async (id: string) => {
			await LogbookRepository.deleteLogbook(db, id);

			if (user?.id){
				deleteRemoteLogbook(id).catch((err) => {
					console.log("Device offline. Deletion will need to be reconciled later.", err.message);
				});
			}

			return id;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: LOGBOOK_KEYS.all(ownerId) });
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
	const user = useAuthStore((state) => state.user);

	return useMutation({
		mutationFn: async () => {
			// Manual syncing strictly requires an account
			if (!user?.id) throw new Error("You must be logged in to sync with the server.");

			const remoteLogbooks = await fetchRemoteLogbooks();
			await LogbookRepository.syncLogbooks(db, remoteLogbooks, user.id);

			return remoteLogbooks.length;
		},
		onSuccess: (syncedCount) => {
			queryClient.invalidateQueries({ queryKey: LOGBOOK_KEYS.all(user?.id || "local") });
			Alert.alert("Sync Complete", `Successfully restored ${syncedCount} vessels from the server.`);
		},
		onError: (error: any) => {
			Alert.alert("Sync Failed", error.message || "Could not reach the server.");
		},
	});
}

export function useMergeLocalData() {
	const db = useSQLiteContext();
	const queryClient = useQueryClient();
	const user = useAuthStore((state) => state.user);

	return useMutation({
		mutationFn: async () => {
			if (!user?.id) throw new Error("You must be logged in to link data.");

			// Re-label local vessels to belong to the new user
			const movedCount = await LogbookRepository.assignLocalDataToUser(db, user.id);

			// Fetch these newly updated vessels from SQLite
			const allMyVessels = await LogbookRepository.getLogbooks(db, user.id);

			// Loop through + push them to the db
			await Promise.all(allMyVessels.map(async (vessel) => {
				try {
					// Try to create it on the server
					// If it already exists, server might return an error
					await createRemoteLogbook(vessel.id, vessel.name, vessel.type || "", vessel.registration || "");
				} catch (e) {
					// Ignore "Already Exists" errors, strictly log others
					console.log(`Sync push for ${vessel.name}:`, e);
				}
			}));

			return movedCount;
		},
		onSuccess: (count) => {
			// Refresh the UI to show the merged data
			queryClient.invalidateQueries({ queryKey: LOGBOOK_KEYS.all(user?.id || "") });
			Alert.alert("Success", `${count} offline vessels have been linked to your account and backed up!`);
		},
		onError: (err) => {
			Alert.alert("Link Failed", "Could not link offline data: " + err.message);
		}
	});
}
