import React, { useState } from "react";
import { View, Text, StyleSheet, Alert } from "react-native";
import { useRouter } from "expo-router";
import { Screen } from "@/src/components/Screen";
import { Button } from "@/src/components/Button";
import { Card } from "@/src/components/Card";
import { useOwnTheme } from "@/src/context/ThemeContext";
import { useVessels, useAddVessel, useDeleteVessel, useSyncVessels, useMergeLocalData } from "@/src/features/logbooks/hooks";
import { useAuthStore } from "@/src/store/authStore";
import { useLogbookStore } from "@/src/store/logbookStore";
import { useButtonStore } from "@/src/store/buttonStore";

// Modals
import { AddVesselModal, AddVesselFormData } from "@/src/components/modals/AddVesselModal";
import { VesselSelectorModal } from "@/src/components/modals/VesselSelectorModal";
import { EditButtonsModal } from "@/src/components/modals/EditButtonsModal";

export default function Profile() {
	const { theme } = useOwnTheme();
	const router = useRouter();

	const { user, mode, logout } = useAuthStore();
	const { currentLogbook, setCurrentLogbook } = useLogbookStore();
	const { buttons, addButton, removeButton } = useButtonStore();

	// Data hooks
	const { data: vessels = [] } = useVessels();
	const addVesselMutation = useAddVessel();
	const deleteVesselMutation = useDeleteVessel();
	const syncVesselsMutation = useSyncVessels();
	const mergeMutation = useMergeLocalData();

	// Modal visibility state
	const [isVesselListOpen, setVesselListOpen] = useState(false);
	const [isAddVesselOpen, setAddVesselOpen] = useState(false);
	const [isEditButtonsOpen, setEditButtonsOpen] = useState(false);

	const handleLogout = async () => {
		logout();
		setCurrentLogbook(null);
		router.replace("/");
	};

	const handleAddVessel = (data: AddVesselFormData) => {
		addVesselMutation.mutate(data, {
			onSuccess: () => setAddVesselOpen(false),
			onError: (error) => {
				console.error("Failed to add vessel: ", error);
				Alert.alert("Error", "Could not save vessel. Check logs for details.");
			},
		});
	};

	return (
		<Screen style={styles.container}>
			<Button title={mode === "offline" ? "Exit to login screen" : "Logout"} variant="danger" shape="pill" onPress={handleLogout} style={styles.headerLogoutBtn} />

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
				<Button title="Add New Vessel" onPress={() => setAddVesselOpen(true)} />
				<Button title="Get vessels from server" onPress={() => syncVesselsMutation.mutate()} loading={syncVesselsMutation.isPending} />
				{user && (
					<Button title="Get vessels from phone" onPress={() => mergeMutation.mutate()} loading={mergeMutation.isPending} />
				)}
				<Button title="Edit homescreen buttons" onPress={() => setEditButtonsOpen(true)} variant="outline" />
			</View>

			{/* Modal injections */}
			<VesselSelectorModal
				visible={isVesselListOpen}
				onClose={() => setVesselListOpen(false)}
				vessels={vessels}
				onSelect={(vessel) => {
					setCurrentLogbook(vessel);
					setVesselListOpen(false);
				}}
				onDelete={(id) => deleteVesselMutation.mutate(id)}
			/>

			<AddVesselModal
				visible={isAddVesselOpen}
				onClose={() => setAddVesselOpen(false)}
				onSubmit={handleAddVessel}
				loading={addVesselMutation.isPending}
			/>

			<EditButtonsModal
				visible={isEditButtonsOpen}
				onClose={() => setEditButtonsOpen(false)}
				buttons={buttons}
				onAdd={addButton}
				onRemove={removeButton}
			/>
		</Screen>
	);
}

const styles = StyleSheet.create({
	container: {
		padding: 20
	},
	headerLogoutBtn: {
		position: "absolute",
		top: 0,
		right: 15,
		zIndex: 10
	},
	header: {
		alignItems: "center",
		marginVertical: 30,
		marginTop: 60
	},
	userName: {
		fontSize: 24,
		fontWeight: "bold"
	},
	userStatus: {
		fontSize: 14,
		marginTop: 5
	},
	section: {
		marginBottom: 30
	},
	sectionTitle: {
		fontSize: 14,
		fontWeight: "600",
		marginBottom: 10,
		textTransform: "uppercase"
	},
	vesselSelector: {
		alignItems: "center"
	},
	vesselName: {
		fontSize: 20,
		fontWeight: "bold",
		marginBottom: 4
	},
	menu: {
		gap: 15,
		width: "100%"
	}
});