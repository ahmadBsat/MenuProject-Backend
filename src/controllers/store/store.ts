import express from "express";
import { User } from "../../types/user";
import { Logger } from "../../entities/logger";
import { ERRORS } from "../../constant/errors";
import { StoreModel } from "../../schemas/store/store";
import { ProductModel } from "../../schemas/product/product";
import { ProductItemModel } from "../../schemas/product/product_item";
import { StoreBranchModel } from "../../schemas/store/store_branch";
import { calculate_pages, handleParams, success_msg } from "../../utils/common";

export const getAllStores = async (
  req: express.Request,
  res: express.Response
) => {
  try {
    const { limit, page, sortBy, skip } = handleParams(req.query);

    const stores = await StoreModel.find({})
      .limit(limit)
      .skip(skip)
      .sort(sortBy)
      .lean();

    const count = await StoreModel.countDocuments({});
    const { meta } = calculate_pages(count, page, limit);

    return res.status(200).json({ data: stores, meta }).end();
  } catch (error) {
    Logger.error(error);
    return res.status(406).send({ message: error.message || ERRORS.SERVER });
  }
};

export const getStoreById = async (
  req: express.Request,
  res: express.Response
) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ message: ERRORS.STORE_ID_REQUIRED });
    }

    const store = await StoreModel.findOne({ _id: id }).lean();

    return res.status(200).json(store).end();
  } catch (error) {
    Logger.error(error);
    return res.status(406).send({ message: error.message || ERRORS.SERVER });
  }
};

export const getUserStore = async (
  req: express.Request,
  res: express.Response
) => {
  try {
    const user = res.locals.user as User;

    const store = await StoreModel.findOne({ owner: user._id }).lean();

    if (!store) {
      return res.status(404).json({ message: ERRORS.NO_USER_STORE });
    }

    return res.status(200).json(store).end();
  } catch (error) {
    Logger.error(error);
    return res.status(406).send({ message: error.message || ERRORS.SERVER });
  }
};

export const createStoreAdmin = async (
  req: express.Request,
  res: express.Response
) => {
  try {
    const data = req.body;

    await StoreModel.create({ ...data });

    return res.status(200).json(success_msg("Store created")).end();
  } catch (error) {
    Logger.error(error);
    return res.status(406).send({ message: error.message || ERRORS.SERVER });
  }
};

export const updateStoreAdmin = async (
  req: express.Request,
  res: express.Response
) => {
  try {
    const data = req.body;
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ message: ERRORS.STORE_ID_REQUIRED });
    }

    await StoreModel.updateOne(
      { _id: id },
      { $set: { ...data } },
      { upsert: true }
    );

    return res.status(200).json(success_msg("Store updated")).end();
  } catch (error) {
    Logger.error(error);
    return res.status(406).send({ message: error.message || ERRORS.SERVER });
  }
};

export const updateStoreUser = async (
  req: express.Request,
  res: express.Response
) => {
  try {
    const data = req.body;
    const user = res.locals.user as User;

    const store = await StoreModel.findOne({ owner: user }).lean();

    if (!store) {
      return res.status(404).json({ message: ERRORS.NO_USER_STORE });
    }

    await StoreModel.updateOne(
      { _id: store._id },
      { $set: { ...data } },
      { upsert: true }
    );

    return res.status(200).json(success_msg("Store updated")).end();
  } catch (error) {
    Logger.error(error);
    return res.status(406).send({ message: error.message || ERRORS.SERVER });
  }
};

export const deleteStoreAdmin = async (
  req: express.Request,
  res: express.Response
) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ message: ERRORS.STORE_ID_REQUIRED });
    }

    const store = await StoreModel.findOneAndDelete({ _id: id }).lean();
    const products = await ProductModel.find({ store: store._id })
      .distinct("_id")
      .lean();

    await StoreBranchModel.deleteMany({ store: store._id });
    await ProductModel.deleteMany({ _id: { $in: products } });
    await ProductItemModel.deleteMany({ product: { $in: products } });

    return res.status(200).json(success_msg("Store updated")).end();
  } catch (error) {
    Logger.error(error);
    return res.status(406).send({ message: error.message || ERRORS.SERVER });
  }
};
