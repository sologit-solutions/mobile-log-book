import React, { useState, useEffect } from "react";
import {
	StyleSheet,
	View,
	Text,
	Image,
	Alert,
	Modal,
	TouchableOpacity,
	ScrollView,
	KeyboardAvoidingView,
	Platform,
	Pressable,
	Keyboard,
} from "react-native";
import { z } from "zod";
import { useRouter } from "expo-router";
import { Screen } from "@/src/components/Screen";
import { Input } from "@/src/components/Input";
import { Button } from "@/src/components/Button";
import { useOwnTheme } from "@/src/context/ThemeContext";
import { registerUser, loginUser } from "@/src/utils/api";
import { useAuthStore } from "@/src/store/authStore";

export default function LoginScreen() {
	const router = useRouter();
	const { theme } = useOwnTheme();
	const { login, setMode } = useAuthStore();

	// --- Main Form State ---
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [loading, setLoading] = useState(false);

	// --- Keyboard State ---
	const [isKeyboardVisible, setKeyboardVisible] = useState(false);

	useEffect(() => {
		const showEvent = Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
		const hideEvent = Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";

		const showSubscription = Keyboard.addListener(showEvent, () => {
			setKeyboardVisible(true);
		});
		const hideSubscription = Keyboard.addListener(hideEvent, () => {
			setKeyboardVisible(false);
		});

		return () => {
			showSubscription.remove();
			hideSubscription.remove();
		};
	}, []);

	// --- Modal States ---
	const [signupVisible, setSignupVisible] = useState(false);
	const [forgotPassVisible, setForgotPassVisible] = useState(false);

	// --- Modal Form Data ---
	const [signupData, setSignupData] = useState({ name: "", email: "", password: "", confirm: "" });
	const [resetEmail, setResetEmail] = useState("");

	// --- Zod validators ---
	const signupSchema = z
		.object({
			name: z.string().min(1, "Username is required."),
			email: z.string().email("Please enter a valid email address."),
			password: z.string().min(8, "Password must be at least 8 characters long."),
			confirm: z.string(),
		})
		.refine((data) => data.password === data.confirm, {
			message: "Passwords do not match.",
			path: ["confirm"],
		});

	const loginSchema = z.object({
		email: z.string().min(1, "Email or username is required."),
		password: z.string().min(1, "Password is required."),
	});

	// --- Handlers ---
	const handleLogin = async () => {
		if (!email || !password) {
			Alert.alert("Error", "Please enter email and password");
			return;
		}

		const validationResult = loginSchema.safeParse({ email, password });

		if (!validationResult.success) {
			const firstError = validationResult.error.issues[0].message;
			return Alert.alert("Validation Error", firstError);
		}

		setLoading(true);
		try {
			const authPayload = await loginUser(email, password);

			if (authPayload) {
				login(authPayload.user, authPayload.token);
				router.replace("/(tabs)/home");
			}
		} catch (error: any) {
			Alert.alert("Login Failed", error.message);
		} finally {
			setLoading(false);
		}
	};

	const handleOfflineMode = () => {
		setMode("offline");
		router.replace("/(tabs)/home");
	};

	const handleSignup = async () => {
		if (!signupData.name || !signupData.email || !signupData.password) return Alert.alert("Error", "Fill all fields");
		if (signupData.password !== signupData.confirm) return Alert.alert("Error", "Passwords do not match");

		const validationResult = signupSchema.safeParse(signupData);

		if (!validationResult.success) {
			const firstError = validationResult.error.issues[0].message;
			return Alert.alert("Validation Error", firstError);
		}

		setLoading(true);
		try {
			const authPayload = await registerUser(signupData.email, signupData.name, signupData.password);

			if (authPayload) {
				Alert.alert("Success", `Account created for ${authPayload.user.name}!`, [
					{
						text: "OK",
						onPress: () => {
							login(authPayload.user, authPayload.token);
							setSignupVisible(false);
							setSignupData({ name: "", email: "", password: "", confirm: "" });
							router.replace("/(tabs)/home");
						},
					},
				]);
			}
		} catch (error: any) {
			Alert.alert("Registration Failed", error.message);
		} finally {
			setLoading(false);
		}
	};

	const handleResetPassword = () => {
		if (!resetEmail) return Alert.alert("Error", "Enter your email");
		Alert.alert("Check your email", `Link sent to ${resetEmail}`, [
			{
				text: "OK",
				onPress: () => {
					setForgotPassVisible(false);
					setResetEmail("");
				},
			},
		]);
	};

	return (
		<Screen style={styles.container}>
			<KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
				<ScrollView
					contentContainerStyle={styles.innerContainer}
					keyboardShouldPersistTaps="handled"
					bounces={false}
					showsVerticalScrollIndicator={false}
				>
					{/* 1. Main Content: Logo + Form */}
					<View style={styles.content}>
						<View style={styles.header}>
							<Image
								source={require("@/assets/images/boat-outline.png")}
								style={[styles.logo, { tintColor: theme.colors.logo }]}
								resizeMode="contain"
							/>
							<Text style={[styles.title, { color: theme.colors.textPrimary }]}>Login to Logify</Text>
						</View>

						<View style={styles.formContainer}>
							<Input
								placeholder="Email"
								value={email}
								onChangeText={setEmail}
								autoCapitalize="none"
								keyboardType="email-address"
								style={styles.bigInput}
							/>
							<Input placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry style={styles.bigInput} />

							{/* Unified standard shape for the sign-in button */}
							<Button title="Sign in" onPress={handleLogin} loading={loading} style={{ marginTop: 10 }} />

							{!isKeyboardVisible && (
								<TouchableOpacity style={styles.forgotPassLink} onPress={() => setForgotPassVisible(true)}>
									<Text style={[styles.linkText, { color: theme.colors.textPrimary }]}>Forgot Password?</Text>
								</TouchableOpacity>
							)}
						</View>
					</View>

					{/* 2. Footer: Offline & Sign Up */}
					{!isKeyboardVisible && (
						<View style={styles.footer}>

							{/* Unified offline button mapped to the standard layout */}
							<Button
								title="Use app offline"
								onPress={handleOfflineMode}
								style={{ marginBottom: 10 }}
							/>

							<TouchableOpacity onPress={() => setSignupVisible(true)} style={styles.signupContainer}>
								<Text style={{ color: theme.colors.textPrimary }}>
									Don&#39;t have an account? <Text style={styles.underline}>Sign up here</Text>
								</Text>
							</TouchableOpacity>
						</View>
					)}
				</ScrollView>
			</KeyboardAvoidingView>

			{/* ================= MODALS ================= */}

			{/* Sign Up Modal */}
			<Modal visible={signupVisible} transparent animationType="fade" onRequestClose={() => setSignupVisible(false)}>
				<KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.modalOverlay}>
					<ScrollView contentContainerStyle={styles.modalScroll}>
						<Pressable style={{ flex: 1, justifyContent: "center", alignItems: "center" }} onPress={Keyboard.dismiss}>
							<View style={[styles.modalContent, { backgroundColor: theme.colors.background, borderColor: theme.colors.surface }]}>
								<Text style={[styles.modalTitle, { color: theme.colors.textPrimary }]}>Create Account</Text>

								<Input
									placeholder="Name"
									value={signupData.name}
									onChangeText={(t) => setSignupData({ ...signupData, name: t })}
									style={styles.bigInput}
								/>
								<Input
									placeholder="Email"
									value={signupData.email}
									onChangeText={(t) => setSignupData({ ...signupData, email: t })}
									autoCapitalize="none"
									style={styles.bigInput}
								/>
								<Input
									placeholder="Password"
									value={signupData.password}
									onChangeText={(t) => setSignupData({ ...signupData, password: t })}
									secureTextEntry
									style={styles.bigInput}
								/>
								<Input
									placeholder="Confirm Password"
									value={signupData.confirm}
									onChangeText={(t) => setSignupData({ ...signupData, confirm: t })}
									secureTextEntry
									style={styles.bigInput}
								/>

								<View style={styles.modalActions}>
									<Button title="Cancel" variant="outline" shape="grid" onPress={() => setSignupVisible(false)} style={{ flex: 1, height: 55, marginRight: 10 }} />
									<Button title="Sign Up" shape="grid" onPress={handleSignup} loading={loading} style={{ flex: 1, height: 55, marginLeft: 10 }} />
								</View>
							</View>
						</Pressable>
					</ScrollView>
				</KeyboardAvoidingView>
			</Modal>

			{/* Forgot Password Modal */}
			<Modal visible={forgotPassVisible} transparent animationType="fade" onRequestClose={() => setForgotPassVisible(false)}>
				<KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.modalOverlay}>
					<ScrollView contentContainerStyle={styles.modalScroll}>
						<Pressable style={{ flex: 1, justifyContent: "center", alignItems: "center" }} onPress={Keyboard.dismiss}>
							<View style={[styles.modalContent, { backgroundColor: theme.colors.background, borderColor: theme.colors.surface }]}>
								<Text style={[styles.modalTitle, { color: theme.colors.textPrimary }]}>Reset Password</Text>
								<Text style={{ color: theme.colors.textSecondary, marginBottom: 20, textAlign: "center" }}>
									Enter your email to receive a reset link.
								</Text>

								<Input placeholder="Email" value={resetEmail} onChangeText={setResetEmail} autoCapitalize="none" style={styles.bigInput} />

								<View style={styles.modalActions}>
									<Button title="Cancel" variant="outline" shape="grid" onPress={() => setForgotPassVisible(false)} style={{ flex: 1, height: 55, marginRight: 10 }} />
									<Button title="Send Link" shape="grid" onPress={handleResetPassword} style={{ flex: 1, height: 55, marginLeft: 10 }} />
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
		flex: 1,
	},
	innerContainer: {
		flexGrow: 1,
		paddingHorizontal: 30,
		justifyContent: "space-between",
	},
	content: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		width: "100%",
	},
	header: {
		marginBottom: 30,
		width: "100%",
		alignItems: "center",
	},
	logo: {
		width: 100,
		height: 100,
		marginBottom: 10,
	},
	title: {
		fontSize: 27,
		fontWeight: "bold",
		padding: 5,
		textAlign: "center",
	},
	formContainer: {
		width: "100%",
	},
	bigInput: {
		height: 55,
		fontSize: 16,
	},
	forgotPassLink: {
		alignItems: "center",
		marginTop: 15,
		padding: 5,
	},
	linkText: {
		fontSize: 14,
		fontWeight: "500",
		textDecorationLine: "underline",
	},
	// Footer Section
	footer: {
		alignItems: "center",
		paddingBottom: 40,
		width: "100%",
	},
	signupContainer: {
		paddingVertical: 10,
	},
	underline: {
		textDecorationLine: "underline",
		fontWeight: "bold",
	},
	// Modal Styles
	modalOverlay: {
		flex: 1,
		backgroundColor: "rgba(0, 0, 0, 0.7)",
		justifyContent: "center",
	},
	modalScroll: {
		flexGrow: 1,
		justifyContent: "center",
		padding: 20,
	},
	modalContent: {
		borderRadius: 20,
		padding: 20,
		alignItems: "center",
		elevation: 5,
		borderWidth: 1,
		width: "100%",
	},
	modalTitle: {
		fontSize: 22,
		fontWeight: "bold",
		marginBottom: 20,
	},
	modalActions: {
		flexDirection: "row",
		marginTop: 20,
		width: "100%",
	},
});