import { prisma } from "../configs/db.ts";

export const getUserLogbooks = async (userId: number) => {
  const logbooks = await prisma.logbook.findMany({
    where: {
      ownerId: userId,
    },
  });
  return logbooks;
};

export const createLogbook = async (userId: number, name: string) => {
  await prisma.logbook.create({
    data: {
      ownerId: userId,
      name: name,
    },
  });
};

export const getLogbook = async (logbookId: number) => {
  const logbook = await prisma.logbook.findUniqueOrThrow({
    where: {
      id: logbookId,
    },
  });
  return logbook;
};

export const updateLogbook = async (logbookId: number, name: string) => {
  await prisma.logbook.update({
    where: {
      id: logbookId,
    },
    data: {
      name: name,
    },
  });
};

export const deleteLogbook = async (logbookId: number) => {
  await prisma.logitem.deleteMany({
    where: {
      logbookId: logbookId,
    },
  });
  await prisma.logbook.delete({
    where: {
      id: logbookId,
    },
  });
};

export const getLogitems = async (logbookId: number) => {
  const logitems = await prisma.logitem.findMany({
    where: {
      logbookId: logbookId,
    },
  });
  return logitems;
};

export const saveLogitems = async (logbookId: number) => {
  await prisma.logitem.createMany({
    data: [],
  });
};

export const updateLogitem = async (logitemId: number) => {
  await prisma.logitem.update({
    data: {},
    where: {
      id: logitemId,
    },
  });
};

export const deleteLogitem = async (logitemId: number) => {
  await prisma.logitem.delete({
    where: {
      id: logitemId,
    },
  });
};
