import express from "express";
import { Logger } from "../entities/logger";
import { ERRORS } from "../constant/errors";
import { UserModel } from "../schemas/user";
import { calculate_pages, handleParams } from "../utils/common";

export const getAllUsers = async (
  req: express.Request,
  res: express.Response
) => {
  try {
    const { limit, page, sortBy, skip } = handleParams(req.query);

    const users = await UserModel.find({})
      .limit(limit)
      .skip(skip)
      .sort(sortBy)
      .lean();

    const count = await UserModel.countDocuments({});
    const { meta } = calculate_pages(count, page, limit);

    return res.status(200).json({ data: users, meta }).end();
  } catch (error) {
    Logger.error(error);
    return res.status(406).send({ message: error.message || ERRORS.SERVER });
  }
};
