import { useOwnTheme } from "@/context/themeContext";
import { useAppState } from "@/state/appState";
import { useRouter } from "expo-router";
import React, { useMemo, useState, useEffect, useCallback } from "react";
import {
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    Modal,
    TextInput,
    Alert,
    KeyboardAvoidingView,
    Platform,
    TouchableWithoutFeedback,
    Keyboard,
    FlatList,
    ActivityIndicator
} from "react-native";
import { useSQLiteContext } from "expo-sqlite";
import { addVessel, getVessels, deleteVessel } from "@/database/db";

// Define the shape of a Vessel object
interface Vessel {
    id: string;
    name: string;
    type: string;
    registration: string;
}

export default function Profile() {
    const { theme } = useOwnTheme();
    const styles = useMemo(() => createStyles(theme), [theme]);
    const { user, mode, logout, currentVessel, setCurrentVessel } = useAppState();
    const router = useRouter();
    const db = useSQLiteContext();

    // --- State: Data ---
    const [vessels, setVessels] = useState<Vessel[]>([]);
    const [loadingVessels, setLoadingVessels] = useState(false);

    // --- State: Modals ---
    const [changePasswordVisible, setChangePasswordVisible] = useState(false);
    const [addVesselVisible, setAddVesselVisible] = useState(false);
    const [listVesselsVisible, setListVesselsVisible] = useState(false);

    // --- State: Forms ---
    const [passwordForm, setPasswordForm] = useState({
        currentPassword: "",
        newPassword: "",
        newPasswordConfirm: "",
    });

    const [vesselForm, setVesselForm] = useState({
        name: "",
        type: "",
        registration: "",
    });

    // --- Data Fetching ---
    const fetchVessels = useCallback(async () => {
        try {
            setLoadingVessels(true);
            const result = await getVessels(db);
            setVessels(result as Vessel[]);
        } catch (error) {
            console.error("Failed to fetch vessels", error);
        } finally {
            setLoadingVessels(false);
        }
    }, [db]);

    // Load vessels when profile opens
    useEffect(() => {
        fetchVessels();
    }, [mode, fetchVessels]);

    // --- Handlers ---

    const handleLogout = () => {
        void logout();
        router.replace("/");
    };

    const handleSelectVessel = (vessel: Vessel) => {
        setCurrentVessel({ id: vessel.id, name: vessel.name });
        // Optional: Close modal automatically or just show feedback
        setListVesselsVisible(false);
    };

    const handleAddVessel = async () => {
        const { name, type, registration } = vesselForm;

        if (!name || !type) {
            Alert.alert("Missing Information", "Please enter at least the vessel name and type.");
            return;
        }

        try {
            await addVessel(db, name, type, registration);

            Alert.alert("Success", `Vessel "${name}" added!`, [
                {
                    text: "OK",
                    onPress: async () => {
                        setAddVesselVisible(false);
                        setVesselForm({ name: "", type: "", registration: "" });
                        await fetchVessels(); // Refresh list
                    },
                },
            ]);
        } catch (error) {
            console.error(error);
            Alert.alert("Error", "Could not save vessel.");
        }
    };

    const handleDeleteVessel = (vesselId: string, vesselName: string) => {
        Alert.alert(
            "Delete Vessel",
            `Are you sure you want to delete ${vesselName}?`,
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            await deleteVessel(db, vesselId);
                            await fetchVessels(); // Refresh list
                        } catch (e) {
                            Alert.alert("Error", "Failed to delete vessel");
                        }
                    }
                }
            ]
        )
    }

    const handleChangePassword = () => {
        const { currentPassword, newPassword, newPasswordConfirm } = passwordForm;

        if (!currentPassword || !newPassword || !newPasswordConfirm) {
            Alert.alert("Missing Information", "Please fill in all fields.");
            return;
        }
        if (newPassword !== newPasswordConfirm) {
            Alert.alert("Error", "New passwords do not match.");
            return;
        }

        Alert.alert("Success", "Your password has been updated.", [
            {
                text: "OK",
                onPress: () => {
                    setChangePasswordVisible(false);
                    setPasswordForm({ currentPassword: "", newPassword: "", newPasswordConfirm: "" });
                },
            },
        ]);
    };

    // --- Render Item for Vessel List ---
    const renderVesselItem = ({ item }: { item: Vessel }) => {
        // Check if this item is the selected one
        const isSelected = currentVessel?.id === item.id;

        return (
            <TouchableOpacity
                style={[
                    styles.vesselCard,
                    isSelected && styles.selectedCard // Apply special style
                ]}
                onPress={() => handleSelectVessel(item)}
                onLongPress={() => handleDeleteVessel(item.id, item.name)}
                delayLongPress={500}
            >
                <View style={styles.vesselHeader}>
                    <Text style={styles.vesselName}>{item.name}</Text>
                    {isSelected && <Text style={styles.activeBadge}>ACTIVE</Text>}
                </View>
                <Text style={styles.vesselType}>{item.type}</Text>
                {item.registration ? (
                    <Text style={styles.vesselReg}>Reg: {item.registration}</Text>
                ) : null}
            </TouchableOpacity>
        );
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={{ flex: 1 }}
        >
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <View style={styles.container}>

                    <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                        <Text style={styles.logoutText}>
                            {mode === "online" ? "Logout" : "Exit to login screen"}
                        </Text>
                    </TouchableOpacity>

                    <View style={styles.headerContainer}>
                        <Text style={styles.headerText}>Profile</Text>
                        <Text style={styles.subHeaderText}>
                            Skipper: {user?.name || "Offline User"}
                        </Text>

                        {/* Show Current Vessel in Header */}
                        <Text style={[styles.subHeaderText, { marginTop: 10, color: theme.colors.primary }]}>
                            Current Vessel: {currentVessel ? currentVessel.name : "None Selected"}
                        </Text>
                    </View>

                    {/* Action Buttons Container */}
                    <View style={styles.actionContainer}>

                        {/* 1. Show Vessels Button - Available to all */}
                        <TouchableOpacity
                            style={styles.actionButton}
                            onPress={() => setListVesselsVisible(true)}
                        >
                            <Text style={styles.actionButtonText}>My Vessels ({vessels.length})</Text>
                        </TouchableOpacity>

                        {/* 2. Add Vessel Button - Available to all */}
                        <TouchableOpacity
                            style={styles.actionButton}
                            onPress={() => setAddVesselVisible(true)}
                        >
                            <Text style={styles.actionButtonText}>Add Vessel</Text>
                        </TouchableOpacity>

                        {/* 3. Change Password Button - ONLY FOR ONLINE USERS */}
                        {mode === "online" && (
                            <TouchableOpacity
                                style={styles.actionButton}
                                onPress={() => setChangePasswordVisible(true)}
                            >
                                <Text style={styles.actionButtonText}>Change Password</Text>
                            </TouchableOpacity>
                        )}

                    </View>

                    {/* ------------------------------------------------------------
                      LIST VESSELS MODAL
                     ------------------------------------------------------------ */}
                    <Modal
                        animationType="fade"
                        transparent={true}
                        visible={listVesselsVisible}
                        onRequestClose={() => setListVesselsVisible(false)}
                    >

                        <TouchableWithoutFeedback onPress={() => setListVesselsVisible(false)}>
                            <View style={styles.modalOverlay}>
                                <TouchableWithoutFeedback onPress={() => {}}>
                                    <View style={[styles.modalContent, { maxHeight: '80%' }]}>
                                        <Text style={styles.modalTitle}>Select Active Vessel</Text>
                                        <Text style={styles.modalSubtitle}>Tap to select. Long press to delete.</Text>

                                        {loadingVessels ? (
                                            <ActivityIndicator size="large" color={theme.colors.textPrimary} />
                                        ) : (
                                            <FlatList
                                                data={vessels}
                                                keyExtractor={(item) => item.id}
                                                renderItem={renderVesselItem}
                                                style={{ width: '100%' }}
                                                contentContainerStyle={{ paddingBottom: 20 }}
                                                ListEmptyComponent={<Text style={{ textAlign: 'center', color: theme.colors.textSecondary }}>No vessels.</Text>}
                                            />
                                        )}

                                        <TouchableOpacity
                                            style={[
                                                styles.modalButton,
                                                styles.saveButton,
                                                { marginTop: 20, width: '100%', flex: 0, marginLeft: 0 }
                                            ]}
                                            onPress={() => setListVesselsVisible(false)}
                                        >
                                            <Text style={styles.saveButtonText}>Done</Text>
                                        </TouchableOpacity>
                                    </View>
                                </TouchableWithoutFeedback>
                            </View>
                        </TouchableWithoutFeedback>
                    </Modal>


                    {/* ------------------------------------------------------------
                      ADD VESSEL MODAL
                      ------------------------------------------------------------ */}
                    <Modal
                        animationType="fade"
                        transparent={true}
                        visible={addVesselVisible}
                        onRequestClose={() => setAddVesselVisible(false)}
                    >
                        <TouchableWithoutFeedback onPress={() => setAddVesselVisible(false)}>
                            <View style={styles.modalOverlay}>
                                <TouchableWithoutFeedback onPress={() => {}}>
                                    <View style={styles.modalContent}>
                                        <Text style={styles.modalTitle}>Add New Vessel</Text>

                                        <TextInput
                                            value={vesselForm.name}
                                            onChangeText={(text) => setVesselForm({ ...vesselForm, name: text })}
                                            style={styles.input}
                                            placeholder="Vessel Name"
                                            placeholderTextColor={theme.colors.textSecondary}
                                        />

                                        <TextInput
                                            value={vesselForm.type}
                                            onChangeText={(text) => setVesselForm({ ...vesselForm, type: text })}
                                            style={[styles.input, { marginTop: 15 }]}
                                            placeholder="Type (e.g. Sloop, Motor)"
                                            placeholderTextColor={theme.colors.textSecondary}
                                        />

                                        <TextInput
                                            value={vesselForm.registration}
                                            onChangeText={(text) => setVesselForm({ ...vesselForm, registration: text })}
                                            style={[styles.input, { marginTop: 15 }]}
                                            placeholder="Sail / Registration Number"
                                            placeholderTextColor={theme.colors.textSecondary}
                                        />

                                        <View style={styles.modalButtons}>
                                            <TouchableOpacity
                                                style={[styles.modalButton, styles.cancelButton]}
                                                onPress={() => setAddVesselVisible(false)}
                                            >
                                                <Text style={styles.cancelButtonText}>Cancel</Text>
                                            </TouchableOpacity>

                                            <TouchableOpacity
                                                style={[styles.modalButton, styles.saveButton]}
                                                onPress={handleAddVessel}
                                            >
                                                <Text style={styles.saveButtonText}>Add Boat</Text>
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                </TouchableWithoutFeedback>
                            </View>
                        </TouchableWithoutFeedback>
                    </Modal>

                    {/* ------------------------------------------------------------
                      CHANGE PASSWORD MODAL
                      ------------------------------------------------------------ */}
                    <Modal
                        animationType="fade"
                        transparent={true}
                        visible={changePasswordVisible}
                        onRequestClose={() => setChangePasswordVisible(false)}
                    >
                        <TouchableWithoutFeedback onPress={() => setChangePasswordVisible(false)}>
                            <View style={styles.modalOverlay}>
                                <TouchableWithoutFeedback onPress={() => {}}>
                                    <View style={styles.modalContent}>
                                        <Text style={styles.modalTitle}>Change Password</Text>

                                        <TextInput
                                            value={passwordForm.currentPassword}
                                            onChangeText={(text) =>
                                                setPasswordForm({ ...passwordForm, currentPassword: text })
                                            }
                                            style={styles.input}
                                            placeholder="Current Password"
                                            placeholderTextColor={theme.colors.textSecondary}
                                            secureTextEntry
                                        />

                                        <TextInput
                                            value={passwordForm.newPassword}
                                            onChangeText={(text) =>
                                                setPasswordForm({ ...passwordForm, newPassword: text })
                                            }
                                            style={[styles.input, { marginTop: 15 }]}
                                            placeholder="New Password"
                                            placeholderTextColor={theme.colors.textSecondary}
                                            secureTextEntry
                                        />

                                        <TextInput
                                            value={passwordForm.newPasswordConfirm}
                                            onChangeText={(text) =>
                                                setPasswordForm({ ...passwordForm, newPasswordConfirm: text })
                                            }
                                            style={[styles.input, { marginTop: 15 }]}
                                            placeholder="Confirm New Password"
                                            placeholderTextColor={theme.colors.textSecondary}
                                            secureTextEntry
                                        />

                                        <View style={styles.modalButtons}>
                                            <TouchableOpacity
                                                style={[styles.modalButton, styles.cancelButton]}
                                                onPress={() => setChangePasswordVisible(false)}
                                            >
                                                <Text style={styles.cancelButtonText}>Cancel</Text>
                                            </TouchableOpacity>

                                            <TouchableOpacity
                                                style={[styles.modalButton, styles.saveButton]}
                                                onPress={handleChangePassword}
                                            >
                                                <Text style={styles.saveButtonText}>Save</Text>
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                </TouchableWithoutFeedback>
                            </View>
                        </TouchableWithoutFeedback>
                    </Modal>

                </View>
            </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
    );
}

const createStyles = (theme: any) =>
    StyleSheet.create({
        container: {
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: theme.colors.background,
        },
        logoutButton: {
            position: "absolute",
            top: 20,
            right: 20,
            backgroundColor: theme.colors.surface,
            paddingVertical: 10,
            paddingHorizontal: 20,
            borderRadius: 8,
            zIndex: 10,
            elevation: 5,
        },
        logoutText: {
            color: theme.colors.textPrimary,
            fontSize: 14,
            fontWeight: "600",
        },
        headerContainer: {
            alignItems: "center",
            marginBottom: 40,
        },
        headerText: {
            color: theme.colors.textPrimary,
            fontSize: 28,
            fontWeight: "bold",
            marginBottom: 5,
        },
        subHeaderText: {
            color: theme.colors.textPrimary,
            fontSize: 18,
            fontWeight: "500",
            opacity: 0.8,
        },
        actionContainer: {
            width: '100%',
            alignItems: 'center',
            gap: 15,
        },
        actionButton: {
            backgroundColor: theme.colors.surface,
            borderColor: theme.colors.surface,
            borderWidth: 1,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            paddingVertical: 15,
            width: "70%",
            borderRadius: 30,
            elevation: 3,
            shadowColor: "#000",
            shadowOpacity: 0.2,
            shadowOffset: { width: 0, height: 2 },
        },
        actionButtonText: {
            color: theme.colors.textPrimary,
            fontSize: 18,
            fontWeight: "600",
        },

        // --- Modal Styles ---
        modalOverlay: {
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "rgba(0, 0, 0, 0.7)",
        },
        modalContent: {
            width: "85%",
            backgroundColor: theme.colors.background,
            borderRadius: 20,
            padding: 20,
            alignItems: "center",
            elevation: 5,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.25,
            shadowRadius: 4,
            borderWidth: 1,
            borderColor: theme.colors.surface,
        },
        modalTitle: {
            fontSize: 22,
            fontWeight: "bold",
            color: theme.colors.textPrimary,
            marginBottom: 20,
        },
        modalSubtitle: {
            fontSize: 14,
            color: theme.colors.textSecondary,
            marginBottom: 20 },
        input: {
            width: "100%",
            height: 50,
            backgroundColor: theme.colors.surface,
            borderRadius: 8,
            paddingHorizontal: 15,
            fontSize: 16,
            color: theme.colors.textPrimary,
            borderWidth: 1,
            borderColor: theme.colors.surface,
        },
        modalButtons: {
            flexDirection: "row",
            justifyContent: "space-between",
            width: "100%",
            marginTop: 25,
        },
        modalButton: {
            flex: 1,
            paddingVertical: 12,
            borderRadius: 10,
            alignItems: "center",
            justifyContent: "center",
        },
        cancelButton: {
            marginRight: 10,
            backgroundColor: "transparent",
            borderWidth: 1,
            borderColor: theme.colors.textSecondary || "#888",
        },
        saveButton: {
            marginLeft: 10,
            backgroundColor: theme.colors.surface,
        },
        cancelButtonText: {
            color: theme.colors.textPrimary,
            fontWeight: "600",
            fontSize: 16,
        },
        saveButtonText: {
            color: theme.colors.textPrimary,
            fontWeight: "bold",
            fontSize: 16,
        },

        // --- Vessel Card Styles (Mini replica of Event Card) ---
        vesselCard: {
            backgroundColor: theme.colors.surface,
            borderRadius: 10,
            padding: 16,
            marginBottom: 12,
            width: '100%',
            borderWidth: 1,
            borderColor: 'transparent', // Default border
        },
        selectedCard: {
            borderColor: theme.colors.primary,
            backgroundColor: theme.colors.surface,
        },
        vesselHeader: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginBottom: 5,
        },
        vesselName: {
            color: theme.colors.textPrimary,
            fontSize: 18,
            fontWeight: 'bold',
        },
        vesselType: {
            color: theme.colors.textSecondary,
            fontSize: 14,
            fontStyle: 'italic',
        },
        vesselReg: {
            color: theme.colors.textSecondary,
            fontSize: 12,
            fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
        },
        activeBadge: {
            color: theme.colors.primary,
            fontSize: 12,
            fontWeight: 'bold'
        },
    });