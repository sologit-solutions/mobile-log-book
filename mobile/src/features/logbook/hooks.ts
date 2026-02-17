import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSQLiteContext } from "expo-sqlite";
import { getLogItems, addLogItem, deleteLogItem, updateLogItem, getLogItemById } from "@/src/database/db";

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

	return useMutation({
		mutationFn: async (data: { title: string; body?: string | null; lat: number; lon: number; logbookId: string }) => {
			return addLogItem(db, data.logbookId, data.title, data.body || null, data.lat, data.lon);
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

	return useMutation({
		mutationFn: async (data: { id: string; title: string; body?: string | null; lat?: number; lon?: number }) => {
			return updateLogItem(db, data.id, data.title, data.body || null, data.lat, data.lon);
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

	return useMutation({
		mutationFn: async (id: string) => {
			return deleteLogItem(db, id);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: LOG_ITEM_KEYS.all });
		},
	});
}
