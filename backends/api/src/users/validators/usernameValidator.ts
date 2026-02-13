import * as z from "zod";

const usernameValidator = z
  .string({ message: "Username must contain at least 3 characters." })
  .min(3, { message: "Username must contain at least 3 characters." })
  .max(20, { message: "Username cannot exceed 20 characters." })
  .regex(
    /^[A-Za-z0-9_]+$/,
    "Usernames may only contain letters, numbers and underscores.",
  );

export default usernameValidator;
