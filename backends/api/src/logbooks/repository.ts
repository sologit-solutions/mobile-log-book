import { prisma } from "../configs/db.ts";
import type { Logbook, Logitem } from "@prisma/client";

export const getUserLogbooks = async (
  userId: string,
): Promise<RepositoryResult<Logbook[]>> => {
  try {
    const result = await prisma.logbook.findMany({
      where: {
        ownerId: userId,
      },
    });
    return { success: true, data: result };
  } catch (e) {
    return { success: false, error: { message: "Unknown error" } };
  }
};

export const createLogbook = async (
  userId: string,
  name: string,
): Promise<RepositoryResult<Logbook>> => {
  try {
    const result = await prisma.logbook.create({
      data: {
        ownerId: userId,
        name: name,
      },
    });
    return { success: true, data: result };
  } catch (e) {
    return { success: false, error: { message: "Unknown error" } };
  }
};

export const getLogbook = async (
  userId: string,
  logbookId: string,
): Promise<RepositoryResult<Logbook>> => {
  try {
    const result = await prisma.logbook.findUniqueOrThrow({
      where: {
        id: logbookId,
        ownerId: userId,
      },
    });
    return { success: true, data: result };
  } catch (e) {
    return { success: false, error: { message: "Unknown error" } };
  }
};

export const updateLogbook = async (
  userId: string,
  logbookId: string,
  logbookName: string,
): Promise<RepositoryResult<Logbook>> => {
  try {
    const result = await prisma.logbook.update({
      where: {
        id: logbookId,
        ownerId: userId,
      },
      data: {
        name: logbookName,
      },
    });
    return { success: true, data: result };
  } catch (e) {
    return { success: false, error: { message: "Unknown error" } };
  }
};

export const deleteLogbook = async (
  userId: string,
  logbookId: string,
): Promise<RepositoryResult<Logbook>> => {
  try {
    const result = await prisma.logbook.delete({
      where: {
        id: logbookId,
        ownerId: userId,
      },
    });
    return { success: true, data: result };
  } catch (e) {
    return { success: false, error: { message: "Unknown error" } };
  }
};

export const getLogitems = async (
  userId: string,
  logbookId: string,
): Promise<RepositoryResult<Logitem[]>> => {
  try {
    const result = await prisma.logitem.findMany({
      where: {
        logbookId: logbookId,
        logbook: {
          ownerId: userId,
        },
      },
    });
    return { success: true, data: result };
  } catch (e) {
    return { success: false, error: { message: "Unknown error" } };
  }
};

export const saveLogitems = async (
  userId: string,
  logbookId: string,
  logitems: Logitem[],
): Promise<RepositoryResult<number>> => {
  try {
    // TODO:

    // Step 1: Validate that ALL logitems in list are the latest version. If true, save.
    // Step 2: If false, return error with conflicting items.
    // Step 3: Client picks the preferred version
    //         rejecting changes or updating the updatedAt.

    return { success: true, data: 0 };
  } catch (e) {
    return { success: false, error: { message: "Unknown error" } };
  }
};

export const updateLogitem = async (
  userId: string,
  logbookId: string,
  logitemId: string,
  logitem: Logitem,
): Promise<RepositoryResult<Logitem>> => {
  try {
    const result = await prisma.logitem.update({
      where: {
        id: logitemId,
        logbookId: logbookId,
        logbook: {
          ownerId: userId,
        },
      },
      data: logitem,
    });
    return { success: true, data: result };
  } catch (e) {
    return { success: false, error: { message: "Unknown error" } };
  }
};

export const deleteLogitem = async (
  userId: string,
  logbookId: string,
  logitemId: string,
): Promise<RepositoryResult<Logitem>> => {
  try {
    const result = await prisma.logitem.delete({
      where: {
        id: logitemId,
        logbookId: logbookId,
        logbook: {
          ownerId: userId,
        },
      },
    });
    return { success: true, data: result };
  } catch (e) {
    return { success: false, error: { message: "Unknown error" } };
  }
};
