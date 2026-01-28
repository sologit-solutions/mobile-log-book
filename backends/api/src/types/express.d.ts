import type { User as PrismaUser } from "@prisma/client";

export declare global {
  namespace Express {
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    interface User extends Pick<PrismaUser, "id"> {}
    interface AuthenticatedRequest extends Request {
      user: { id: string };
    }
  }
}
