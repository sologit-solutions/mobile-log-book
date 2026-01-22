/**
 * Login Screen Component
 *
 * This component implements the main login screen for the application with:
 * - Email/password authentication
 * - Online/offline mode switching
 * - Keyboard handling
 * - Form validation and error handling
 *
 * The screen provides:
 * - User authentication functionality
 * - Offline mode access
 * - Account creation option
 * - Responsive design for different screen sizes
 * - Keyboard avoidance for better UX
 */
import { DARK_THEME } from "@/assets/styles/defaultColors";
import { useOwnTheme } from "@/context/themeContext";
import { useAppState } from "@/state/appState";
import { loginUser } from "@/utils/api";
import {Link, useRouter} from "expo-router";
import React, {JSX, useMemo, useState} from "react";
import {
  Alert,
  Dimensions,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
  Modal
} from "react-native";

const PlaceHolderLogo = require("@/assets/images/boat-outline.png");
const { width, height } = Dimensions.get("window");

/**
 * Main Login Screen Component
 *
 * This is the primary login screen that handles user authentication
 * and provides access to both online and offline modes.
 *
 * @component
 * @returns {JSX.Element} Login screen with form and navigation options
 *
 * @see useAppState
 * @see useOwnTheme
 * @see loginUser
 * @see useRouter
 */
export default function Index(): JSX.Element {
  const [form, setForm] = useState({ email: "", password: "" });

  // Sign Up Modal State
  const [signupVisible, setSignupVisible] = useState(false);
  const [signupForm, setSignupForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  // Forgot Password Modal State
  const [forgotPasswordVisible, setForgotPasswordVisible] = useState(false);
  const [resetEmail, setResetEmail] = useState("");

  /**
   * Access to applications state functions
   *
   * @property {Function} setMode - Function to update application mode
   * @property {Function} setUser - Function to update current user
   */
  const { setMode, setUser } = useAppState();

  /**
   * Navigation router for screen transitioning
   */
  const router = useRouter();

  /**
   * Theme context for styling the app
   * Curerntly in development and not funcitoning properly
   */
  const { theme } = useOwnTheme();

  /**
   *
   * Memoized styles based on current theme
   *
   * @param {Object} theme - Current theme object
   * @returns {Object} Styled components for the screen
   */
  const styles = useMemo(() => createStyles(theme), [theme]);

  /**
   * Handle login with the API authentication
   * Currently using hardcoded values
   *
   * @returns {Promise <void>}
   * @throws {Error} if login fails or API call fails
   */
  const handleOnlineLogin = async (): Promise<void> => {
    try {
      const user = await loginUser(form.email, form.password);
      if (user) {
        setUser(user);
        setMode("online");
        //router.push("/(tabs)");
          router.replace("/(tabs)/home");
        setForm({
          email: "",
          password: "",
        });
      } else {
        Alert.alert("Error", "Invalid credentials");
        setForm({
          email: "",
          password: "",
        });
      }
    } catch (error) {
      Alert.alert("Error", "Login failed. Try again.");
      console.error(error);
    }
  };

  /**
   * Handle offline mode activation
   * - Sets application mode to offline
   * - Sets user to offline mode user
   * - Navigates to main application tabs
   */
  const handleOfflineMode = async () => {
    setMode("offline");
    setUser("offline-user");
    //router.push("/(tabs)");
      router.replace("/(tabs)/home");
  };

  // --- Sign Up Handlers ---

  const handleSignup = () => {
    // Basic validation
    if (!signupForm.name || !signupForm.email || !signupForm.password) {
      Alert.alert("Missing Information", "Please fill in all fields.");
      return;
    }

    // TODO: Connect to backend registration API here
    console.log("Creating account for:", signupForm);

    Alert.alert(
        "Success",
        `Account created for ${signupForm.name}! You can now log in.`,
        [
          {
            text: "OK",
            onPress: () => {
              setSignupVisible(false);
              setSignupForm({ name: "", email: "", password: "" });
            }
          }
        ]
    );
  };

  // --- Forgot Password Handlers ---

  const handleResetPassword = () => {
    if (!resetEmail) {
      Alert.alert("Missing Information", "Please enter your email address.");
      return;
    }
    // TODO: Connect to backend password reset API here
    console.log("Sending reset link to:", resetEmail);

    Alert.alert(
        "Check your email",
        `We have sent a password reset link to ${resetEmail}`,
        [
          {
            text: "OK",
            onPress: () => {
              setForgotPasswordVisible(false);
              setResetEmail("");
            },
          },
        ]
    );
  };

  return (
    /**
     * KeyboardAvoidingView component for better mobile UX
     */
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      {/* TouchableWithoutFeedback to dismiss keyboard on tap */}
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.content}>
          {/*Image and header text*/}
          <View style={styles.header}>
            <Image source={PlaceHolderLogo} style={styles.headerImage} />
            <Text style={styles.title}>Login to Logify</Text>
          </View>

          {/*Login form*/}
          <View style={styles.formContainer}>
            {/*Email*/}
            <View style={styles.inputContainer}>
              <TextInput
                value={form.email}
                onChangeText={(text) => setForm({ ...form, email: text })}
                style={styles.input}
                placeholder="Email"
                placeholderTextColor={theme.textSecondary}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            {/*Password*/}
            <View style={styles.inputContainer}>
              <TextInput
                value={form.password}
                onChangeText={(text) => setForm({ ...form, password: text })}
                style={styles.input}
                placeholder="Password"
                placeholderTextColor={theme.textSecondary}
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            {/*Login button*/}
            <TouchableOpacity
              onPress={handleOnlineLogin}
              style={styles.signInButton}
            >
              <Text style={styles.signInButtonText}>Sign in</Text>
            </TouchableOpacity>

            {/* Forgot Password Link - Right under the login button */}
            <TouchableOpacity
                style={styles.forgotPasswordContainer}
                onPress={() => setForgotPasswordVisible(true)}
            >
              <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableWithoutFeedback>

      {/*Use offline*/}
      <TouchableOpacity
        onPress={() => {
          alert("Using offline");
        }}
        style={styles.signUpLink}
      >
        <TouchableOpacity
          onPress={handleOfflineMode}
          style={styles.useOfflineButton}
        >
          <Text style={styles.signInButtonText}>Use app offline</Text>
        </TouchableOpacity>
      </TouchableOpacity>

      {/* Sign Up Link */}
      <TouchableOpacity
          style={styles.signUpLink}
          onPress={() => setSignupVisible(true)}
      >
        <Text style={styles.signUpLinkText}>
          Don&#39;t have an account?{" "}
          <Text style={styles.signUpLinkUnderlined}>Sign up here</Text>
        </Text>
      </TouchableOpacity>

      {/* ------------------------------------------------------------
        SIGN UP MODAL
        ------------------------------------------------------------
      */}
      <Modal
          animationType="fade"
          transparent={true}
          visible={signupVisible}
          onRequestClose={() => setSignupVisible(false)}
      >
        {/* Modal Overlay (Semi-transparent background) */}
        <View style={styles.modalOverlay}>
          {/* Modal Content Card */}
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Create Account</Text>

            {/* Name Input */}
            <TextInput
                value={signupForm.name}
                onChangeText={(text) => setSignupForm({ ...signupForm, name: text })}
                style={styles.input} // Reusing existing input style
                placeholder="Name"
                autoCapitalize="none"
                autoCorrect={false}
                placeholderTextColor={theme.textSecondary || "#888"}
            />

            {/* Email Input */}
            <TextInput
                value={signupForm.email}
                onChangeText={(text) => setSignupForm({ ...signupForm, email: text })}
                style={[styles.input, { marginTop: 15 }]}
                placeholder="Email"
                placeholderTextColor={theme.textSecondary || "#888"}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
            />

            {/* Password Input */}
            <TextInput
                value={signupForm.password}
                onChangeText={(text) => setSignupForm({ ...signupForm, password: text })}
                style={[styles.input, { marginTop: 15 }]}
                placeholder="Password"
                placeholderTextColor={theme.textSecondary || "#888"}
                secureTextEntry
            />

            {/* Action Buttons */}
            <View style={styles.modalButtons}>
              <TouchableOpacity
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={() => setSignupVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                  style={[styles.modalButton, styles.createButton]}
                  onPress={handleSignup}
              >
                <Text style={styles.createButtonText}>Sign Up</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ------------------------------------------------------------
        FORGOT PASSWORD MODAL
        ------------------------------------------------------------
      */}
      <Modal
          animationType="fade" // Changed to fade for variety, or use "slide"
          transparent={true}
          visible={forgotPasswordVisible}
          onRequestClose={() => setForgotPasswordVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Reset Password</Text>
            <Text style={styles.modalSubtitle}>
              Enter your email to receive a reset link.
            </Text>

            <TextInput
                value={resetEmail}
                onChangeText={setResetEmail}
                style={styles.input}
                placeholder="Email"
                placeholderTextColor={theme.textSecondary || "#888"}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={() => setForgotPasswordVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                  style={[styles.modalButton, styles.createButton]}
                  onPress={handleResetPassword}
              >
                <Text style={styles.createButtonText}>Send Link</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const createStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      alignItems: "center",
    },
    content: {
      width: "100%",
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
    },
    header: {
      marginBottom: 15,
      width: "100%",
      alignItems: "center",
    },
    headerImage: {
      height: height * 0.1,
      width: width * 0.2,
    },
    title: {
      fontSize: 27,
      fontWeight: "bold",
      color: DARK_THEME.textPrimary,
      padding: 5,
      textAlign: "center",
    },
    formContainer: {
      width: "80%",
    },
    inputContainer: {
      marginBottom: 20,
    },
    input: {
      width: "100%",
      height: 50,
      backgroundColor: DARK_THEME.surface,
      borderRadius: 8,
      paddingHorizontal: 15,
      fontSize: 16,
      color: DARK_THEME.textPrimary,
      borderWidth: 1,
      borderColor: DARK_THEME.surface,
    },
    signInButton: {
      backgroundColor: DARK_THEME.surface,
      borderColor: DARK_THEME.surface,
      borderWidth: 1,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 15,
      borderRadius: 30,
    },
    signInButtonText: {
      color: DARK_THEME.textPrimary,
      fontSize: 18,
      lineHeight: 26,
      fontWeight: "600",
    },
    useOfflineButton: {
      backgroundColor: DARK_THEME.surface,
      borderColor: DARK_THEME.surface,
      borderWidth: 1,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 15,
      paddingHorizontal: 20,
      borderRadius: 30,
    },
    useOfflineButtonText: {
      color: DARK_THEME.textPrimary,
      fontSize: 18,
      lineHeight: 26,
      fontWeight: "600",
      paddingVertical: 20,
    },
    signUpLink: {
      paddingVertical: 10,
    },
    signUpLinkText: {
      fontSize: 15,
      fontWeight: "600",
      color: DARK_THEME.textPrimary,
    },
    signUpLinkUnderlined: {
      textDecorationLine: "underline",
    },
    modalOverlay: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: "rgba(0, 0, 0, 0.7)",
    },
    modalContent: {
      width: "85%",
      backgroundColor: DARK_THEME.background,
      borderRadius: 20,
      padding: 20,
      alignItems: "center",
      elevation: 5,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 4,
      borderWidth: 1,
      borderColor: DARK_THEME.surface,
    },
    modalTitle: {
      fontSize: 22,
      fontWeight: "bold",
      color: DARK_THEME.textPrimary,
      marginBottom: 20,
    },
    modalSubtitle: {
      fontSize: 14,
      color: DARK_THEME.textPrimary, // or secondary
      marginBottom: 20,
      textAlign: 'center',
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
      borderColor: DARK_THEME.textSecondary || "#888",
    },
    createButton: {
      marginLeft: 10,
      backgroundColor: DARK_THEME.surface,
    },
    cancelButtonText: {
      color: DARK_THEME.textPrimary,
      fontWeight: "600",
      fontSize: 16,
    },
    createButtonText: {
      color: DARK_THEME.textPrimary,
      fontWeight: "bold",
      fontSize: 16,
    },
    forgotPasswordContainer: {
      alignItems: 'center',
      marginTop: 15,
      padding: 5,
    },
    forgotPasswordText: {
      color: DARK_THEME.textPrimary, // or a secondary color like '#888'
      fontSize: 14,
      fontWeight: "500",
      textDecorationLine: "underline",
    },
  });
