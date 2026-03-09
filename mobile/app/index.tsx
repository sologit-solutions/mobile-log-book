import React, { useState, useEffect } from "react";
import { StyleSheet, View, Text, Image, Alert, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, Keyboard } from "react-native";
import { z } from "zod";
import { useRouter } from "expo-router";
import { Screen } from "@/src/components/Screen";
import { Input } from "@/src/components/Input";
import { Button } from "@/src/components/Button";
import { useOwnTheme } from "@/src/context/ThemeContext";
import { registerUser, loginUser } from "@/src/utils/api";
import { useAuthStore } from "@/src/store/authStore";

import { SignupModal, SignupFormData } from "@/src/components/modals/SignupModal";
import { ForgotPasswordModal } from "@/src/components/modals/ForgotPasswordModal";

const loginSchema = z.object({
	email: z.string().min(1, "Email or username is required."),
	password: z.string().min(1, "Password is required."),
});

export default function LoginScreen() {
	const router = useRouter();
	const { theme } = useOwnTheme();
	const { login, setMode } = useAuthStore();

	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [loading, setLoading] = useState(false);
	const [isKeyboardVisible, setKeyboardVisible] = useState(false);

	const [signupVisible, setSignupVisible] = useState(false);
	const [forgotPassVisible, setForgotPassVisible] = useState(false);

	useEffect(() => {
		const showEvent = Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
		const hideEvent = Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";

		const showSub = Keyboard.addListener(showEvent, () => setKeyboardVisible(true));
		const hideSub = Keyboard.addListener(hideEvent, () => setKeyboardVisible(false));

		return () => {
			showSub.remove();
			hideSub.remove();
		};
	}, []);

	const handleLogin = async () => {
		const validationResult = loginSchema.safeParse({ email, password });
		if (!validationResult.success) {
			return Alert.alert("Validation Error", validationResult.error.issues[0].message);
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

	const handleSignup = async (data: SignupFormData) => {
		setLoading(true);
		try {
			const authPayload = await registerUser(data.email, data.name, data.password);
			if (authPayload) {
				Alert.alert("Success", `Account created for ${authPayload.user.name}!`, [
					{
						text: "OK",
						onPress: () => {
							login(authPayload.user, authPayload.token);
							setSignupVisible(false);
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

	const handleResetPassword = (resetEmail: string) => {
		if (!resetEmail) return Alert.alert("Error", "Enter your email");
		Alert.alert("Check your email", `Link sent to ${resetEmail}`, [{ text: "OK", onPress: () => setForgotPassVisible(false) }]);
	};

	const handleOfflineMode = () => {
		setMode("offline");
		router.replace("/(tabs)/home");
	};

	return (
		<Screen style={styles.container}>
			<KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
				<ScrollView contentContainerStyle={styles.innerContainer} keyboardShouldPersistTaps="handled" bounces={false} showsVerticalScrollIndicator={false}>

					{/* Logo & Form Area */}
					<View style={styles.content}>
						<View style={styles.header}>
							<Image source={require("@/assets/images/boat-outline.png")} style={[styles.logo, { tintColor: theme.colors.logo }]} resizeMode="contain" />
							<Text style={[styles.title, { color: theme.colors.textPrimary }]}>Login to Logify</Text>
						</View>

						<View style={styles.formContainer}>
							<Input placeholder="Email" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" style={styles.bigInput} />
							<Input placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry style={styles.bigInput} />
							<Button title="Sign in" onPress={handleLogin} loading={loading} style={{ marginTop: 10 }} />

							{!isKeyboardVisible && (
								<TouchableOpacity style={styles.forgotPassLink} onPress={() => setForgotPassVisible(true)}>
									<Text style={[styles.linkText, { color: theme.colors.textPrimary }]}>Forgot Password?</Text>
								</TouchableOpacity>
							)}
						</View>
					</View>

					{/* Footer area */}
					{!isKeyboardVisible && (
						<View style={styles.footer}>
							<Button title="Use app offline" onPress={handleOfflineMode} style={{ marginBottom: 10 }} />
							<TouchableOpacity onPress={() => setSignupVisible(true)} style={styles.signupContainer}>
								<Text style={{ color: theme.colors.textPrimary }}>
									Don&#39;t have an account? <Text style={styles.underline}>Sign up here</Text>
								</Text>
							</TouchableOpacity>
						</View>
					)}
				</ScrollView>
			</KeyboardAvoidingView>

			{/* Render modals */}
			<SignupModal
				visible={signupVisible}
				onClose={() => setSignupVisible(false)}
				onSubmit={handleSignup}
				loading={loading}
			/>

			<ForgotPasswordModal
				visible={forgotPassVisible}
				onClose={() => setForgotPassVisible(false)}
				onSubmit={handleResetPassword}
			/>
		</Screen>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1
	},
	innerContainer: {
		flexGrow: 1,
		paddingHorizontal: 30,
		justifyContent: "space-between"
	},
	content: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		width: "100%"
	},
	header: {
		marginBottom: 30,
		width: "100%",
		alignItems: "center"
	},
	logo: {
		width: 100,
		height: 100,
		marginBottom: 10
	},
	title: {
		fontSize: 27,
		fontWeight: "bold",
		padding: 5,
		textAlign: "center"
	},
	formContainer: {
		width: "100%"
	},
	bigInput: {
		height: 55,
		fontSize: 16
	},
	forgotPassLink: {
		alignItems: "center",
		marginTop: 15,
		padding: 5
	},
	linkText: {
		fontSize: 14,
		fontWeight: "500",
		textDecorationLine: "underline"
	},
	footer: {
		alignItems: "center",
		paddingBottom: 40,
		width: "100%"
	},
	signupContainer: {
		paddingVertical: 10
	},
	underline: {
		textDecorationLine: "underline",
		fontWeight: "bold"
	},
});