import * as z from "zod";
import idValidator from "../../validators/idValidator.ts";

const logitemValidator = z.object({
  id: idValidator,
  title: z.string().max(64),
  body: z.string().max(1024).optional(),
  crew: z.number().optional(),
  latitude: z.float64().optional(),
  longitude: z.float64().optional(),
  course: z.float64().optional(),
  speedOverGround: z.float64().optional(),
  speedThroughWater: z.float64().optional(),
  windSpeed: z.float64().optional(),
  barometer: z.float64().optional(),
});

export type zLogitem = z.infer<typeof logitemValidator>;

export default logitemValidator;
