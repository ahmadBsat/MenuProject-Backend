import express from "express";
import { User } from "../types/user";
import { Logger } from "../entities/logger";
import { ERRORS } from "../constant/errors";
import { StoreModel } from "../schemas/store/store";
import { BannerModel } from "../schemas/banner";
import { calculate_pages, handleParams, success_msg } from "../utils/common";
import { CurrencyModel } from "../schemas/currency";

export const getBannerById = async (
  req: express.Request,
  res: express.Response
) => {
  try {
    const { id } = req.params;
    const user = res.locals.user;

    if (!id) {
      return res.status(400).json({ message: ERRORS.STORE_ID_REQUIRED });
    }

    const store = await StoreModel.findOne({ owner: user._id }).lean();

    if (!store) {
      return res.status(404).json({ message: ERRORS.NO_USER_STORE });
    }

    const banner = await BannerModel.findOne({
      _id: id,
      store: store._id,
    }).lean();

    if (!banner) {
      return res.status(404).json({ message: ERRORS.NO_BANNER });
    }

    return res.status(200).json(banner).end();
  } catch (error) {
    Logger.error(error);
    return res.status(406).send({ message: error.message || ERRORS.SERVER });
  }
};

export const getStoreBanners = async (
  req: express.Request,
  res: express.Response
) => {
  try {
    const user = res.locals.user;
    const { limit, page, skip, sortBy } = handleParams(req.query);

    const store = await StoreModel.findOne({ owner: user._id }).lean();
    if (!store) {
      return res.status(404).json({ message: ERRORS.NO_USER_STORE });
    }

    const banners = await BannerModel.find({ store: store._id })
      .limit(limit)
      .skip(skip)
      .sort(sortBy)
      .lean();

    const count = await BannerModel.countDocuments({ store: store._id });
    const { meta } = calculate_pages(count, page, limit);

    return res.status(200).json({ data: banners, meta }).end();
  } catch (error) {
    Logger.error(error);
    return res.status(406).send({ message: error.message || ERRORS.SERVER });
  }
};

export const createStoreBanner = async (
  req: express.Request,
  res: express.Response
) => {
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

export const updateStoreBanner = async (
  req: express.Request,
  res: express.Response
) => {
  try {
    const { id } = req.params;
    const data = req.body;
    const user = res.locals.user;

    if (!id) {
      return res.status(400).json({ message: ERRORS.STORE_ID_REQUIRED });
    }

    const store = await StoreModel.findOne({ owner: user._id }).lean();
    if (!store) {
      return res.status(404).json({ message: ERRORS.NO_USER_STORE });
    }

    await BannerModel.updateOne(
      { _id: id, store: store._id },
      { $set: { ...data, store: store._id } },
      { upsert: true }
    );

    return res.status(200).json(success_msg("Store banner updated")).end();
  } catch (error) {
    Logger.error(error);
    return res.status(406).send({ message: error.message || ERRORS.SERVER });
  }
};

export const deleteStoreBanner = async (
  req: express.Request,
  res: express.Response
) => {
  try {
    const { id } = req.params;
    const user = res.locals.user;

    if (!id) {
      return res.status(400).json({ message: ERRORS.STORE_ID_REQUIRED });
    }

    const store = await StoreModel.findOne({ owner: user._id }).lean();
    if (!store) {
      return res.status(404).json({ message: ERRORS.NO_USER_STORE });
    }

    await BannerModel.deleteOne({ _id: id, store: store._id });

    return res.status(200).json(success_msg("Store banner deleted")).end();
  } catch (error) {
    Logger.error(error);
    return res.status(406).send({ message: error.message || ERRORS.SERVER });
  }
};
