import express from "express";
import * as service from "./service.ts";

const router = express.Router();

router.get("/", async (req, res) => {
  const userId = 0;
  return await service.getLogbooks(userId);
});

router.post("/", async (req, res) => {
  const userId = 0;
  const logbookName = "logbook name";
  return await service.createLogbook(userId, logbookName);
});

router.get("/:logbook_id", async (req, res) => {
  const logbookId = 0;
  return await service.getLogbook(logbookId);
});

router.put("/:logbook_id", async (req, res) => {
  const logbookId = 0;
  const logbookName = "new_name";
  return await service.updateLogbook(logbookId, logbookName);
});

router.delete("/:logbook_id", async (req, res) => {
  const logbookId = 0;
  return await service.deleteLogbook(logbookId);
});

router.get("/:logbook_id/logs", async (req, res) => {
  const logbookId = 0;
  return await service.getLogbookContent(logbookId);
});

router.post("/:logbook_id/logs", async (req, res) => {
  const logbookId = 0;
  return await service.saveLogbookContent(logbookId);
});

router.put("/:logbook_id/logs/:item_id", async (req, res) => {
  const itemId = 0;
  return await service.updateLogitem(itemId);
});

router.delete("/:logbook_id/logs/:item_id", async (req, res) => {
  const itemId = 0;
  return await service.deleteLogitem(itemId);
});

export default router;
