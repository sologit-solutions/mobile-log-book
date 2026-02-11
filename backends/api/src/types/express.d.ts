import type { User as U } from "./user.ts";

declare global {
  namespace Express {
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    interface User extends Pick<U, "id"> {}
    interface AuthenticatedRequest extends Request {
      user: { id: string };
    }
  }
}
