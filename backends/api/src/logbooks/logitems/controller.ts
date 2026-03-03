import express from "express";
import z from "zod";
import idValidator from "./../validators/idValidator.ts";
import handleRequest from "../../utils/requestUtils.ts";
import * as repository from "./repository.ts";
import logitemValidator from "./validators/logitemValidator.ts";

const router = express.Router();

router.get("/:logbook_id/logs", async (req, res) => {
  // Define validator
  const validator = z.object({
    ownerId: idValidator,
    logbookId: idValidator,
  });

  const input = {
    ownerId: req.user!.id,
    logbookId: req.params.logbook_id,
  };

  // Define context
  const context = {
    res,
    input,
    validator,
    fun: (input: z.infer<typeof validator>) => repository.getLogs(input),
  };

  // Call handler
  return await handleRequest(context);
});

router.post("/:logbook_id/logs", async (req, res) => {
  // Define validator
  const validator = z.object({
    ownerId: idValidator,
    logbookId: idValidator,
    logitems: z.array(logitemValidator),
  });

  const input = {
    ownerId: req.user!.id,
    logbookId: req.params.logbook_id,
    logitems: req.body?.logitems,
  };

  // Define context
  const context = {
    res,
    input,
    validator,
    fun: (input: z.infer<typeof validator>) => repository.createLogs(input),
  };

  // Call handler
  return await handleRequest(context);
});

router.put("/:logbook_id/logs", async (req, res) => {
  // Define validator
  const validator = z.object({
    ownerId: idValidator,
    logbookId: idValidator,
    logitems: z.array(logitemValidator),
  });

  const input = {
    ownerId: req.user!.id,
    logbookId: req.params.logbook_id,
    logitems: req.body?.logitems,
  };

  // Define context
  const context = {
    res,
    input,
    validator,
    fun: (input: z.infer<typeof validator>) => repository.updateLogs(input),
  };

  // Call handler
  return await handleRequest(context);
});

router.patch("/:logbook_id/logs", async (req, res) => {
  // Define validator
  const validator = z.object({
    ownerId: idValidator,
    logbookId: idValidator,
    logitems: z.array(
      logitemValidator.partial({
        logbookId: true,
        title: true,
        createdAt: true,
        isActive: true,
      }),
    ),
  });

  const input = {
    ownerId: req.user!.id,
    logbookId: req.params.logbook_id,
    logitems: req.body?.logitems,
  };

  // Define context
  const context = {
    res,
    input,
    validator,
    fun: (input: z.infer<typeof validator>) => repository.updateLogs(input),
  };

  // Call handler
  return await handleRequest(context);
});

router.delete("/:logbook_id/logs", async (req, res) => {
  // Define validator
  const validator = z.object({
    ownerId: idValidator,
    logbookId: idValidator,
    logitemIds: z.array(idValidator),
  });

  const input = {
    ownerId: req.user!.id,
    logbookId: req.params.logbook_id,
    logitemIds: req.body?.logitemIds,
  };

  // Define context
  const context = {
    res,
    input,
    validator,
    fun: (input: z.infer<typeof validator>) =>
      repository.deleteMultipleLogs(input),
  };

  // Call handler
  return await handleRequest(context);
});

router.get("/:logbook_id/logs/:item_id", async (req, res) => {
  // Define validator
  const validator = z.object({
    ownerId: idValidator,
    logbookId: idValidator,
    logitemId: idValidator,
  });

  const input = {
    ownerId: req.user!.id,
    logbookId: req.params.logbook_id,
    logitemId: req.params.item_id,
  };

  // Define context
  const context = {
    res,
    input,
    validator,
    fun: (input: z.infer<typeof validator>) => repository.getLog(input),
  };

  // Call handler
  return await handleRequest(context);
});

router.put("/:logbook_id/logs/:item_id", async (req, res) => {
  // Define validator
  const validator = z.object({
    ownerId: idValidator,
    logbookId: idValidator,
    logitemId: idValidator,
    logitem: logitemValidator,
  });

  const input = {
    ownerId: req.user!.id,
    logbookId: req.params.logbook_id,
    logitemId: req.params.item_id,
    logitem: req.body?.logitem,
  };

  // Define context
  const context = {
    res,
    input,
    validator,
    fun: (input: z.infer<typeof validator>) => repository.updateLogitem(input),
  };

  // Call handler
  return await handleRequest(context);
});

router.patch("/:logbook_id/logs/:item_id", async (req, res) => {
  // Define validator
  const validator = z.object({
    ownerId: idValidator,
    logbookId: idValidator,
    logitemId: idValidator,
    logitem: logitemValidator.partial({
      logbookId: true,
      title: true,
      createdAt: true,
      isActive: true,
    }),
  });

  const input = {
    ownerId: req.user!.id,
    logbookId: req.params.logbook_id,
    logitemId: req.params.item_id,
    logitem: req.body?.logitem,
  };

  // Define context
  const context = {
    res,
    input,
    validator,
    fun: (input: z.infer<typeof validator>) => repository.updateLogitem(input),
  };

  // Call handler
  return await handleRequest(context);
});

router.delete("/:logbook_id/logs/:item_id", async (req, res) => {
  // Define validator
  const validator = z.object({
    ownerId: idValidator,
    logbookId: idValidator,
    logitemId: idValidator,
  });

  const input = {
    ownerId: req.user!.id,
    logbookId: req.params.logbook_id,
    logitemId: req.params.item_id,
  };

  // Define context
  const context = {
    res,
    input,
    validator,
    fun: (input: z.infer<typeof validator>) => repository.deleteLogitem(input),
  };

  // Call handler
  return await handleRequest(context);
});

router.post("/:logbook_id/latest", async (req, res) => {
  // Define validator
  const validator = z.object({
    ownerId: idValidator,
    logbookId: idValidator,
    version: z.number().min(0),
  });

  const input = {
    ownerId: req.user!.id,
    logbookId: req.params.logbook_id,
    version: req.body?.version,
  };

  // Define context
  const context = {
    res,
    input,
    validator,
    fun: (input: z.infer<typeof validator>) =>
      repository.getLatestLogitems(input),
  };

  // Call handler
  return await handleRequest(context);
});

export default router;
