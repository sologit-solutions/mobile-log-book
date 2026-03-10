import * as Location from 'expo-location';

interface LocationOptions {
    accuracy?: Location.Accuracy;
    timeout?: number;
}

/**
 * Requests permission and retrieves the current device location.
 * Throws an error if permission is denied or services are disabled.
 * @param options - Optional configuration (default: Balanced Accuracy)
 * @returns Promise<Location.LocationObject>
 */
export const getCurrentLocation = async (options: LocationOptions = {}): Promise<Location.LocationObject> => {

    // Android works best with Balanced location
    const accuracy = options.accuracy ?? Location.Accuracy.Balanced;
    const timeoutDuration = options.timeout ?? 5000;

    const {status} = await Location.requestForegroundPermissionsAsync();

    if (status !== 'granted') {
        throw new Error("No location permission granted");
    }

    const isEnabled = await Location.hasServicesEnabledAsync();

    if (!isEnabled) {
        throw new Error("Location services are disabled on the device");
    }

    try {

        // Set timeout for fetching location
        const timeoutPromise = new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error("Location request timed out")), timeoutDuration)
        );

        // Try to get the fresh current position
        // Cast as LocationObject
        return (await Promise.race([
            Location.getCurrentPositionAsync({ accuracy }),
            timeoutPromise
        ])) as Location.LocationObject;
    } catch (error) {

        const lastKnown = await Location.getLastKnownPositionAsync();
        if (lastKnown) {
            return lastKnown;
        }

        console.error(error);
        throw new Error("Could not fetch location. Ensure GPS is enabled.");
    }
}