import { response } from "express";
import * as repository from "./repository.ts";

export const getLogbooks = async (userId: number) => {
  return await repository.getUserLogbooks(userId);
};

export const createLogbook = async (userId: number, logbookName: string) => {
  return await repository.createLogbook(userId, logbookName);
};

export const getLogbook = async (logbookId: number) => {
  return await repository.getLogbook(logbookId);
};

export const updateLogbook = async (logbookId: number, logbookName: string) => {
  return await repository.updateLogbook(logbookId, logbookName);
};

export const deleteLogbook = async (logbookId: number) => {
  return await repository.deleteLogbook(logbookId);
};

export const getLogbookContent = async (logbookId: number) => {
  return await repository.getLogitems(logbookId);
};

export const saveLogbookContent = async (logbookId: number) => {
  return await repository.saveLogitems(logbookId);
};

export const updateLogitem = async (itemId: number) => {
  return await repository.updateLogitem(itemId);
};

export const deleteLogitem = async (itemId: number) => {
  return await repository.deleteLogitem(itemId);
};
