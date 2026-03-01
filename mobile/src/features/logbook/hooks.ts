import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSQLiteContext } from "expo-sqlite";
import { getLogItems, addLogItem, deleteLogItem, updateLogItem, getLogItemById } from "@/src/database/db";
import { pushRemoteLogItems, deleteRemoteLogItems, updateRemoteLogItems } from "@/src/utils/api";
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
		queryFn: () => getLogItems(db, logbookId || undefined),
	});
}

export function useLogItem(id: string) {
	const db = useSQLiteContext();
	return useQuery({
		queryKey: LOG_ITEM_KEYS.detail(id),
		queryFn: () => getLogItemById(db, id),
		enabled: !!id, // Only run if ID exists
	});
}

export function useAddLogItem() {
	const db = useSQLiteContext();
	const queryClient = useQueryClient();
	const user = useAuthStore((state) => state.user);

	return useMutation({
		mutationFn: async (data: { title: string; body?: string | null; lat: number; lon: number; logbookId: string }) => {
			const localId = await addLogItem(db, data.logbookId, data.title, data.body || null, data.lat, data.lon);

			if (user?.id) {
				const newItem = await getLogItemById(db, localId);
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
			await updateLogItem(db, data.id, data.title, data.body || null, data.lat, data.lon);

			if (user?.id) {
				const updatedItem = await getLogItemById(db, data.id);
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
			await deleteLogItem(db, data.id);

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
