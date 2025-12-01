import * as Location from 'expo-location';

interface LocationOptions {
    accuracy?: Location.Accuracy;
}

/**
 * Requests permission and retrieves the current device location.
 * Throws an error if permission is denied or services are disabled.
 * * @param options - Optional configuration (default: Balanced Accuracy)
 * @returns Promise<Location.LocationObject>
 */
export const getCurrentLocation = async (options: LocationOptions = {}): Promise<Location.LocationObject> => {

    //Unless specified, use high accuracy to fetch location
    const accuracy = options.accuracy ?? Location.Accuracy.High;

    const {status} = await Location.requestForegroundPermissionsAsync();

    if (status !== 'granted') {
        throw new Error("No location permission granted");
    }

    const isEnabled = await Location.hasServicesEnabledAsync();

    if (!isEnabled) {
        throw new Error("Location services are disabled on the device");
    }

    return await Location.getCurrentPositionAsync({
        accuracy: accuracy,
    });
}