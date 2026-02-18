import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSQLiteContext } from "expo-sqlite";
import { getLogbooks, addLogbook, deleteLogbook } from "@/src/database/db";

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
			return addLogbook(db, data.name, data.type, data.registration);
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
			return deleteLogbook(db, id);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: LOGBOOK_KEYS.all });
		},
	});
}
