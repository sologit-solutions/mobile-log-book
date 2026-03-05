import React, { useState } from "react";
import {
	View,
	Text,
	StyleSheet,
	Modal,
	FlatList,
	TouchableOpacity,
	ScrollView,
	Pressable,
	Platform,
	KeyboardAvoidingView,
	Keyboard,
	Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { Screen } from "@/src/components/Screen";
import { Button } from "@/src/components/Button";
import { Input } from "@/src/components/Input";
import { Card } from "@/src/components/Card";
import { useOwnTheme } from "@/src/context/ThemeContext";
import {
	useVessels,
	useAddVessel,
	useDeleteVessel,
	useSyncVessels,
	useMergeLocalData
} from "@/src/features/logbooks/hooks";
import { useAuthStore } from "@/src/store/authStore";
import { useLogbookStore } from "@/src/store/logbookStore";
import { useButtonStore } from "@/src/store/buttonStore";

export default function Profile() {
	const { theme } = useOwnTheme();
	const router = useRouter();

	const { user, mode, logout } = useAuthStore();
	const { currentLogbook, setCurrentLogbook } = useLogbookStore();

	// Button hooks
	const { buttons, addButton, removeButton } = useButtonStore();

	// Data Hooks
	const { data: vessels = [] } = useVessels();
	const addVesselMutation = useAddVessel();
	const deleteVesselMutation = useDeleteVessel();
	const syncVesselsMutation = useSyncVessels();
	const mergeMutation = useMergeLocalData();

	// UI State
	const [isVesselListOpen, setVesselListOpen] = useState(false);
	const [isAddVesselOpen, setAddVesselOpen] = useState(false);
	const [isEditButtonsOpen, setEditButtonsOpen] = useState(false);

	// Form State
	const [newVessel, setNewVessel] = useState({ name: "", type: "", registration: "" });
	const [newButtonLabel, setNewButtonLabel] = useState("");

	const handleLogout = async () => {
		logout();
		setCurrentLogbook(null);
		router.replace("/");
	};

	const handleAddVessel = () => {
		if (!newVessel.name) {
			Alert.alert("Required", "Please enter a vessel name.");
			return;
		}

		addVesselMutation.mutate(newVessel, {
			onSuccess: () => {
				setAddVesselOpen(false);
				setNewVessel({ name: "", type: "", registration: "" });
			},
			onError: (error) => {
				console.error("Failed to add vesel: ", error);
				Alert.alert("Error", "Could not save vessel. Check logs for details.");
			},
		});
	};

	const handleDeleteVessel = (id: string) => {
		deleteVesselMutation.mutate(id);
	};

	const handleAddButton = () => {
		if (!newButtonLabel.trim()) return;
		addButton(newButtonLabel.trim());
		setNewButtonLabel("");
	};

	return (
		<Screen style={styles.container}>
			{/* --- TOP RIGHT LOGOUT BUTTON (RED) --- */}
			<Button title={mode === "offline" ? "Exit to login screen" : "Logout"} variant="danger" shape="pill" onPress={handleLogout} style={{ position: "absolute", top: 0, right: 15, zIndex: 10 }} />

			<View style={styles.header}>
				<Text style={[styles.userName, { color: theme.colors.textPrimary }]}>{user?.name || "Offline User"}</Text>
				<Text style={[styles.userStatus, { color: theme.colors.textSecondary }]}>{mode === "online" ? "Online Account" : "Offline Mode"}</Text>
			</View>

			<View style={styles.section}>
				<Text style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}>Current Vessel</Text>
				<Card onPress={() => setVesselListOpen(true)} style={styles.vesselSelector}>
					<Text style={[styles.vesselName, { color: theme.colors.primary }]}>{currentLogbook ? currentLogbook.name : "Select a vessel..."}</Text>
					<Text style={{ color: theme.colors.textSecondary }}>Tap to change</Text>
				</Card>
			</View>

			<View style={styles.menu}>
				<Button
					title="Add New Vessel"
					onPress={() => setAddVesselOpen(true)}
				/>

				<Button
					title="Get vessels from server"
					onPress={() => syncVesselsMutation.mutate()}
					loading={syncVesselsMutation.isPending}
				/>

				{user && (
					<Button
						title="Get vessels from phone"
						onPress={() => mergeMutation.mutate()}
						loading={mergeMutation.isPending}
					/>
				)}

				<Button
					title="Edit homescreen buttons"
					onPress={() => setEditButtonsOpen(true)}
					variant="outline"
				/>
			</View>

			{/* --- Modal: Vessel List --- */}
			<Modal visible={isVesselListOpen} transparent animationType="fade" onRequestClose={() => setVesselListOpen(false)}>
				<View style={styles.modalOverlay}>
					<View style={[styles.modalContent, { backgroundColor: theme.colors.background, borderColor: theme.colors.surface }]}>
						<Text style={[styles.modalTitle, { color: theme.colors.textPrimary }]}>Select Vessel</Text>
						<Text style={[styles.longPressHint, { color: theme.colors.textSecondary }]}>Long press to delete</Text>

						{/* List Content */}
						<FlatList
							data={vessels}
							keyExtractor={(i) => i.id}
							style={{ maxHeight: 300, width: "100%", marginBottom: 10 }}
							renderItem={({ item }) => (
								<TouchableOpacity
									style={[styles.vesselCard, { backgroundColor: theme.colors.background }]}
									onPress={() => {
										setCurrentLogbook({ id: item.id, name: item.name });
										setVesselListOpen(false);
									}}
									onLongPress={() => {
										Alert.alert(
											"Delete Vessel",
											`Are you sure you want to permanently delete "${item.name}"?`,
											[
												{ text: "Cancel", style: "cancel" },
												{
													text: "Delete",
													style: "destructive",
													onPress: () => handleDeleteVessel(item.id)
												}
											]
										);
									}}
									delayLongPress={500}
								>
									<View style={{ flex: 1 }}>
										<Text
											style={[styles.vesselName, { color: theme.colors.textPrimary }]}
											numberOfLines={1}
											ellipsizeMode="tail"
										>
											{item.name}
										</Text>
									</View>
								</TouchableOpacity>
							)}
						/>

						{/* Actions (Unified with Add Modal) */}
						<View style={styles.modalActions}>
							<Button title="Close" variant="outline" onPress={() => setVesselListOpen(false)} style={{ flex: 1 }} />
						</View>
					</View>
				</View>
			</Modal>

			{/* --- Modal: Add Vessel --- */}
			<Modal visible={isAddVesselOpen} transparent animationType="fade" onRequestClose={() => setAddVesselOpen(false)}>
				<KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.modalOverlay}>
					<ScrollView contentContainerStyle={styles.modalScroll}>
						<Pressable style={{ flex: 1, justifyContent: "center", alignItems: "center" }} onPress={Keyboard.dismiss}>
							<View style={[styles.modalContent, { backgroundColor: theme.colors.background, borderColor: theme.colors.surface }]}>
								<Text style={[styles.modalTitle, { color: theme.colors.textPrimary }]}>New Vessel</Text>

								<Input placeholder="Vessel Name" value={newVessel.name} onChangeText={(t) => setNewVessel({ ...newVessel, name: t })} autoCapitalize="none" />
								<Input placeholder="Type (e.g. Sloop)" value={newVessel.type} onChangeText={(t) => setNewVessel({ ...newVessel, type: t })} autoCapitalize="none" />
								<Input
									placeholder="Registration #"
									value={newVessel.registration}
									onChangeText={(t) => setNewVessel({ ...newVessel, registration: t })}
									autoCapitalize="none"
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

			<Modal visible={isEditButtonsOpen} transparent animationType="fade" onRequestClose={() => setEditButtonsOpen(false)}>
				<KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.fullScreenOverlay}>
					{/* Large Modal Content - Fills most of the screen */}
					<View style={[styles.largeModalContent, { backgroundColor: theme.colors.background, borderColor: theme.colors.surface }]}>
						{/* 1. HEADER */}
						<Text style={[styles.largeModalTitle, { color: theme.colors.textPrimary }]}>Manage Buttons</Text>

						{/* 2. SCROLLABLE LIST (Middle) */}
						<ScrollView style={styles.buttonListScroll}>
							{buttons.length === 0 ? (
								<Text style={{ color: theme.colors.textSecondary, textAlign: "center", marginTop: 20 }}>No buttons added yet.</Text>
							) : (
								buttons.map((item) => (
									<View key={item.id} style={styles.buttonRowItem}>
										<Text style={{ color: theme.colors.textPrimary, fontSize: 18 }}>{item.label}</Text>
										<Button title="Remove" variant="danger" shape="small" onPress={() => removeButton(item.id)} />
									</View>
								))
							)}
						</ScrollView>

						{/* 3. BOTTOM CONTROLS (Updated Layout) */}
						<View style={[styles.bottomControlBar, { borderTopColor: theme.colors.surface }]}>
							{/* Input Field First (Full width) */}
							<Input
								placeholder="New Button Label"
								value={newButtonLabel}
								onChangeText={setNewButtonLabel}
								style={{ width: "100%", marginBottom: 15 }} // Added margin below input
							/>

							{/* Two Buttons Row Underneath */}
							<View style={styles.actionButtonRow}>
								{/* Add Button */}
								<Button title="Add" shape="grid" onPress={handleAddButton} style={{ flex: 1, height: 55, marginRight: 10 }} />

								{/* Done Button */}
								<Button title="Done" variant="outline" shape="grid" onPress={() => setEditButtonsOpen(false)} style={{ flex: 1, height: 55 }} />
							</View>
						</View>
					</View>
				</KeyboardAvoidingView>
			</Modal>
		</Screen>
	);
}

const styles = StyleSheet.create({
	container: {
		padding: 20,
	},
	btnTextWhite: {
		color: "white",
		fontWeight: "600",
		fontSize: 14,
	},
	headerLogoutBtn: {
		position: "absolute",
		top: 0,
		right: 15,
		paddingVertical: 8,
		paddingHorizontal: 15,
		borderRadius: 20,
		zIndex: 10,
		elevation: 3,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.2,
		shadowRadius: 2,
	},
	deleteBtn: {
		paddingVertical: 6,
		paddingHorizontal: 12,
		borderRadius: 15,
	},
	header: {
		alignItems: "center",
		marginVertical: 30,
		marginTop: 60,
	},
	userName: {
		fontSize: 24,
		fontWeight: "bold",
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
		fontWeight: "600",
		marginBottom: 10,
		textTransform: "uppercase",
	},
	vesselSelector: {
		alignItems: "center",
	},
	vesselName: {
		fontSize: 20,
		fontWeight: "bold",
		marginBottom: 4,
	},
	menu: {
		gap: 15,
		width: "100%",
	},
	// --- STANDARD MODAL STYLES ---
	modalOverlay: {
		flex: 1,
		backgroundColor: "rgba(0,0,0,0.7)",
		justifyContent: "center",
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
		fontWeight: "bold",
		marginBottom: 5,
		textAlign: "center",
	},
	modalActions: {
		flexDirection: "row",
		marginTop: 20,
		width: "100%",
		justifyContent: "space-between",
	},
	vesselItem: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		paddingVertical: 15,
		borderBottomWidth: 1,
		borderBottomColor: "#333",
	},

	// --- NEW LARGE MODAL STYLES ---
	fullScreenOverlay: {
		flex: 1,
		backgroundColor: "rgba(0,0,0,0.85)",
		justifyContent: "center",
		padding: 20,
	},
	largeModalContent: {
		flex: 1,
		borderRadius: 15,
		borderWidth: 1,
		overflow: "hidden",
		padding: 20,
	},
	largeModalTitle: {
		fontSize: 24,
		fontWeight: "bold",
		marginBottom: 20,
		textAlign: "center",
	},
	buttonListScroll: {
		flex: 1,
		marginBottom: 20,
	},
	buttonRowItem: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		paddingVertical: 15,
		borderBottomWidth: 1,
		borderBottomColor: "#333",
	},
	bottomControlBar: {
		flexDirection: "column",
		borderTopWidth: 1,
		paddingTop: 15,
	},
	actionButtonRow: {
		flexDirection: "row",
		width: "100%",
		justifyContent: "space-between",
	},
	controlBtn: {
		height: 50,
		justifyContent: "center",
		alignItems: "center",
		paddingHorizontal: 20,
		borderRadius: 10,
	},
	sectionHeader: {
		marginBottom: 10,
	},
	longPressHint: {
		fontSize: 12,
		textAlign: "center",
	},
	vesselCard: {
		padding: 20,
		borderBottomWidth: 1,
		borderColor: '#eee',
		flexDirection: 'row',
		alignItems: 'center',
	},
});
