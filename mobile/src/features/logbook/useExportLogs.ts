import { useState } from 'react';
import { Alert, Platform } from 'react-native';
import { ExportService } from '@/src/services/ExportService';
import { DBLogItem } from '@/src/types/db';

export function useExportLogs() {
    const [isExporting, setIsExporting] = useState(false);

    const exportToCsv = async (logs: DBLogItem[] | undefined, logbookName: string | undefined) => {
        if (!logs || logs.length === 0) {
            Alert.alert("No Data", "There are no events to export.");
            return;
        }

        const safeName = logbookName || "Unnamed_Vessel";

        try {
            setIsExporting(true);

            // Delegate the heavy lifting to the pure service class
            await ExportService.exportLogsToCsv(logs, safeName);

            // Android saves to a folder directly, so we show a success message.
            if (Platform.OS === 'android') {
                Alert.alert("Success", "Logbook successfully saved to your device.");
            }

        } catch (error: any) {
            console.error("Export pipeline failed:", error);

            // Ignore the error if the user just backed out of the Android folder picker
            if (error.message !== "USER_CANCELLED") {
                Alert.alert("Export Error", error.message || "A system error occurred while generating or saving the CSV.");
            }
        } finally {
            setIsExporting(false);
        }
    };

    return {
        exportToCsv,
        isExporting
    };
}