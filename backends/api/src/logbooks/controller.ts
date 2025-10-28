import express from "express";

// GET /logbooks/
export const getLogbooks = (req: express.Request, res: express.Response) => {};

// POST /logbooks/
export const createLogbook = (
  req: express.Request,
  res: express.Response,
) => {};

// PUT /logbooks/:logbook_id
export const updateLogbook = (
  req: express.Request,
  res: express.Response,
) => {};

// DELETE /logbooks/:logbook_id
export const deleteLogbook = (
  req: express.Request,
  res: express.Response,
) => {};

// GET /logbooks/:logbook_id/logs
export const getLogitems = (req: express.Request, res: express.Response) => {};

// POST /logbooks/:logbook_id/logs
export const createLogitem = (
  req: express.Request,
  res: express.Response,
) => {};

// PUT /logbooks/:logbook_id/logs/:item_id
export const updateLogitem = (
  req: express.Request,
  res: express.Response,
) => {};

// DELETE /logbooks/:logbook_id/logs/:item_id
export const deleteLogitem = (
  req: express.Request,
  res: express.Response,
) => {};
