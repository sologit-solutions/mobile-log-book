import express from "express";
import * as service from "./service.ts";

const router = express.Router();

router.get("/", async (req, res) => {
  const userId = req.user?.id;
  if (userId) {
    return await service.getLogbooks(userId);
  }
});

router.post("/", async (req, res) => {
  const userId = req.user?.id;
  if (userId) {
    const logbookName = "logbook name";
    return await service.createLogbook(userId, logbookName);
  } else {
    return res.status(401);
  }
});

router.get("/:logbook_id", async (req, res) => {
  const userId = req.user?.id;
  if (userId) {
    const logbookId = 0;
    return await service.getLogbook(logbookId);
  } else {
    return res.status(401);
  }
});

router.put("/:logbook_id", async (req, res) => {
  const userId = req.user?.id;
  if (userId) {
    const logbookId = 0;
    const logbookName = "new_name";
    return await service.updateLogbook(logbookId, logbookName);
  } else {
    return res.status(401);
  }
});

router.delete("/:logbook_id", async (req, res) => {
  const userId = req.user?.id;
  if (userId) {
    const logbookId = 0;
    return await service.deleteLogbook(logbookId);
  } else {
    return res.status(401);
  }
});

router.get("/:logbook_id/logs", async (req, res) => {
  const userId = req.user?.id;
  if (userId) {
    const logbookId = 0;
    return await service.getLogbookContent(logbookId);
  } else {
    return res.status(401);
  }
});

router.post("/:logbook_id/logs", async (req, res) => {
  const userId = req.user?.id;
  if (userId) {
    const logbookId = 0;
    return await service.saveLogbookContent(logbookId);
  } else {
    return res.status(401);
  }
});

router.put("/:logbook_id/logs/:item_id", async (req, res) => {
  const userId = req.user?.id;
  if (userId) {
    const itemId = 0;
    return await service.updateLogitem(itemId);
  } else {
    return res.status(401);
  }
});

router.delete("/:logbook_id/logs/:item_id", async (req, res) => {
  const userId = req.user?.id;
  if (userId) {
    const itemId = 0;
    return await service.deleteLogitem(itemId);
  } else {
    return res.status(401);
  }
});

export default router;
