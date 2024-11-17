import { v4 } from "uuid";
import express from "express";
import { ERRORS } from "../constant/errors";
import { Logger } from "../entities/logger";
import { CartModel } from "../schemas/cart";
import { getCartData, isSimilar, remove_cart_item } from "../helpers/cart";

const store = "";

export const get_cart = async (req: express.Request, res: express.Response) => {
  try {
    const session_id = req.cookies["session_id"];

    if (!session_id) {
      return await handleNewSession(req, res);
    }

    return await handleExistingSession(req, res);
  } catch (error) {
    Logger.error(error);
    return res.status(406).send({ message: error.message || ERRORS.SERVER });
  }
};

export const add_to_cart = async (
  req: express.Request,
  res: express.Response
) => {
  try {
    const { product } = req.body;
    const currency = req.get("x-currency-id");
    const session_id = req.cookies["session_id"];

    if (!session_id) {
      return res
        .status(400)
        .json({ message: "Please login to add to you're cart" })
        .end();
    }

    const filter = { session_id: session_id };
    const cart = await CartModel.findOne(filter).lean();

    if (!cart) {
      return res.status(404).json({ message: "Cart not found" }).end();
    }

    let product_found = false;

    const products = cart.products.map((item) => {
      const is_included =
        item.id.toString() === product.id &&
        isSimilar(item.product_additions, product.product_additions);

      if (is_included) {
        item.quantity += product.quantity; // update quantity
        product_found = true;
      }

      return item;
    });

    // add product if not found
    if (!product_found) {
      products.push(product);
    }

    const updatedCart = await CartModel.findByIdAndUpdate(
      cart._id,
      {
        products,
      },
      { new: true }
    ).lean();

    const { _id, session_id: removedId, ...rest } = updatedCart;
    const cartData = await getCartData(updatedCart, currency, store);

    return res.status(200).json({ ...rest, ...cartData });
  } catch (error) {
    Logger.error(error);
    return res.status(406).send({ message: error.message || ERRORS.SERVER });
  }
};

export const delete_from_cart = async (
  req: express.Request,
  res: express.Response
) => {
  try {
    const currency = req.get("x-currency-id");
    const session_id = req.cookies["session_id"];
    const { product_id, options } = req.body;

    if (!product_id) {
      return res.status(400).json({ message: "Missing product id" }).end();
    }

    if (!session_id) {
      return res.status(400).json({ message: "Missing token" }).end();
    }

    const filter = { session_id: session_id };
    const cart = await CartModel.findOne(filter).lean();

    if (!cart) {
      return res.status(404).json({ message: "Cart not found" }).end();
    }

    const products = remove_cart_item(cart.products, product_id, options);

    const updatedCart = await CartModel.findByIdAndUpdate(
      cart._id,
      {
        products,
      },
      { new: true }
    ).lean();

    const { _id, session_id: removedId, ...rest } = updatedCart;
    const cartData = await getCartData(updatedCart, currency, store);

    return res.status(200).json({ ...rest, ...cartData });
  } catch (error) {
    Logger.error(error);
    return res.status(406).send({ message: error.message || ERRORS.SERVER });
  }
};

const handleNewSession = async (
  req: express.Request,
  res: express.Response
) => {
  const userSession = v4();
  const currency = req.get("x-currency-id");

  const cart = await CartModel.create({
    session_id: userSession,
    products: [],
  });

  const { _id, session_id, ...rest } = cart.toJSON();
  const cartData = await getCartData(cart, currency, store);

  res.cookie("session_id", userSession, {
    httpOnly: true,
    secure: true,
    path: "/",
    sameSite: "none",
    maxAge: 2147483647,
    priority: "high",
  });

  return res.status(200).json({ ...rest, ...cartData });
};

const handleExistingSession = async (
  req: express.Request,
  res: express.Response
) => {
  const currency = req.get("x-currency-id");
  const session_id = req.cookies["session_id"];

  const filter = { session_id: session_id };
  const cart = await CartModel.findOne(filter).lean();

  if (!cart) {
    return await handleNewSession(req, res);
  }

  const { _id, session_id: removedId, ...rest } = cart;
  const cartData = await getCartData(cart, currency, store);

  return res.status(200).json({ ...rest, ...cartData });
};
