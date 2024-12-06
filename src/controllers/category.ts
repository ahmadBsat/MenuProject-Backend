import express from "express";
import { User } from "../types/user";
import { Logger } from "../entities/logger";
import { ERRORS } from "../constant/errors";
import { StoreModel } from "../schemas/store/store";
import { calculate_pages, handleParams, success_msg } from "../utils/common";
import { CategoryModel } from "../schemas/category";

export const getCategoryById = async (
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

    const category = await CategoryModel.findOne({
      _id: id,
      store: store._id,
    }).lean();

    if (!category) {
      return res.status(404).json({ message: ERRORS.NO_CATEGORY });
    }

    return res.status(200).json(category).end();
  } catch (error) {
    Logger.error(error);
    return res.status(406).send({ message: error.message || ERRORS.SERVER });
  }
};

export const getStoreCategoryes = async (
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

    const categoryes = await CategoryModel.find({ store: store._id })
      .limit(limit)
      .skip(skip)
      .sort(sortBy)
      .lean();
    const count = await CategoryModel.countDocuments({ store: store._id });
    const { meta } = calculate_pages(count, page, limit);

    return res.status(200).json({ data: categoryes, meta }).end();
  } catch (error) {
    Logger.error(error);
    return res.status(406).send({ message: error.message || ERRORS.SERVER });
  }
};

export const createStoreCategory = async (
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

    await CategoryModel.create({ ...data, store: store._id });

    return res.status(200).json(success_msg("Store category created")).end();
  } catch (error) {
    Logger.error(error);
    return res.status(406).send({ message: error.message || ERRORS.SERVER });
  }
};

export const updateStoreCategory = async (
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

    await CategoryModel.updateOne(
      { _id: id, store: store._id },
      { $set: { ...data, store: store._id } },
      { upsert: true }
    );

    return res.status(200).json(success_msg("Store category updated")).end();
  } catch (error) {
    Logger.error(error);
    return res.status(406).send({ message: error.message || ERRORS.SERVER });
  }
};

export const deleteStoreCategory = async (
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

    await CategoryModel.deleteOne({ _id: id, store: store._id });

    return res.status(200).json(success_msg("Store category deleted")).end();
  } catch (error) {
    Logger.error(error);
    return res.status(406).send({ message: error.message || ERRORS.SERVER });
  }
};
