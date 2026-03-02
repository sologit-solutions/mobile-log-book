import { prisma } from "../../configs/db.ts";
import type { Logitem } from "../../types/logitem.ts";
import type { Result } from "../../types/result.ts";
import { Prisma } from "../../generated/client.ts";
import type { zLogitem } from "./validators/logitemValidator.ts";

const deletedItem = {
  title: null,
  body: null,
  crew: null,
  latitude: null,
  longitude: null,
  course: null,
  speedOverGround: null,
  speedThroughWater: null,
  windSpeed: null,
  barometer: null,
  isActive: false,
};

const incrementLogbookVersion = async (
  ownerId: string,
  id: string,
  tx: Prisma.TransactionClient = prisma,
): Promise<number> => {
  const result = await tx.logbook.update({
    select: {
      version: true,
    },
    data: {
      version: {
        increment: 1,
      },
    },
    where: {
      id,
      ownerId,
    },
  });

  return result.version;
};

export const getLogs = async (input: {
  ownerId: string;
  logbookId: string;
}): Promise<Result<Logitem[]>> => {
  const { ownerId, logbookId } = input;
  const result = await prisma.logitem.findMany({
    where: {
      logbookId,
      logbook: {
        ownerId,
      },
    },
  });

  return { success: true, data: result };
};

export const createLogs = async (input: {
  ownerId: string;
  logbookId: string;
  logitems: zLogitem[];
}): Promise<Result<{ count: number }>> => {
  const { ownerId, logbookId, logitems } = input;
  const result = await prisma.$transaction(async (tx) => {
    const version = await incrementLogbookVersion(ownerId, logbookId, tx);

    const data = logitems.map((item) => ({
      ...item,
      version,
      logbookId,
    }));

    return await tx.logitem.createMany({
      data,
      skipDuplicates: true,
    });
  });

  return { success: true, status: 201, data: result };
};

export const updateLogs = async (input: {
  ownerId: string;
  logbookId: string;
  logitems: Partial<zLogitem>[];
}): Promise<Result<{ count: number }>> => {
  const { ownerId, logbookId, logitems } = input;
  const result = await prisma.$transaction(async (tx) => {
    const version = await incrementLogbookVersion(ownerId, logbookId, tx);

    const array = await Promise.all(
      logitems.map(async (item) => {
        const data = {
          ...item,
          version,
          logbookId,
        };

        return await tx.logitem.update({
          where: {
            id: item.id,
            logbookId,
            logbook: {
              ownerId,
            },
          },
          data,
        });
      }),
    );

    return { count: array.length };
  });

  return { success: true, data: result };
};

export const deleteMultipleLogs = async (input: {
  ownerId: string;
  logbookId: string;
  logitemIds: string[];
}): Promise<Result<{ count: number }>> => {
  const { ownerId, logbookId, logitemIds } = input;
  const result = await prisma.$transaction(async (tx) => {
    const version = await incrementLogbookVersion(ownerId, logbookId, tx);

    const array = await Promise.all(
      logitemIds.map(async (id) => {
        const data = {
          id,
          logbookId,
          ...deletedItem,
          version,
        };

        return await tx.logitem.update({
          where: {
            id,
            logbookId,
            logbook: {
              ownerId,
            },
          },
          data,
        });
      }),
    );

    return { count: array.length };
  });

  return { success: true, data: result };
};

export const getLog = async (input: {
  ownerId: string;
  logbookId: string;
  logitemId: string;
}): Promise<Result<Logitem>> => {
  const { ownerId, logbookId, logitemId } = input;
  const result = await prisma.logitem.findUniqueOrThrow({
    where: {
      id: logitemId,
      logbookId,
      logbook: {
        ownerId,
      },
    },
  });

  return { success: true, data: result };
};

export const updateLogitem = async (input: {
  ownerId: string;
  logbookId: string;
  logitemId: string;
  logitem: Partial<zLogitem>;
}): Promise<Result<Logitem>> => {
  const { ownerId, logbookId, logitemId, logitem } = input;
  const result = await prisma.$transaction(async (tx) => {
    const version = await incrementLogbookVersion(ownerId, logbookId, tx);

    const data = {
      ...logitem,
      version,
    };

    return await tx.logitem.update({
      where: {
        id: logitemId,
        logbookId,
        logbook: {
          ownerId,
        },
      },
      data,
    });
  });

  return { success: true, data: result };
};

export const deleteLogitem = async (input: {
  ownerId: string;
  logbookId: string;
  logitemId: string;
}): Promise<Result<Logitem>> => {
  const { ownerId, logbookId, logitemId } = input;
  const result = await prisma.$transaction(async (tx) => {
    const version = await incrementLogbookVersion(ownerId, logbookId, tx);

    const data = {
      ...deletedItem,
      version,
    };

    return await tx.logitem.update({
      where: {
        id: logitemId,
        logbookId,
        logbook: {
          ownerId,
        },
      },
      data,
    });
  });

  return { success: true, data: result };
};

export const getLatestLogitems = async (input: {
  ownerId: string;
  id: string;
  version: number;
}): Promise<Result<Logitem[]>> => {
  const { ownerId, id, version } = input;
  const result = await prisma.logitem.findMany({
    where: {
      id,
      logbook: {
        ownerId,
      },
      version: {
        gt: version,
      },
    },
  });

  return { success: true, data: result };
};
