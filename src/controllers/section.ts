import express from "express";
import { SectionModel } from "../schemas/section";
import { StoreModel } from "../schemas/store/store";
import { Logger } from "../entities/logger";
import { ERRORS } from "../constant/errors";
import { calculate_pages, handleParams, success_msg } from "../utils/common";
import { User } from "types/user";

export const getStoreSectionById = async (
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

    const section = await SectionModel.findOne({
      _id: id,
      store: store._id,
    }).lean();

    if (!section) {
      return res.status(404).json({ message: ERRORS.NO_SECTION });
    }

    return res.status(200).json(section).end();
  } catch (error) {
    Logger.error(error);
    return res.status(406).send({ message: error.message || ERRORS.SERVER });
  }
};

export const getStoreSections= async (
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

    const sections = await SectionModel.find({ store: store._id })
      .limit(limit)
      .skip(skip)
      .sort(sortBy)
      .lean();

    const count = await SectionModel.countDocuments({ store: store._id });
    const { meta } = calculate_pages(count, page, limit);
    return res.status(200).json({ data: sections, meta }).end();
  } catch (error) {
    Logger.error(error);
    return res.status(406).send({ message: error.message || ERRORS.SERVER });
  }
};
export const createStoreSection = async (
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

    await SectionModel.create({ ...data, store: store._id });

    return res.status(200).json(success_msg("Section created")).end();
  } catch (error) {
    Logger.error(error);
    return res.status(406).send({ message: error.message || ERRORS.SERVER });
  }
};

export const updateStoreSection = async (
  req: express.Request,
  res: express.Response
) => {
  try {
    const { id } = req.params;
    const data = req.body;
    const user = res.locals.user;

    const store = await StoreModel.findOne({ owner: user._id }).lean();

    if (!store) {
      return res.status(404).json({ message: ERRORS.NO_USER_STORE });
    }

    await SectionModel.updateOne(
      { _id: id, store: store._id },
      { $set: { ...data } },
      { upsert: true }
    );

    return res.status(200).json(success_msg("Section updated")).end();
  } catch (error) {
    Logger.error(error);
    return res.status(406).send({ message: error.message || ERRORS.SERVER });
  }
};

export const deleteStoreSection = async (
  req: express.Request,
  res: express.Response
) => {
  try {
    const { id } = req.params;
    const user = res.locals.user;

    const store = await StoreModel.findOne({ owner: user._id }).lean();

    if (!store) {
      return res.status(404).json({ message: ERRORS.NO_USER_STORE });
    }

    await SectionModel.deleteOne({ _id: id, store: store._id });

    return res.status(200).json(success_msg("Section deleted")).end();
  } catch (error) {
    Logger.error(error);
    return res.status(406).send({ message: error.message || ERRORS.SERVER });
  }
};
