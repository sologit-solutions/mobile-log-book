/**
 * This is only for prototyping and testing the login functionality
 * @param email Users email to login to the application
 * @param password Users password
 * @returns Either users username, or if credentials are invalid returns null
 */
export async function loginUserOld(
    email: string,
    password: string
): Promise<UserData | null> {
  // Simulate a short network delay for realism
  await new Promise(resolve => setTimeout(resolve, 500));

  if (email === "eikka@moikka.fi" && password === "moikka") {
    return {
      id: "mock-id-eikka",
      name: "eikka",
      email: "eikka@moikka.fi"
    };
  }

  return null;
}

// This is only temporary for demonstration purposes
export async function registerUserTemp(email: string, username: string, password: string): Promise<UserData | null> {
  // Simulate a short network delay for realism during presentation
  await new Promise(resolve => setTimeout(resolve, 800));

  console.log("Mock Registration initiated for:", { email, username });

  // Return a success object immediately
  return {
    id: "temp-id-" + Math.floor(Math.random() * 10000),
    name: username,
    email: email
  };
}

export interface UserData {
  id: string;
  name: string;
  email: string;
}

const API_URL = "http://localhost:3000/accounts";

export async function registerUser(email: string, username: string, password: string): Promise<UserData | null> {
  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: email,
        username: username,
        password: password,
      }),
    });

    const json = await response.json();
    console.log("Server response: ", json);

    if (!response.ok) {
      throw new Error(json.message || "Registration failed");
    }

    if (json.data) {
      return {
        id: json.data.user_id,
        email: json.data.email,
        name: json.data.username,
      }
    }

    return null;

  } catch (error) {
    console.error("Registration error: ", error);
    return null;
  }
}

export async function loginUser(email: string, password: string): Promise<UserData | null> {
  try {
    const response = await fetch(`${API_URL}/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: email,
        password: password,
      })
    })

    const json = await response.json();
    console.log("Login response: ", json);

    if (!response.ok) {
      throw new Error("Login failed");
    }

    if (json.data) {
      return {
        id: json.data.user_id,
        name: json.data.username,
        email: json.data.email
      };
    }
    return json;
  } catch (error) {
    console.error("Login error: ", error);
    return null;
  }
}