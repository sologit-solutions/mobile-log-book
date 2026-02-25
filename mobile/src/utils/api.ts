import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";

/**
 * This is only for prototyping and testing the login functionality
 * @param email Users email to login to the application
 * @param password Users password
 * @returns Either users username, or if credentials are invalid returns null
 */
export async function loginUserOld(email: string, password: string): Promise<UserData | null> {
	// Simulate a short network delay for realism
	await new Promise((resolve) => setTimeout(resolve, 500));

	if (email === "eikka@moikka.fi" && password === "moikka") {
		return {
			id: "mock-id-eikka",
			name: "eikka",
			email: "eikka@moikka.fi",
		};
	}

	return null;
}

// This is only temporary for demonstration purposes
export async function registerUserTemp(email: string, username: string, password: string): Promise<UserData | null> {
	// Simulate a short network delay for realism during presentation
	await new Promise((resolve) => setTimeout(resolve, 800));

	console.log("Mock Registration initiated for:", { email, username });

	// Return a success object immediately
	return {
		id: "temp-id-" + Math.floor(Math.random() * 10000),
		name: username,
		email: email,
	};
}

/**
 * Resolves the backend API base URL via Expo's build-time environment injection
 * Implements a fallback to local Docker containers if the .env file is missing
 */
const getApiUrl = (): string => {
	// Metro Bundler replaces this at compile-time
	const envUrl = process.env.EXPO_PUBLIC_API_URL;

	if (envUrl) {
		// Strip trailing slashes to prevent route malformation
		return envUrl.replace(/\/$/, "");
	}

	console.warn("EXPO_PUBLIC_API_URL is undefined, falling back to local emulator network");
	return Platform.OS === "android" ? "http://10.0.2.2:8000" : "http://localhost:8000";
};

// Represents the sanitized user entity utilized by the global Zustand store
export interface UserData {
	id: string;
	name: string;
	email: string;
}

// Represents the complete authentication payload returned from successful signup network requests
export interface AuthResponse {
	user: UserData;
	token: string;
}

/**
 * Dynamically resolve the backend API base URL depending on the active emulator
 * iOS Simulators use the hosts localhost
 * Android Emulators require a specific IP
 */
const API_URL = getApiUrl();

/**
 * Executes the account creation handshake with the Express backend
 * Evaluates backend Data Transfer Objects (DTOs) and persists cryptographic tokens upon success
 *
 * @param email - The users email address
 * @param username - The user's chosen display name
 * @param password - The user's raw, unhashed password
 * @returns A promise resolving to the mapped authentication payload
 * @throws Will throw an error if the network request fails or the database rejects the payload
 */
export async function registerUser(email: string, username: string, password: string): Promise<AuthResponse | null> {
	try {
		const response = await fetch(`${API_URL}/users/signup`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ email, username, password }),
		});

		const json = await response.json();
		console.log("Server response: ", json);

		// Evaluate explicit success flags and HTTP status
		if (!response.ok || json.success === false) {
			const errorMessage = json.error?.message || json.message || "Registration failed on server.";
			throw new Error(`Server Error: ${errorMessage}`);
		}

		// Extract authorization payload
		const accessToken = json.data?.accessToken?.token;
		const refreshToken = json.data?.refreshToken?.token;
		const backendUserId = json.data?.user?.userId;

		if (!accessToken || !backendUserId) {
			throw new Error("Critical: Server did not return expected authentication payload.");
		}

		// Persist tokens to the hardware keychain
		await SecureStore.setItemAsync("auth_token", accessToken);
		if (refreshToken) {
			await SecureStore.setItemAsync("refresh_token", refreshToken);
		}

		// Map the backend response to the frontend state requirement
		const mappedUser: UserData = {
			id: backendUserId,
			email: email,
			name: username, // Fixes the "undefined" alert
		};

		return {
			user: mappedUser,
			token: accessToken,
		};
	} catch (error: any) {
		console.error("Registration error: ", error.message);
		throw error;
	}
}

/**
 * Executes the authentication handshake for returning users
 * Maps mobile payload to the backend loginValidator and extracts cryptographic tokens
 *
 * @param email - The users email address or username
 * @param password - The users raw password
 * @returns A promise resolving to the mapped AuthResponse payload
 * @throws Will throw an error if the network request fails or credentials are invalid
 */
export async function loginUser(email: string, password: string): Promise<AuthResponse | null> {
	try {
		const response = await fetch(`${API_URL}/users/login`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			// backend expects usernameOrEmail
			body: JSON.stringify({
				usernameOrEmail: email,
				password: password,
			}),
		});

		const json = await response.json();
		console.log("Login Server Response: ", json);

		// Evaluate explicit success flags and HTTP status
		if (!response.ok || json.success === false) {
			const errorMessage = json.error?.message || json.message || "Invalid credentials.";
			throw new Error(errorMessage);
		}

		// Extract authorization payload from the backend DTO
		const accessToken = json.data?.accessToken?.token;
		const refreshToken = json.data?.refreshToken?.token;

		// Fallback: Check for 'id' first (Login DTO) + fallback to 'userId' (Signup DTO)
		const backendUserId = json.data?.user?.id || json.data?.user?.userId;

		if (!accessToken || !backendUserId) {
			throw new Error("Critical: Server did not return expected authentication payload.");
		}

		// Persist tokens to the hardware keychain
		await SecureStore.setItemAsync("auth_token", accessToken);
		if (refreshToken) {
			await SecureStore.setItemAsync("refresh_token", refreshToken);
		}

		// Map the backend response to the frontend state requirement
		const mappedUser: UserData = {
			id: backendUserId,
			name: json.data?.user?.username || email.split("@")[0], // Fallback if backend omits it
			email: json.data?.user?.email || email,
		};

		return {
			user: mappedUser,
			token: accessToken,
		};
	} catch (error: any) {
		console.error("Login error: ", error.message);
		throw error;
	}
}

// ----------------------------
// --- Vessel API funcitons ---
// ----------------------------

/**
 * Retrieves the persisted JWT + constructs the secure auth header
 */
async function getAuthHeader() {
	const token = await SecureStore.getItemAsync("auth_token");
	if (!token) throw new Error("Authentication token is missing. Please log in again.");
	return {
		"Content-Type": "application/json",
		Authorization: `Bearer ${token}`,
	};
}

/**
 * Executes an authenticated POST request to create a new logbook
 * Strips out local-only fields to conform strictly to the backend DTO
 * * @param {string} name - The name of the logbook to create
 * @returns {Promise<any>} The server-generated db record (including the UUID)
 * @throws {Error} If the creation fails or the backend rejects the payload
 */
export async function createRemoteLogbook(id: string, name: string, type: string, registration: string): Promise<any> {
	const headers = await getAuthHeader();
	const response = await fetch(`${API_URL}/logbooks`, {
		method: "POST",
		headers,
		body: JSON.stringify({
			id: id,
			name: name, // backend explicitly requires this key
			vesselType: type.trim() === "" ? null : type,
			registration: registration.trim() === "" ? null : registration,
		}),
	});

	const json = await response.json();
	if (!response.ok || json.success === false) {
		throw new Error(json.error?.message || json.message || "Failed to create remote logbook.");
	}

	// The backend repository returns the created db record, containing the server-generated UUID
	return json.data;
}

/**
 * Executes an authenticated DELETE request to remove a logbook from the backend
 * * @param {string} logbookId - The UUIDv4 identifier of the logbook to delete
 * @returns {Promise<any>} The deleted record acknowledgment
 * @throws {Error} If the deletion fails
 */
export async function deleteRemoteLogbook(logbookId: string): Promise<any> {
	const headers = await getAuthHeader();
	const response = await fetch(`${API_URL}/logbooks/${logbookId}`, {
		method: "DELETE",
		headers,
	});

	const json = await response.json();
	if (!response.ok || json.success === false) {
		throw new Error(json.error?.message || json.message || "Failed to delete remote logbook.");
	}
	return json.data;
}

/**
 * Fetches all logbooks (vessels) belonging to the authenticated user from the remote backend
 * Uses the HTTP GET method to retrieve the array of records
 * * @returns {Promise<any[]>} An array of logbook database records from Prisma
 * @throws {Error} If the network request fails or the backend rejects the query
 */
export async function fetchRemoteLogbooks(): Promise<any[]> {
	const headers = await getAuthHeader();
	const response = await fetch(`${API_URL}/logbooks`, {
		method: "GET",
		headers,
	});

	const json = await response.json();

	// Evaluate explicit success flags and HTTP status
	if (!response.ok || json.success === false) {
		throw new Error(json.error?.message || json.message || "Failed to fetch remote logbooks.");
	}

	// Return the array of vessels mapped by the backend repository
	return json.data;
}
