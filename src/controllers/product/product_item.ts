import express from "express";
import { User } from "../../types/user";
import { Logger } from "../../entities/logger";
import { ERRORS } from "../../constant/errors";
import { StoreModel } from "../../schemas/store/store";
import { calculate_pages, handleParams, success_msg } from "../../utils/common";
import { ProductItemModel } from "../../schemas/product/product_item";

export const getProductItemById = async (
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

    const item = await ProductItemModel.findOne({
      _id: id,
      store: store._id,
    }).lean();

    if (!item) {
      return res.status(404).json({ message: ERRORS.BRANCH_NOT_FOUND });
    }

    return res.status(200).json(item).end();
  } catch (error) {
    Logger.error(error);
    return res.status(406).send({ message: error.message || ERRORS.SERVER });
  }
};

export const getStoreProductItems = async (
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

    const { search } = req.query;

    const query: Record<string, any> = {};

    if (search && typeof search === "string") {
      query.$or = [{ name: { $regex: search.trim(), $options: "i" } }];
    }

    const items = await ProductItemModel.find({ store: store._id, ...query })
      .limit(limit)
      .skip(skip)
      .sort(sortBy)
      .lean();
    const count = await ProductItemModel.countDocuments({
      store: store._id,
      ...query,
    });
    const { meta } = calculate_pages(count, page, limit);

    return res.status(200).json({ data: items, meta }).end();
  } catch (error) {
    Logger.error(error);
    return res.status(406).send({ message: error.message || ERRORS.SERVER });
  }
};

export const createStoreProductItem = async (
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

    await ProductItemModel.create({ ...data, store: store._id });

    return res.status(200).json(success_msg("Store item created")).end();
  } catch (error) {
    Logger.error(error);
    return res.status(406).send({ message: error.message || ERRORS.SERVER });
  }
};

export const updateStoreProductItem = async (
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

    await ProductItemModel.updateOne(
      { _id: id, store: store._id },
      { $set: { ...data, store: store._id } },
      { upsert: true }
    );

    return res.status(200).json(success_msg("Store item updated")).end();
  } catch (error) {
    Logger.error(error);
    return res.status(406).send({ message: error.message || ERRORS.SERVER });
  }
};

export const deleteStoreProductItem = async (
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

    await ProductItemModel.deleteOne({ _id: id, store: store._id });

    return res.status(200).json(success_msg("Store item deleted")).end();
  } catch (error) {
    Logger.error(error);
    return res.status(406).send({ message: error.message || ERRORS.SERVER });
  }
};
