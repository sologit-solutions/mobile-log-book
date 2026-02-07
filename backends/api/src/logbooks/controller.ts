import express from "express";
import * as service from "./service.ts";
import * as repository from "./repository.ts";
import handleRequest from "../utils/requestUtils.ts";
import idValidator from "./validators/idValidator.ts";
import z from "zod";

const router = express.Router();

router.get("/", async (req, res) => {
  // Define context
  const context = {
    res,
    input: req.user!.id,
    validator: idValidator,
    fun: repository.getUserLogbooks,
  };

  // Call handler
  return await handleRequest(context);
});

router.post("/", async (req, res) => {
  // Define validator
  const validator = z.object({
    userId: idValidator,
    logbookName: z.coerce.string(),
  });

  // Define context
  const context = {
    res,
    input: {
      userId: req.user!.id,
      logbookName: req.body!.logbookName,
    },
    validator,
    fun: ({ userId, logbookName }: z.infer<typeof validator>) =>
      repository.createLogbook(userId, logbookName),
  };

  // Call handler
  return await handleRequest(context);
});

router.get("/:logbook_id", async (req, res) => {
  // Define validator
  const validator = z.object({
    userId: idValidator,
    logbookId: idValidator,
  });

  // Define context
  const context = {
    res,
    input: {
      userId: req.user!.id,
      logbookId: req.params.logbook_id,
    },
    validator,
    fun: ({ userId, logbookId }: z.infer<typeof validator>) =>
      repository.getLogbook(userId, logbookId),
  };

  // Call handler
  return await handleRequest(context);
});

router.put("/:logbook_id", async (req, res) => {
  // Define validator
  const validator = z.object({
    userId: idValidator,
    logbookName: z.coerce.string(),
    logbookId: idValidator,
  });

  // Define context
  const context = {
    res,
    input: {
      userId: req.user!.id,
      logbookName: req.body?.logbookName,
      logbookId: req.params.logbook_id,
    },
    validator,
    fun: ({ userId, logbookName, logbookId }: z.infer<typeof validator>) =>
      repository.updateLogbook(userId, logbookName, logbookId),
  };

  // Call handler
  return await handleRequest(context);
});

router.delete("/:logbook_id", async (req, res) => {
  // Define validator
  const validator = z.object({
    userId: idValidator,
    logbookId: idValidator,
  });

  // Define context
  const context = {
    res,
    input: {
      userId: req.user!.id,
      logbookId: req.params.logbook_id,
    },
    validator,
    fun: ({ userId, logbookId }: z.infer<typeof validator>) =>
      repository.deleteLogbook(userId, logbookId),
  };

  // Call handler
  return await handleRequest(context);
});

router.get("/:logbook_id/logs", async (req, res) => {
  // Define validator
  const validator = z.object({
    userId: idValidator,
    logbookId: idValidator,
  });

  // Define context
  const context = {
    res,
    input: {
      userId: req.user!.id,
      logbookId: req.params.logbook_id,
    },
    validator,
    fun: ({ userId, logbookId }: z.infer<typeof validator>) =>
      repository.getLogItems(userId, logbookId),
  };

  // Call handler
  return await handleRequest(context);
});

router.post("/:logbook_id/logs", async (req, res) => {
  // Define validator
  const validator = z.object({
    userId: idValidator,
    logbookId: idValidator,
    logItems: req.body?.logItems, // TODO: logItem[] validator
  });

  // Define context
  const context = {
    res,
    input: {
      userId: req.user!.id,
      logbookId: req.params.logbook_id,
      logItems: req.body?.logItems,
    },
    validator,
    fun: ({ userId, logbookId, logItems }: z.infer<typeof validator>) =>
      service.saveLogItems(userId, logbookId, logItems),
  };

  // Call handler
  // return await handleRequest(context);
});

router.put("/:logbook_id/logs/:item_id", async (req, res) => {
  // Define validator
  const validator = z.object({
    userId: idValidator,
    logbookId: idValidator,
    itemId: idValidator,
    logItem: req.body?.logItem, // TODO: logItem validator
  });

  // Define context
  const context = {
    res,
    input: {
      userId: req.user!.id,
      logbookId: req.params.logbook_id,
      itemId: req.params.item_id,
      logItem: req.body?.logItem,
    },
    validator,
    fun: ({ userId, logbookId, itemId, logItem }: z.infer<typeof validator>) =>
      service.updateLogItem(userId, logbookId, itemId, logItem),
  };

  // Call handler
  // return await handleRequest(context);
});

router.delete("/:logbook_id/logs/:item_id", async (req, res) => {
  // Define validator
  const validator = z.object({
    userId: idValidator,
    logbookId: idValidator,
    itemId: idValidator,
  });

  // Define context
  const context = {
    res,
    input: {
      userId: req.user!.id,
      logbookId: req.params.logbook_id,
      itemId: req.params.item_id,
    },
    validator,
    fun: ({ userId, logbookId, itemId }: z.infer<typeof validator>) =>
      repository.deleteLogItem(userId, logbookId, itemId),
  };

  // Call handler
  return await handleRequest(context);
});

export default router;
