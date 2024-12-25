import express from "express";
import { add_to_cart, delete_from_cart, get_cart } from "../controllers/cart";

export default (router: express.Router) => {
  router.get("/api/v1/cart/:store", get_cart);
  router.patch("/api/v1/cart/add", add_to_cart);
  router.patch("/api/v1/cart/remove", delete_from_cart);
};
