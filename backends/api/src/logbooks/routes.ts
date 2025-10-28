import express from "express";
import * as controller from "./controller.ts";

const router = express.Router();

router.get("/", (req, res) => {
  return controller.getLogbooks(req, res);
});

router.post("/", (req, res) => {
  return controller.createLogbook(req, res);
});

router.put("/:logbook_id", (req, res) => {
  return controller.updateLogbook(req, res);
});

router.delete("/:logbook_id", (req, res) => {
  return controller.deleteLogbook(req, res);
});

router.get("/:logbook_id/logs", (req, res) => {
  return controller.getLogitems(req, res);
});

router.post("/:logbook_id/logs", (req, res) => {
  return controller.createLogitem(req, res);
});

router.put("/:logbook_id/logs/:item_id", (req, res) => {
  return controller.updateLogitem(req, res);
});

router.delete("/:logbook_id/logs/:item_id", (req, res) => {
  return controller.deleteLogitem(req, res);
});

export default router;
