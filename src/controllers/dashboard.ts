import express from "express";
import { Logger } from "../entities/logger";
import { ERRORS } from "../constant/errors";

export const health = async (req: express.Request, res: express.Response) => {
  try {
    return res.status(200).json({ status: 200, ok: true }).end();
  } catch (error) {
    Logger.error(error);
    return res.status(406).send({ message: error.message || ERRORS.SERVER });
  }
};
