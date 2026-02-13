import * as z from "zod";

const passwordValidator = z.string().min(8); // TODO: Add password validator pattern.

export default passwordValidator;
