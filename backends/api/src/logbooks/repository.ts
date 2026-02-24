import { prisma } from "../configs/db.ts";
import type { Logbook } from "../types/logbook.ts";
import type { Result } from "../types/result.ts";

export const getUserLogbooks = async (
  ownerId: string,
): Promise<Result<Logbook[]>> => {
  const result = await prisma.logbook.findMany({
    where: {
      ownerId,
    },
  });

  return { success: true, data: result };
};

export const createLogbook = async (input: {
  ownerId: string;
  logbook: {
    id: string;
    name: string;
    vesselType?: string;
    registration?: string;
  };
}): Promise<Result<Logbook>> => {
  const { ownerId, logbook } = input;
  const { id, name, vesselType, registration } = logbook;
  const result = await prisma.logbook.create({
    data: {
      id,
      ownerId,
      name,
      vesselType,
      registration,
    },
  });

  return { success: true, status: 201, data: result };
};

export const getLogbook = async (input: {
  ownerId: string;
  id: string;
}): Promise<Result<Logbook>> => {
  const { ownerId, id } = input;
  const result = await prisma.logbook.findUniqueOrThrow({
    where: {
      id,
      ownerId,
    },
  });

  return { success: true, data: result };
};

export const updateLogbook = async (input: {
  ownerId: string;
  logbook: {
    id: string;
    name?: string;
    vesselType?: string;
    registration?: string;
  };
}): Promise<Result<Logbook>> => {
  const { ownerId, logbook } = input;
  const { id, name, vesselType, registration } = logbook;
  const result = await prisma.logbook.update({
    data: {
      name,
      vesselType,
      registration,
      version: {
        increment: 1,
      },
    },
    where: {
      id,
      ownerId,
    },
  });

  return { success: true, data: result };
};

export const deleteLogbook = async (input: {
  ownerId: string;
  id: string;
}): Promise<Result<Logbook>> => {
  const { ownerId, id } = input;
  const result = await prisma.logbook.delete({
    where: {
      id,
      ownerId,
    },
  });

  return { success: true, data: result };
};
