import express from "express";
import * as repository from "./repository.ts";
import handleRequest from "../utils/requestUtils.ts";
import idValidator from "./validators/idValidator.ts";
import z from "zod";
import logitemRouter from "./logitems/controller.ts";
import logbookValidator from "./validators/logbookValidator.ts";

const router = express.Router();
router.use(logitemRouter);

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
    ownerId: idValidator,
    logbook: logbookValidator.partial({ vesselType: true, registration: true }),
  });

  const input = {
    ownerId: req.user!.id,
    logbook: {
      id: req.body.id,
      name: req.body.name,
      vesselType: req.body.vesselType,
      registration: req.body.registration,
    },
  };

  // Define context
  const context = {
    res,
    input,
    validator,
    fun: (input: z.infer<typeof validator>) => repository.createLogbook(input),
  };

  // Call handler
  return await handleRequest(context);
});

router.get("/:logbook_id", async (req, res) => {
  // Define validator
  const validator = z.object({
    ownerId: idValidator,
    id: idValidator,
  });

  const input = {
    ownerId: req.user!.id,
    id: req.params.logbook_id,
  };

  // Define context
  const context = {
    res,
    input,
    validator,
    fun: (input: z.infer<typeof validator>) => repository.getLogbook(input),
  };

  // Call handler
  return await handleRequest(context);
});

router.put("/:logbook_id", async (req, res) => {
  // Define validator
  const validator = z.object({
    ownerId: idValidator,
    logbook: logbookValidator,
  });

  const input = {
    ownerId: req.user!.id,
    logbook: {
      id: req.params.logbook_id,
      name: req.body.name,
      vesselType: req.body.vesselType,
      registration: req.body.registration,
    },
  };

  // Define context
  const context = {
    res,
    input,
    validator,
    fun: (input: z.infer<typeof validator>) => repository.updateLogbook(input),
  };

  // Call handler
  return await handleRequest(context);
});

router.patch("/:logbook_id", async (req, res) => {
  // Define validator
  const validator = z.object({
    ownerId: idValidator,
    logbook: logbookValidator.partial({
      name: true,
      vesselType: true,
      registration: true,
    }),
  });

  const input = {
    ownerId: req.user!.id,
    logbook: {
      id: req.params.logbook_id,
      name: req.body.name,
      vesselType: req.body.vesselType,
      registration: req.body.registration,
    },
  };

  // Define context
  const context = {
    res,
    input,
    validator,
    fun: (input: z.infer<typeof validator>) => repository.updateLogbook(input),
  };

  // Call handler
  return await handleRequest(context);
});

router.delete("/:logbook_id", async (req, res) => {
  // Define validator
  const validator = z.object({
    ownerId: idValidator,
    id: idValidator,
  });

  const input = {
    ownerId: req.user!.id,
    id: req.params.logbook_id,
  };

  // Define context
  const context = {
    res,
    input,
    validator,
    fun: (input: z.infer<typeof validator>) => repository.deleteLogbook(input),
  };

  // Call handler
  return await handleRequest(context);
});

export default router;
