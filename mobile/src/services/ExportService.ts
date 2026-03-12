import { Platform } from 'react-native';
import { File, Paths, Directory } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { DBLogItem } from '@/src/types/db';

export class ExportService {
    /**
     * Transforms an array of DBLogItems into a CSV format and saves or shares it
     * utilizing platform-specific file system rules.
     * @param logs Array of log events to export
     * @param logs
     * @param logbookName Used to generate the file name
     * @throws Error if file generation or sharing fails
     */
    static async exportLogsToCsv(logs: DBLogItem[], logbookName: string): Promise<void> {
        if (!logs || logs.length === 0) {
            throw new Error("No events to export.");
        }

        // Data transformation
        let csvContent = "Date,Time,Event,Details,Latitude,Longitude\n";

        logs.forEach((log) => {
            const dateObj = new Date(log.created_at);

            const year = dateObj.getFullYear();
            const month = String(dateObj.getMonth() + 1).padStart(2, '0');
            const day = String(dateObj.getDate()).padStart(2, '0');
            const dateStr = `${year}-${month}-${day}`;

            const timeStr = dateObj.toTimeString().slice(0, 5);

            // Strip commas (prevent CSV column breaking)
            const cleanTitle = log.title.replace(/,/g, " ");
            const cleanBody = log.body ? log.body.replace(/,/g, " ") : "";

            csvContent += `${dateStr},${timeStr},${cleanTitle},${cleanBody},${log.latitude},${log.longitude}\n`;
        });

        // Create a filename
        const safeName = logbookName.replace(/[^a-z0-9]/gi, '_').toLowerCase() || "logs";

        // Hardware + OS phase
        if (Platform.OS === 'android') {
            const directory = await Directory.pickDirectoryAsync();

            if (directory) {
                const file = directory.createFile(`${safeName}_export`, 'text/csv');
                file.write(csvContent);
            } else {
                // User backed out of the folder picker; throw specific error to ignore silently
                throw new Error("USER_CANCELLED");
            }
        } else {
            // iOS & Other platform execution
            const file = new File(Paths.document, `${safeName}_export.csv`);

            if (!file.exists) {
                file.create();
            }
            file.write(csvContent);

            if (await Sharing.isAvailableAsync()) {
                await Sharing.shareAsync(file.uri, {
                    mimeType: 'text/csv',
                    dialogTitle: `Export Logs for ${logbookName}`
                });
            } else {
                throw new Error("File sharing is disabled or unavailable on this device.");
            }
        }
    }
}