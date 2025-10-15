import express from "express";

// GET /vessels/
export const getVessels = (req: express.Request, res: express.Response) => {
};

// POST /vessels/
export const createVessel = (req: express.Request, res: express.Response) => {
};

// PUT /vessels/:vessel_id
export const updateVessel = (req: express.Request, res: express.Response) => {
};

// DELETE /vessels/:vessel_id
export const deleteVessel = (req: express.Request, res: express.Response) => {
};

// GET /vessels/:vessel_id/logs
export const getLogitems = (req: express.Request, res: express.Response) => {
};

// POST /vessels/:vessel_id/logs
export const createLogitem = (req: express.Request, res: express.Response) => {
};

// PUT /vessels/:vessel_id/logs/:item_id
export const updateLogitem = (req: express.Request, res: express.Response) => {
};

// DELETE /vessels/:vessel_id/logs/:item_id
export const deleteLogitem = (req: express.Request, res: express.Response) => {
};
