import { getCurrentLocation } from '@/src/utils/location';

export class LocationService {
    /**
     * Attempts to fetch the device's current GPS coordinates.
     * Enforces a strict timeout to prevent the UI from hanging indefinitely.
     * @param timeoutMs The maximum time to wait in milliseconds (default: 10000)
     * @returns An object containing latitude and longitude
     * @throws Error if the hardware times out or permission is denied
     */
    static async getCoordinatesWithTimeout(timeoutMs: number = 10000): Promise<{ latitude: number, longitude: number }> {
        // Create a rejection promise that fires after the specified timeout
        const timeoutPromise = new Promise<{ coords: { latitude: number; longitude: number } }>((_, reject) =>
            setTimeout(() => reject(new Error("Location timeout")), timeoutMs)
        );

        try {
            // Race the hardware request against the timeout
            const loc = await Promise.race([
                getCurrentLocation(),
                timeoutPromise
            ]);

            return {
                latitude: loc.coords.latitude,
                longitude: loc.coords.longitude
            };
        } catch (error) {
            // Bubble the error up so the Hook/Controller can decide how to alert the user
            throw error;
        }
    }
}