import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSQLiteContext } from 'expo-sqlite';
import { getLogs, addLog, deleteLog, updateLog, getLogById } from '@/src/database/db';

export const LOG_KEYS = {
    all: ['logs'] as const,
    detail: (id: string) => ['logs', id] as const,
};

export function useLogs() {
    const db = useSQLiteContext();
    return useQuery({
        queryKey: LOG_KEYS.all,
        queryFn: () => getLogs(db),
    });
}

export function useLog(id: string) {
    const db = useSQLiteContext();
    return useQuery({
        queryKey: LOG_KEYS.detail(id),
        queryFn: () => getLogById(db, id),
        enabled: !!id, // Only run if ID exists
    });
}

export function useAddLog() {
    const db = useSQLiteContext();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: {
            entry: string;
            lat: number;
            lon: number;
            vesselId?: string | null
        }) => {
            return addLog(db, data.entry, data.lat, data.lon, data.vesselId);
        },
        onSuccess: () => {
            // Automatically refresh the list when a log is added
            queryClient.invalidateQueries({ queryKey: LOG_KEYS.all });
        },
    });
}

export function useUpdateLog() {
    const db = useSQLiteContext();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: { id: string; entry: string }) => {
            return updateLog(db, data.id, data.entry);
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: LOG_KEYS.all });
            queryClient.invalidateQueries({ queryKey: LOG_KEYS.detail(variables.id) });
        },
    });
}

export function useDeleteLog() {
    const db = useSQLiteContext();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: string) => {
            return deleteLog(db, id);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: LOG_KEYS.all });
        },
    });
}