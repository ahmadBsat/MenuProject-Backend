import express from "express";
import { User } from "../types/user";
import { Logger } from "../entities/logger";
import { ERRORS } from "../constant/errors";
import { StoreModel } from "../schemas/store/store";
import { calculate_pages, handleParams, success_msg } from "../utils/common";
import { CurrencyModel } from "../schemas/currency";

export const getCurrencyById = async (
  req: express.Request,
  res: express.Response
) => {
  try {
    const { id } = req.params;
    const user = res.locals.user as User;

    if (!id) {
      return res.status(400).json({ message: ERRORS.STORE_ID_REQUIRED });
    }

    const store = await StoreModel.findOne({ owner: user._id }).lean();

    if (!store) {
      return res.status(404).json({ message: ERRORS.NO_USER_STORE });
    }

    const currency = await CurrencyModel.findOne({
      _id: id,
      store: store._id,
    }).lean();

    if (!currency) {
      return res.status(404).json({ message: ERRORS.NO_CATEGORY });
    }

    return res.status(200).json(currency).end();
  } catch (error) {
    Logger.error(error);
    return res.status(406).send({ message: error.message || ERRORS.SERVER });
  }
};

export const getStoreCurrencies = async (
  req: express.Request,
  res: express.Response
) => {
  try {
    const user = res.locals.user as User;
    const { limit, page, skip, sortBy } = handleParams(req.query);

    const store = await StoreModel.findOne({ owner: user._id }).lean();

    if (!store) {
      return res.status(404).json({ message: ERRORS.NO_USER_STORE });
    }

    const currencies = await CurrencyModel.find({ store: store._id })
      .limit(limit)
      .skip(skip)
      .sort(sortBy)
      .lean();
    const count = await CurrencyModel.countDocuments({ store: store._id });
    const { meta } = calculate_pages(count, page, limit);

    return res.status(200).json({ data: currencies, meta }).end();
  } catch (error) {
    Logger.error(error);
    return res.status(406).send({ message: error.message || ERRORS.SERVER });
  }
};

export const createStoreCurrency = async (
  req: express.Request,
  res: express.Response
) => {
  try {
    const data = req.body;
    const user = res.locals.user as User;

    const store = await StoreModel.findOne({ owner: user._id }).lean();

    if (!store) {
      return res.status(404).json({ message: ERRORS.NO_USER_STORE });
    }

    await CurrencyModel.create({ ...data, store: store._id });

    return res.status(200).json(success_msg("Store currency created")).end();
  } catch (error) {
    Logger.error(error);
    return res.status(406).send({ message: error.message || ERRORS.SERVER });
  }
};

export const updateStoreCurrency = async (
  req: express.Request,
  res: express.Response
) => {
  try {
    const { id } = req.params;

    const data = req.body;
    const user = res.locals.user as User;

    if (!id) {
      return res.status(400).json({ message: ERRORS.STORE_ID_REQUIRED });
    }

    const store = await StoreModel.findOne({ owner: user._id }).lean();

    if (!store) {
      return res.status(404).json({ message: ERRORS.NO_USER_STORE });
    }

    await CurrencyModel.updateOne(
      { _id: id, store: store._id },
      { $set: { ...data, store: store._id } },
      { upsert: true }
    );

    return res.status(200).json(success_msg("Store currency updated")).end();
  } catch (error) {
    Logger.error(error);
    return res.status(406).send({ message: error.message || ERRORS.SERVER });
  }
};

export const deleteStoreCurrency = async (
  req: express.Request,
  res: express.Response
) => {
  try {
    const { id } = req.params;
    const user = res.locals.user as User;

    if (!id) {
      return res.status(400).json({ message: ERRORS.STORE_ID_REQUIRED });
    }

    const store = await StoreModel.findOne({ owner: user._id }).lean();

    if (!store) {
      return res.status(404).json({ message: ERRORS.NO_USER_STORE });
    }

    await CurrencyModel.deleteOne({ _id: id, store: store._id });

    return res.status(200).json(success_msg("Store currency deleted")).end();
  } catch (error) {
    Logger.error(error);
    return res.status(406).send({ message: error.message || ERRORS.SERVER });
  }
};
