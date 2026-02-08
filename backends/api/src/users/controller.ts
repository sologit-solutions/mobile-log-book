import { Router } from "express";
import * as service from "./service.ts";
import signupValidator from "./validators/signupValidator.ts";
import loginValidator from "./validators/loginValidator.ts";
import handleRequest from "../utils/requestUtils.ts";
import requireAuth from "../middleware/requireAuth.ts";

const router = Router();

/**
 * Route: /users/signup
 *
 * The route expects the request body to contain the fields
 * username, email and password.
 *
 * body: {
 *  username: string,
 *  email: string,
 *  password: string,
 * }
 *
 * If the account is successfully created the route returns a
 * 201 Created status to the client. The response contains a user
 * object containing the email, username and the jwt(s).
 */
router.post("/signup", async (req, res) => {
  // Define context
  const context = {
    res,
    input: req.body,
    validator: signupValidator,
    fun: service.createUser,
  };

  // Call handler
  return await handleRequest(context);
});

/**
 * Route: /users/login
 *
 * The route expects the request body to contain a username or and email
 * along with a password. The input in both fields should at least have
 * the length of one character for it to be valid.
 *
 * body: {
 *   usernameOrEmail: string,
 *   password: string,
 * }
 *
 *
 */
router.post("/login", async (req, res) => {
  // Define context
  const context = {
    res,
    input: req.body,
    validator: loginValidator,
    fun: service.authenticate,
  };

  // Call handler
  return await handleRequest(context);
});

/**
 * Route: /users/logout
 *
 * Not a priority.
 * The way logouts/sessions are handled is by using refresh tokens.
 * Valid refresh tokens are hashed and stored in a session table
 * in the database. -> Makes token revocation possible.
 *
 * A logout clears the session from the database using a sessionId
 * stored in the token.
 *
 * Access tokens have a short lifetime and are used for authenticating.
 *
 * Refresh tokens have a longer lifetime and are used for getting a new
 * access token. This is done by sending a request to a /auth/refresh
 * route when the token is about to expire.
 */
router.post("/logout", requireAuth, async (req, res) => {
  // TODO: Implementation
  // TODO: Update documentation when implemented.
  return res.status(501);
});

// Returns the logged in users data
router.get("/", requireAuth, async (req, res) => {
  return res.status(501);
});

// Request access token refresh
router.post("/refresh", requireAuth, async (req, res) => {
  return res.status(501);
});

// Request password reset
router.post("/password-reset", async (req, res) => {
  return res.status(501);
});

// Submit password reset
router.put("/password-reset", async (req, res) => {
  return res.status(501);
});

export default router;
