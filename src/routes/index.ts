import express from "express";
import upload from "./upload";
import authentication from "./authentication";
import dashboard from "./dashboard";
import store from "./store/store";
import product from "./product/product";
import store_branch from "./store/store_branch";
import user from "./user";
import category from "./category";
import currency from "./currency";

const router = express.Router();

export default (): express.Router => {
  authentication(router);
  dashboard(router);
  upload(router);
  store(router);
  store_branch(router);
  product(router);
  category(router);
  user(router);
  currency(router);

  return router;
};
