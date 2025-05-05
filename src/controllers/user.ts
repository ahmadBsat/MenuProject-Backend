import express, { query } from "express";
import { Logger } from "../entities/logger";
import { ERRORS } from "../constant/errors";
import { UserModel } from "../schemas/user";
import { calculate_pages, handleParams, success_msg } from "../utils/common";
import { hashAuthentication } from "../helpers/security";

export const getAllUsers = async (
  req: express.Request,
  res: express.Response
) => {
  try {
    const { limit, page, sortBy, skip } = handleParams(req.query);
    const { search } = req.query;

    const query: Record<string, any> = {};

    if (search && typeof search === "string") {
      query.$or = [
        { firstname: { $regex: search.trim(), $options: "i" } },
        { lastname: { $regex: search.trim(), $options: "i" } },
      ];
    }
    const users = await UserModel.find(query)
      .limit(limit)
      .skip(skip)
      .sort(sortBy)
      .lean();

    const count = await UserModel.countDocuments(query);
    const { meta } = calculate_pages(count, page, limit);

    return res.status(200).json({ data: users, meta }).end();
  } catch (error) {
    Logger.error(error);
    return res.status(406).send({ message: error.message || ERRORS.SERVER });
  }
};

export const getUserById = async (
  req: express.Request,
  res: express.Response
) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ message: "User ID is required" });
    }

    const user = await UserModel.findOne({ _id: id }).lean();

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json(user).end();
  } catch (error) {
    Logger.error(error);
    return res.status(406).send({ message: error.message || ERRORS.SERVER });
  }
};

export const createUser = async (
  req: express.Request,
  res: express.Response
) => {
  try {
    const data = req.body;

    const hashedPassword = await hashAuthentication(data.password);

    await UserModel.create({
      ...data,
      authentication: { password: hashedPassword },
    });

    return res.status(200).json(success_msg("User created")).end();
  } catch (error) {
    Logger.error(error);
    return res.status(406).send({ message: error.message || ERRORS.SERVER });
  }
};

export const updateUserById = async (
  req: express.Request,
  res: express.Response
) => {
  try {
    const { id } = req.params;
    const data = req.body;

    if (!id) {
      return res.status(400).json({ message: "User ID is required" });
    }

    const user = await UserModel.findOne({ _id: id });

    if (!user) {
      return res.status(400).json({ message: "No User found" });
    }

    if (data.password) {
      user.authentication.password = await hashAuthentication(data.password);

      await user.save();
    }

    const { authentication, ...rest } = data;

    await UserModel.updateOne(
      { _id: id },
      { $set: { ...rest } },
      { upsert: true }
    ).lean();

    return res.status(200).json(success_msg("User updated")).end();
  } catch (error) {
    Logger.error(error);
    return res.status(406).send({ message: error.message || ERRORS.SERVER });
  }
};

export const deleteUserById = async (
  req: express.Request,
  res: express.Response
) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ message: "User ID is required" });
    }

    const user = await UserModel.findOne({ _id: id });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    await user.deleteOne();

    return res.status(200).json(success_msg("User deleted")).end();
  } catch (error) {
    Logger.error(error);
    return res.status(406).send({ message: error.message || ERRORS.SERVER });
  }
};
