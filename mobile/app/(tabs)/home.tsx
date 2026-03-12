import React from "react";
import { StyleSheet, View, Text, FlatList } from "react-native";
import { Screen } from "@/src/components/Screen";
import { Button } from "@/src/components/Button";
import { useOwnTheme } from "@/src/context/ThemeContext";
import { useLogbookStore } from "@/src/store/logbookStore";
import { useButtonStore } from "@/src/store/buttonStore";

import { useActionLogger } from "@/src/features/logbook/useActionLogger";

export default function Home() {
    const { theme } = useOwnTheme();
    const { currentLogbook } = useLogbookStore();
    const { buttons } = useButtonStore();

    const { logAction, loadingButtonId } = useActionLogger();

    const renderButton = ({ item }: { item: { id: string, label: string } }) => {
        const isThisLoading = loadingButtonId === item.id;
        const isAnyLoading = loadingButtonId !== null;
        const isDisabled = isAnyLoading && !isThisLoading;

        return (
            <Button
                title={item.label}
                shape="grid"
                onPress={() => logAction(item.label, item.id)}
                loading={isThisLoading}
                disabled={isDisabled}
                style={{ width: '48%', aspectRatio: 2 }}
            />
        );
    };

    return (
        <Screen style={styles.container}>
            <View style={styles.header}>
                <Text style={[styles.vesselTitle, { color: theme.colors.textPrimary }]}>
                    {currentLogbook ? currentLogbook.name : "No Vessel Selected"}
                </Text>
                {!currentLogbook && (
                    <Text style={{ color: theme.colors.textSecondary, marginTop: 5 }}>
                        Go to Profile to select a vessel
                    </Text>
                )}
            </View>

            <View style={styles.gridContainer}>
                <FlatList
                    data={buttons}
                    keyExtractor={(item) => item.id}
                    renderItem={renderButton}
                    numColumns={2}
                    columnWrapperStyle={styles.row}
                    contentContainerStyle={{ paddingBottom: 20 }}
                    showsVerticalScrollIndicator={false}
                    ListEmptyComponent={
                        <Text style={{ color: theme.colors.textSecondary, textAlign: 'center', marginTop: 20 }}>
                            No buttons configured. Go to Profile to add some.
                        </Text>
                    }
                />
            </View>
        </Screen>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 20,
    },
    header: {
        marginBottom: 30,
        alignItems: 'center',
    },
    vesselTitle: {
        fontSize: 32,
        fontWeight: "bold",
        textAlign: "center",
    },
    welcome: {
        fontSize: 28,
        fontWeight: "bold",
        marginBottom: 5,
    },
    gridContainer: {
        flex: 1,
    },
    row: {
        justifyContent: "space-between",
        marginBottom: 15,
    }
});