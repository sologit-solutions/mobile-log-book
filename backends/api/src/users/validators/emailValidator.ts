import * as z from "zod";

const emailValidator = z.email({ pattern: z.regexes.html5Email });

export default emailValidator;
