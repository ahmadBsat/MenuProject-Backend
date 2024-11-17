import express from "express";
import { User } from "../../types/user";
import { Logger } from "../../entities/logger";
import { ERRORS } from "../../constant/errors";
import { StoreModel } from "../../schemas/store/store";
import { ProductModel } from "../../schemas/product/product";
import { ProductItemModel } from "../../schemas/product/product_item";
import { StoreBranchModel } from "../../schemas/store/store_branch";
import { calculate_pages, handleParams, success_msg } from "../../utils/common";

export const getBranchById = async (
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

    const branch = await StoreBranchModel.findOne({
      _id: id,
      store: store._id,
    }).lean();

    if (!branch) {
      return res.status(404).json({ message: ERRORS.BRANCH_NOT_FOUND });
    }

    return res.status(200).json(branch).end();
  } catch (error) {
    Logger.error(error);
    return res.status(406).send({ message: error.message || ERRORS.SERVER });
  }
};

export const getStoreBranches = async (
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

    const branches = await StoreBranchModel.find({ store: store._id })
      .limit(limit)
      .skip(skip)
      .sort(sortBy)
      .lean();
    const count = await StoreBranchModel.countDocuments({ store: store._id });
    const { meta } = calculate_pages(count, page, limit);

    return res.status(200).json({ data: branches, meta }).end();
  } catch (error) {
    Logger.error(error);
    return res.status(406).send({ message: error.message || ERRORS.SERVER });
  }
};

export const createStoreBranch = async (
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

export const updateStoreBranch = async (
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

export const deleteStoreBranch = async (
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
