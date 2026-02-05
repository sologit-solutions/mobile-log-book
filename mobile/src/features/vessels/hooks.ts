import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSQLiteContext } from 'expo-sqlite';
import { getVessels, addVessel, deleteVessel } from '@/src/database/db';

export const VESSEL_KEYS = {
    all: ['vessels'] as const,
};

export function useVessels() {
    const db = useSQLiteContext();
    return useQuery({
        queryKey: VESSEL_KEYS.all,
        queryFn: () => getVessels(db),
    });
}

export function useAddVessel() {
    const db = useSQLiteContext();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: { name: string; type: string; registration: string }) => {
            return addVessel(db, data.name, data.type, data.registration);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: VESSEL_KEYS.all });
        },
    });
}

export function useDeleteVessel() {
    const db = useSQLiteContext();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: string) => {
            return deleteVessel(db, id);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: VESSEL_KEYS.all });
        },
    });
}