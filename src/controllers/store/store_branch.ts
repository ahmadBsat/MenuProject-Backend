import express from "express";
import { User } from "../../types/user";
import { Logger } from "../../entities/logger";
import { ERRORS } from "../../constant/errors";
import { StoreModel } from "../../schemas/store/store";
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

    const { search } = req.query;

    const query: Record<string, any> = {};

    if (search && typeof search === "string") {
      query.$or = [
        { name: { $regex: search.trim(), $options: "i" } },
      ];
    }

    const branches = await StoreBranchModel.find({ store: store._id, ...query })
      .limit(limit)
      .skip(skip)
      .sort(sortBy)
      .lean();
    const count = await StoreBranchModel.countDocuments({ store: store._id, ...query });
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
    const user = res.locals.user as User;

    const store = await StoreModel.findOne({ owner: user._id }).lean();

    if (!store) {
      return res.status(404).json({ message: ERRORS.NO_USER_STORE });
    }

    await StoreBranchModel.create({ ...data, store: store._id });

    return res.status(200).json(success_msg("Store branch created")).end();
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

    await StoreBranchModel.updateOne(
      { _id: id, store: store._id },
      { $set: { ...data, store: store._id } },
      { upsert: true }
    );

    return res.status(200).json(success_msg("Store branch updated")).end();
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
    const user = res.locals.user as User;

    if (!id) {
      return res.status(400).json({ message: ERRORS.STORE_ID_REQUIRED });
    }

    const store = await StoreModel.findOne({ owner: user._id }).lean();

    if (!store) {
      return res.status(404).json({ message: ERRORS.NO_USER_STORE });
    }

    await StoreBranchModel.deleteOne({ _id: id, store: store._id });

    return res.status(200).json(success_msg("Store branch deleted")).end();
  } catch (error) {
    Logger.error(error);
    return res.status(406).send({ message: error.message || ERRORS.SERVER });
  }
};
