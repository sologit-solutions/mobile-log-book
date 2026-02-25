import * as z from "zod";
import idValidator from "./idValidator.ts";

const logbookValidator = z.object({
  id: idValidator,
  name: z.string().max(64),
  vesselType: z.string().max(64),
  registration: z.string().max(64),
});

export default logbookValidator;
