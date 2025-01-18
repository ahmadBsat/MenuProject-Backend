import express from "express";
import {
  add_to_cart,
  delete_from_cart,
  get_cart,
  reset_cart,
  update_cart_products,
} from "../controllers/cart";

export default (router: express.Router) => {
  router.get("/api/v1/cart/:store", get_cart);
  router.post("/api/v1/cart/reset", reset_cart);
  router.patch("/api/v1/cart/add", add_to_cart);
  router.patch("/api/v1/cart/update", update_cart_products);
  router.patch("/api/v1/cart/remove", delete_from_cart);
};
