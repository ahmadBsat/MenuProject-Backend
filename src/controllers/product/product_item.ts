import express from "express";
import { User } from "../../types/user";
import { ERRORS } from "../../constant/errors";
import { Logger } from "../../entities/logger";
import { StoreModel } from "../../schemas/store/store";
import { ProductModel } from "../../schemas/product/product";
import { calculate_pages, handleParams, success_msg } from "../../utils/common";

//todo
export const getProductItems = async (
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

    const products = await ProductModel.find({ store: store._id })
      .limit(limit)
      .skip(skip)
      .sort(sortBy)
      .lean();

    const count = await ProductModel.countDocuments({ store: store._id });
    const { meta } = calculate_pages(count, page, limit);

    return res.status(200).json({ data: products, meta }).end();
  } catch (error) {
    Logger.error(error);
    return res.status(406).send({ message: error.message || ERRORS.SERVER });
  }
};
