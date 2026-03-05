import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSQLiteContext } from "expo-sqlite";
import { LogItemRepository } from '@/src/database/repositories/LogItemRepository';
import { pushRemoteLogItems, deleteRemoteLogItems, updateRemoteLogItems, fetchLatestRemoteLogItems } from "@/src/utils/api";
import { useAuthStore } from "@/src/store/authStore";

export const LOG_ITEM_KEYS = {
	all: ["log_items"] as const,
	list: (logbookId?: string | null) => ["log_items", "list", { logbookId }] as const,
	detail: (id: string) => ["log_items", "detail", id] as const,
};

export function useLogItems(logbookId?: string | null) {
	const db = useSQLiteContext();
	return useQuery({
		queryKey: LOG_ITEM_KEYS.list(logbookId),
		queryFn: () => LogItemRepository.getLogItems(db, logbookId || undefined),
	});
}

export function useLogItem(id: string) {
	const db = useSQLiteContext();
	return useQuery({
		queryKey: LOG_ITEM_KEYS.detail(id),
		queryFn: () => LogItemRepository.getLogItemById(db, id),
		enabled: !!id, // Only run if ID exists
	});
}

export function useAddLogItem() {
	const db = useSQLiteContext();
	const queryClient = useQueryClient();
	const user = useAuthStore((state) => state.user);

	return useMutation({
		mutationFn: async (data: { title: string; body?: string | null; lat: number; lon: number; logbookId: string }) => {
			const localId = await LogItemRepository.addLogItem(db, data.logbookId, data.title, data.body || null, data.lat, data.lon);

			if (user?.id) {
				const newItem = await LogItemRepository.getLogItemById(db, localId);
				if (newItem) {
					pushRemoteLogItems(data.logbookId, [newItem])
						.then((res) => console.log(`Server saved ${res.count} items.`))
						.catch((err) => {
							console.log("Pin saved locally and will sync later.", err.message);
					});
				}
			}

			return localId;
		},
		onSuccess: () => {
			// Automatically refresh the list when a log is added
			queryClient.invalidateQueries({ queryKey: LOG_ITEM_KEYS.all });
		},
	});
}

export function useUpdateLogItem() {
	const db = useSQLiteContext();
	const queryClient = useQueryClient();
	const user = useAuthStore((state) => state.user);

	return useMutation({
		mutationFn: async (data: { id: string; title: string; body?: string | null; lat?: number; lon?: number; logbookId: string }) => {
			await LogItemRepository.updateLogItem(db, data.id, data.title, data.body || null, data.lat, data.lon);

			if (user?.id) {
				const updatedItem = await LogItemRepository.getLogItemById(db, data.id);
				if (updatedItem) {
					updateRemoteLogItems(data.logbookId, [updatedItem])
						.then(() => console.log("Success! Edit uploaded to server."))
						.catch((err) => {
							console.log("Device offline. Pin edit saved locally and will sync later.", err.message);
						});
				}
			}

			return data.id;
		},
		onSuccess: (_, variables) => {
			queryClient.invalidateQueries({ queryKey: LOG_ITEM_KEYS.all }).then();
			queryClient.invalidateQueries({ queryKey: LOG_ITEM_KEYS.detail(variables.id) }).then();
		},
	});
}

export function useDeleteLogItem() {
	const db = useSQLiteContext();
	const queryClient = useQueryClient();
	const user = useAuthStore((state) => state.user);

	return useMutation({
		mutationFn: async (data: {id: string, logbookId: string}) => {
			await LogItemRepository.deleteLogItem(db, data.id);

			// If logged in, tell the server to delete it
			if (user?.id) {
				deleteRemoteLogItems(data.logbookId, [data.id]).catch((err) => {
					console.log("Device offline. Deletion will need to be reconciled later.", err.message);
				});
			}

			return data.id;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: LOG_ITEM_KEYS.all });
		},
	});
}

/**
 * The sync engine: Pushes offline edits, then pulls the latest server changes
 */
export function useSyncLogItems() {
	const db = useSQLiteContext();
	const queryClient = useQueryClient();
	// Extract only the ID to prevent unnecessary re-renders if other user properties change
	const userId = useAuthStore((state) => state.user?.id);

	return useMutation({
		mutationFn: async (logbookId: string) => {
			if (!userId) throw new Error("Authentication required for synchronization.");

			// --- upload local edits ---
			const pendingItems = await LogItemRepository.getPendingLogItems(db, logbookId);
			if (pendingItems.length > 0) {
				await pushRemoteLogItems(logbookId, pendingItems);
			}

			// --- fetch remotes ---
			const currentVersion = await LogItemRepository.getHighestLogItemVersion(db, logbookId);
			const newItems = await fetchLatestRemoteLogItems(logbookId, currentVersion);

			// --- apply to local db ---
			if (newItems?.length > 0) {
				await LogItemRepository.mergeRemoteLogItems(db, logbookId, newItems);
			}

			return true;
		},
		onSuccess: () => {
			// refresh the UI arrays
			queryClient.invalidateQueries({ queryKey: LOG_ITEM_KEYS.all });
		},
		onError: (error) => {
			console.error("[Sync Engine] Synchronization fatally failed:", error);
		},
	});
}