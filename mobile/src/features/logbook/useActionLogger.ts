import { useState } from 'react';
import { Alert } from 'react-native';
import { useAddLogItem } from '@/src/features/logbook/hooks';
import { LocationService } from '@/src/services/LocationService';
import { useLogbookStore } from '@/src/store/logbookStore';

/**
 * hook that bridges homescreen UI with the location service and db
 * manages the async flow of fetching GPS coordinates, saving the event,
 * and tracking which specific button is currently processing
 * @returns An object containing the `logAction` function and `loadingButtonId` state
 */
export function useActionLogger() {
    const { currentLogbook } = useLogbookStore();
    const addLogItemMutation = useAddLogItem();

    const [loadingButtonId, setLoadingButtonId] = useState<string | null>(null);

    /**
     * attempts to fetch the users location and save a new event to the active logbook
     * Automatically handles its own loading states and error alerts
     * @param actionLabel - The title of the event (e.g. "Hoist Sails")
     * @param buttonId - The unique ID of the button pressed (used to show the loading spinner)
     */
    const logAction = async (actionLabel: string, buttonId: string) => {
        if (!currentLogbook) {
            Alert.alert("No Vessel", "Please select a vessel in your profile first.");
            return;
        }

        setLoadingButtonId(buttonId);
        let lat = 0;
        let lon = 0;

        try {
            const loc = await LocationService.getCoordinatesWithTimeout(10000);
            lat = loc.latitude;
            lon = loc.longitude;

        } catch (error: any) {
            console.log("Location fetch failed or timed out. Saving with (0,0). Error:", error.message);
            Alert.alert("Location Error", error.message || "Could not fetch location.");
        }

        addLogItemMutation.mutate({
            logbookId: currentLogbook.id,
            title: actionLabel,
            lat: lat,
            lon: lon,
        }, {
            onSuccess: () => {
                Alert.alert("Success", "Event saved successfully");
            },
            onError: (error) => {
                console.error(error);
                Alert.alert("Error", "Failed to save log");
            },
            onSettled: () => {  // Needed to stop the loading spinner eventually
                setLoadingButtonId(null);
            }
        });
    };

    return {
        logAction,
        loadingButtonId
    };
}