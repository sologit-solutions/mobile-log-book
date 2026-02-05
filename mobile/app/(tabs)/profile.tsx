import React, { useState } from "react";
import { View, Text, StyleSheet, Modal, FlatList, TouchableOpacity, ScrollView, Pressable, Platform, KeyboardAvoidingView, Keyboard, TouchableWithoutFeedback } from "react-native";
import { useRouter } from "expo-router";
import { Screen } from "@/src/components/Screen";
import { Button } from "@/src/components/Button";
import { Input } from "@/src/components/Input";
import { Card } from "@/src/components/Card";
import { useOwnTheme } from "@/src/context/ThemeContext";
import { useVessels, useAddVessel, useDeleteVessel } from "@/src/features/vessels/hooks";
import { useAuthStore } from "@/src/store/authStore";
import { useVesselStore } from "@/src/store/vesselStore";

export default function Profile() {
    const { theme } = useOwnTheme();
    const router = useRouter();

    const { user, mode, logout } = useAuthStore();
    const { currentVessel, setCurrentVessel } = useVesselStore();

    // Data Hooks
    const { data: vessels = [] } = useVessels();
    const addVesselMutation = useAddVessel();
    const deleteVesselMutation = useDeleteVessel();

    // UI State
    const [isVesselListOpen, setVesselListOpen] = useState(false);
    const [isAddVesselOpen, setAddVesselOpen] = useState(false);

    // Form State
    const [newVessel, setNewVessel] = useState({ name: "", type: "", registration: "" });

    const handleLogout = async () => {
        await logout();
        router.replace("/");
    };

    const handleAddVessel = () => {
        if (!newVessel.name) return;
        addVesselMutation.mutate(newVessel, {
            onSuccess: () => {
                setAddVesselOpen(false);
                setNewVessel({ name: "", type: "", registration: "" });
            }
        });
    };

    const handleDeleteVessel = (id: string) => {
        deleteVesselMutation.mutate(id);
    };

    return (
        <Screen style={styles.container}>
            {/* --- TOP RIGHT LOGOUT BUTTON (RED) --- */}
            <TouchableOpacity
                onPress={handleLogout}
                style={[styles.headerLogoutBtn, { backgroundColor: theme.colors.danger }]}
            >
                <Text style={styles.btnTextWhite}>
                    {mode === 'offline' ? "Exit to login screen" : "Logout"}
                </Text>
            </TouchableOpacity>

            <View style={styles.header}>
                <Text style={[styles.userName, { color: theme.colors.textPrimary }]}>
                    {user?.name || "Offline User"}
                </Text>
                <Text style={[styles.userStatus, { color: theme.colors.textSecondary }]}>
                    {mode === 'online' ? 'Online Account' : 'Offline Mode'}
                </Text>
            </View>

            <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}>Current Vessel</Text>
                <Card onPress={() => setVesselListOpen(true)} style={styles.vesselSelector}>
                    <Text style={[styles.vesselName, { color: theme.colors.primary }]}>
                        {currentVessel ? currentVessel.name : "Select a vessel..."}
                    </Text>
                    <Text style={{ color: theme.colors.textSecondary }}>Tap to change</Text>
                </Card>
            </View>

            <View style={styles.menu}>
                <Button
                    title="Add New Vessel"
                    onPress={() => setAddVesselOpen(true)}
                    style={styles.menuItem}
                />
            </View>

            {/* --- Modal: Vessel List --- */}
            <Modal visible={isVesselListOpen} transparent animationType="fade" onRequestClose={() => setVesselListOpen(false)}>
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { backgroundColor: theme.colors.background, borderColor: theme.colors.surface }]}>
                        <Text style={[styles.modalTitle, { color: theme.colors.textPrimary }]}>Select Vessel</Text>

                        {/* List Content */}
                        <FlatList
                            data={vessels}
                            keyExtractor={i => i.id}
                            style={{ maxHeight: 300, width: '100%', marginBottom: 10 }}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={styles.vesselItem}
                                    onPress={() => {
                                        setCurrentVessel({ id: item.id, name: item.name });
                                        setVesselListOpen(false);
                                    }}
                                >
                                    <Text style={{ color: theme.colors.textPrimary, fontSize: 18 }}>{item.name}</Text>

                                    {/* DELETE BUTTON - Styled to match Logout */}
                                    <TouchableOpacity
                                        onPress={() => handleDeleteVessel(item.id)}
                                        style={[styles.deleteBtn, { backgroundColor: theme.colors.danger }]}
                                    >
                                        <Text style={styles.btnTextWhite}>Delete</Text>
                                    </TouchableOpacity>
                                </TouchableOpacity>
                            )}
                        />

                        {/* Actions (Unified with Add Modal) */}
                        <View style={styles.modalActions}>
                            <Button
                                title="Close"
                                variant="outline"
                                onPress={() => setVesselListOpen(false)}
                                style={{ flex: 1 }}
                            />
                        </View>
                    </View>
                </View>
            </Modal>

            {/* --- Modal: Add Vessel --- */}
            <Modal visible={isAddVesselOpen} transparent animationType="fade" onRequestClose={() => setAddVesselOpen(false)}>
                <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.modalOverlay}>
                    <ScrollView contentContainerStyle={styles.modalScroll}>
                        <Pressable style={{flex: 1, justifyContent: 'center', alignItems: 'center'}} onPress={Keyboard.dismiss}>
                            <View style={[styles.modalContent, { backgroundColor: theme.colors.background, borderColor: theme.colors.surface }]}>
                                <Text style={[styles.modalTitle, { color: theme.colors.textPrimary }]}>New Vessel</Text>

                                <Input
                                    placeholder="Vessel Name"
                                    value={newVessel.name}
                                    onChangeText={t => setNewVessel({...newVessel, name: t})}
                                />
                                <Input
                                    placeholder="Type (e.g. Sloop)"
                                    value={newVessel.type}
                                    onChangeText={t => setNewVessel({...newVessel, type: t})}
                                />
                                <Input
                                    placeholder="Registration #"
                                    value={newVessel.registration}
                                    onChangeText={t => setNewVessel({...newVessel, registration: t})}
                                />

                                <View style={styles.modalActions}>
                                    <Button title="Cancel" variant="outline" onPress={() => setAddVesselOpen(false)} style={{ flex: 1, marginRight: 10 }} />
                                    <Button title="Save" onPress={handleAddVessel} loading={addVesselMutation.isPending} style={{ flex: 1, marginLeft: 10 }} />
                                </View>
                            </View>
                        </Pressable>
                    </ScrollView>
                </KeyboardAvoidingView>
            </Modal>

        </Screen>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 20,
    },
    // REUSABLE TEXT STYLE
    btnTextWhite: {
        color: 'white',
        fontWeight: '600',
        fontSize: 14,
    },
    // HEADER LOGOUT BUTTON
    headerLogoutBtn: {
        position: 'absolute',
        top: 0,
        right: 15,
        paddingVertical: 8,
        paddingHorizontal: 15,
        borderRadius: 20,
        zIndex: 10,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
    },
    // LIST DELETE BUTTON (Matches Header Logout Style)
    deleteBtn: {
        paddingVertical: 8,
        paddingHorizontal: 15,
        borderRadius: 20,
    },
    header: {
        alignItems: 'center',
        marginVertical: 30,
        marginTop: 60,
    },
    userName: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    userStatus: {
        fontSize: 14,
        marginTop: 5,
    },
    section: {
        marginBottom: 30,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 10,
        textTransform: 'uppercase',
    },
    vesselSelector: {
        alignItems: 'center',
    },
    vesselName: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    menu: {
        gap: 15,
        width: '100%',
    },
    menuItem: {
        width: '100%',
        height: 55,
        justifyContent: 'center',
    },
    // Unified Modal Styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.7)',
        justifyContent: 'center',
        paddingHorizontal: 20,
    },
    modalScroll: {
        flexGrow: 1,
        justifyContent: "center",
    },
    modalContent: {
        borderRadius: 20,
        padding: 20,
        elevation: 5,
        width: "100%",
        borderWidth: 1,
    },
    modalTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
    },
    modalActions: {
        flexDirection: 'row',
        marginTop: 20,
        width: '100%',
        justifyContent: 'space-between',
    },
    vesselItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#333',
    }
});