import express from "express";
import { User } from "../types/user";
import { Logger } from "../entities/logger";
import { ERRORS } from "../constant/errors";
import { StoreModel } from "../schemas/store/store";
import { BannerModel } from "../schemas/banner"
import { calculate_pages, handleParams, success_msg } from "../utils/common";
import { CurrencyModel } from "../schemas/currency";

export const createStoreBanner = async (req: express.Request, res: express.Response) => {
    try {
      const data = req.body;
      const user = res.locals.user;
  
      const store = await StoreModel.findOne({ owner: user._id }).lean();
      if (!store) {
        return res.status(404).json({ message: ERRORS.NO_USER_STORE });
      }
  
      await BannerModel.create({ ...data, store: store._id });
  
      return res.status(200).json(success_msg("Store banner created")).end();
    } catch (error) {
      Logger.error(error);
      return res.status(406).send({ message: error.message || ERRORS.SERVER });
    }
  };
