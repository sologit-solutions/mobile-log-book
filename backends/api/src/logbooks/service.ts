import * as repository from "./repository.ts";
import type { Logitem } from "../types/logitem.ts";

export const saveLogitems = async (
  userId: string,
  logbookId: string,
  logitems: Logitem[],
) => {
  // TODO: implement business logic.

  // Step 1: Validate that ALL logitems in list are the latest version. If true, save.
  // Step 2: If false, return error with conflicting items.
  // Step 3: Client picks the preferred version
  //         rejecting changes or updating the updatedAt.

  const repositoryResult = await repository.saveLogitems(
    userId,
    logbookId,
    logitems,
  );

  return repositoryResult;
};

export const updateLogitem = async (
  userId: string,
  logbookId: string,
  logitemId: string,
  logitem: Logitem,
) => {
  // TODO: Validate that the incoming logitem is the latest version, return error if not.
  return await repository.updateLogitem(userId, logbookId, logitemId, logitem);
};
