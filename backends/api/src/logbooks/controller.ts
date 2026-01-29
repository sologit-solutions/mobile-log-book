import express from "express";
import * as service from "./service.ts";
import * as repository from "./repository.ts";

const router = express.Router();

router.get("/", async (req, res) => {
  const userId = req.user?.id;

  if (userId) {
    const serviceResult = await repository.getUserLogbooks(userId);

    if (serviceResult.success) {
      return res.json(serviceResult.data);
    }
  } else {
    return res.status(401);
  }
});

router.post("/", async (req, res) => {
  const userId = req.user?.id;
  const logbookName = req.body?.name;

  if (userId && logbookName) {
    const serviceResult = await repository.createLogbook(userId, logbookName);

    if (serviceResult.success) {
      return res.json(serviceResult.data);
    }
  } else {
    return res.status(401);
  }
});

router.get("/:logbook_id", async (req, res) => {
  const userId = req.user?.id;
  const logbookId = req.params.logbook_id;

  if (userId) {
    const serviceResult = await repository.getLogbook(userId, logbookId);

    if (serviceResult.success) {
      return res.json(serviceResult.data);
    }
  } else {
    return res.status(401);
  }
});

router.put("/:logbook_id", async (req, res) => {
  const userId = req.user?.id;
  const logbookName = req.body?.name;
  const logbookId = req.params.logbook_id;

  if (userId && logbookName) {
    const serviceResult = await repository.updateLogbook(
      userId,
      logbookId,
      logbookName,
    );

    if (serviceResult.success) {
      return res.json(serviceResult.data);
    }
  } else {
    return res.status(401);
  }
});

router.delete("/:logbook_id", async (req, res) => {
  const userId = req.user?.id;
  const logbookId = req.params.logbook_id;

  if (userId) {
    const serviceResult = await repository.deleteLogbook(userId, logbookId);

    if (serviceResult.success) {
      return res.json(serviceResult.data);
    }
  } else {
    return res.status(401);
  }
});

router.get("/:logbook_id/logs", async (req, res) => {
  const userId = req.user?.id;
  const logbookId = req.params.logbook_id;

  if (userId) {
    const serviceResult = await repository.getLogitems(userId, logbookId);

    if (serviceResult.success) {
      return res.json(serviceResult.data);
    }
  } else {
    return res.status(401);
  }
});

router.post("/:logbook_id/logs", async (req, res) => {
  const userId = req.user?.id;
  const logitems = req.body?.logitems;
  const logbookId = req.params.logbook_id;

  if (userId) {
    if (logitems) {
      const serviceResult = await service.saveLogitems(
        userId,
        logbookId,
        logitems,
      );

      if (serviceResult.success) {
        return res.json(serviceResult.data);
      }
    }
  } else {
    return res.status(401);
  }
});

router.put("/:logbook_id/logs/:item_id", async (req, res) => {
  const userId = req.user?.id;
  const logbookId = req.params.logbook_id;
  const itemId = req.params.item_id;
  const logitem = req.body?.item;

  if (userId) {
    const serviceResult = await service.updateLogitem(
      userId,
      logbookId,
      itemId,
      logitem,
    );

    if (serviceResult.success) {
      return res.json(serviceResult.data);
    }
  } else {
    return res.status(401);
  }
});

router.delete("/:logbook_id/logs/:item_id", async (req, res) => {
  const userId = req.user?.id;
  const logbookId = req.params.logbook_id;
  const itemId = req.params.item_id;

  if (userId) {
    const serviceResult = await repository.deleteLogitem(
      userId,
      logbookId,
      itemId,
    );

    if (serviceResult.success) {
      return res.json(serviceResult.data);
    }
  } else {
    return res.status(401);
  }
});

export default router;
