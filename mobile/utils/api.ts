/**
 * This is only for prototyping and testing the login functionality
 * @param email Users email to login to the application
 * @param password Users password
 * @returns Either users username, or if credentials are invalid returns null
 */
export async function loginUser(
  email: string,
  password: string
): Promise<string | null> {
  if (email === "eikka@moikka.fi" && password === "moikka") {
    return "eikka";
  }
  return null;
}
