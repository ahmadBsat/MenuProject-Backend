import express from "express";
import upload from "./upload";
import authentication from "./authentication";
import dashboard from "./dashboard";
import store from "./store/store";
import product from "./product/product";
import store_branch from "./store/store_branch";
import user from "./user";
import category from "./category";
import banner from "./banner";
import currency from "./currency";
import product_items from "./product/product_items";
import cart from "./cart";

const router = express.Router();

export default (): express.Router => {
  authentication(router);
  dashboard(router);
  upload(router);
  store(router);
  store_branch(router);
  product(router);
  product_items(router);
  category(router);
  user(router);
  currency(router);
  cart(router);
  banner(router);

  return router;
};
