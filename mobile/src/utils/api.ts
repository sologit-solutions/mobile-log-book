import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";
import { DBLogItem } from "@/src/types/db";

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
		const accessToken = json.data?.accessToken?.token || json.data?.accessToken;
		const refreshToken = json.data?.refreshToken?.token || json.data?.refreshToken;
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

// ------------------------------
// --- Log item API functions ---
// ------------------------------

/**
 * Pushes an array of locally created log items to the backend
 * Uses POST to append new items to the remote db
 */
export async function pushRemoteLogItems(logbookId: string, localItems: DBLogItem[]): Promise<any> {
	const headers = await getAuthHeader();

	// Map the SQLite snake_case columns to the backend's expected camelCase JSON
	const payload = localItems.map((item) => ({
		id: item.id,
		logbookId: logbookId,
		title: item.title,
		body: item.body ? item.body : undefined,
		latitude: item.latitude,
		longitude: item.longitude,
		createdAt: item.created_at,
		updatedAt: item.updated_at,
		isActive: true, // New items are always active
	}));

	const response = await fetch(`${API_URL}/logbooks/${logbookId}/logs`, {
		method: "POST",
		headers,
		body: JSON.stringify({ logitems: payload }),
	});

	const json = await response.json();
	console.log("RAW SERVER POST RESPONSE:", JSON.stringify(json, null, 2));

	if (!response.ok || json.success === false) {
		throw new Error(json.error?.message || json.message || "Failed to push log items.");
	}

	return json.data;
}

/**
 * Pushes edits of locally modified log items to the backend
 * Uses PUT to update existing records in the remote db
 */
export async function updateRemoteLogItems(logbookId: string, localItems: DBLogItem[]): Promise<any> {
	const headers = await getAuthHeader();

	// Loop through the array and hit the singular PUT endpoint one by one
	// to temporarily bypass the broken bulk-update backend route
	for (const localItem of localItems) {
		const payload = {
			id: localItem.id,
			logbookId: logbookId,
			title: localItem.title,
			body: localItem.body ? localItem.body : undefined,
			latitude: localItem.latitude,
			longitude: localItem.longitude,
			createdAt: localItem.created_at,
			updatedAt: localItem.updated_at,
			isActive: true,
		};

		const response = await fetch(`${API_URL}/logbooks/${logbookId}/logs/${localItem.id}`, {
			method: "PUT",
			headers,
			// The singular endpoint strictly expects the object to be wrapped in a "logitem" key
			body: JSON.stringify({ logitem: payload }),
		});

		const json = await response.json();

		if (!response.ok || json.success === false) {
			throw new Error(json.error?.message || json.message || "Failed to update remote log item.");
		}
	}

	return { success: true };
	/*
	const payload = localItems.map((item) => ({
		id: item.id,
		logbookId: logbookId,
		title: item.title,
		body: item.body ? item.body : undefined,
		latitude: item.latitude,
		longitude: item.longitude,
		createdAt: item.created_at,
		updatedAt: item.updated_at,
		isActive: true,
	}));

	const response = await fetch(`${API_URL}/logbooks/${logbookId}/logs`, {
		method: "PUT", // <--- THE CRITICAL DIFFERENCE
		headers,
		body: JSON.stringify({ logitems: payload }),
	});

	const json = await response.json();

	if (!response.ok || json.success === false) {
		throw new Error(json.error?.message || json.message || JSON.stringify(json));
	}

	return json.data;
	 */
}

/**
 * Tells the backend to mark specific log items as deleted
 */
export async function deleteRemoteLogItems(logbookId: string, itemIds: string[]): Promise<any> {
	const headers = await getAuthHeader();

	// Loop through the array and hit the singular delete endpoint one by one
	// to temporarily bypass the broken bulk-delete backend route
	for (const itemId of itemIds) {
		const response = await fetch(`${API_URL}/logbooks/${logbookId}/logs/${itemId}`, {
			method: "DELETE",
			headers,
		});

		const json = await response.json();
		if (!response.ok || json.success === false) {
			throw new Error(json.error?.message || json.message || "Failed to delete remote log items.");
		}
	}

	return { success: true };

	/*
	const headers = await getAuthHeader();

	const response = await fetch(`${API_URL}/logbooks/${logbookId}/logs`, {
		method: "DELETE",
		headers,
		body: JSON.stringify({ logitemIds: itemIds }),
	});

	const json = await response.json();
	if (!response.ok || json.success === false) {
		throw new Error(json.error?.message || json.message || "Failed to delete remote log items.");
	}

	return json.data;
	 */
}