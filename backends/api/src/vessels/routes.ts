import express from "express";
import * as controller from "./controller.ts";

const router = express.Router();

router.get("/", (req, res) => {
  return controller.getVessels(req, res);
});

router.post("/", (req, res) => {
  return controller.createVessel(req, res);
});

router.put("/:vessel_id", (req, res) => {
  return controller.updateVessel(req, res);
});

router.delete("/:vessel_id", (req, res) => {
  return controller.deleteVessel(req, res);
});

router.get("/:vessel_id/logs", (req, res) => {
  return controller.getLogitems(req, res);
});

router.post("/:vessel_id/logs", (req, res) => {
  return controller.createLogitem(req, res);
});

router.put("/:vessel_id/logs/:item_id", (req, res) => {
  return controller.updateLogitem(req, res);
});

router.delete("/:vessel_id/logs/:item_id", (req, res) => {
  return controller.deleteLogitem(req, res);
});

export default router;
