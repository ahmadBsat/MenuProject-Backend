import express from "express";
import { isAuthenticated } from "../../middlewares";
import {
  createStoreProductItem,
  deleteStoreProductItem,
  getProductItemById,
  getStoreProductItems,
  updateStoreProductItem,
} from "../../controllers/product/product_item";

export default (router: express.Router) => {
  router.get("/api/v1/items", isAuthenticated, getStoreProductItems);
  router.get("/api/v1/items/:id", isAuthenticated, getProductItemById);
  router.post("/api/v1/items", isAuthenticated, createStoreProductItem);
  router.patch("/api/v1/items/:id", isAuthenticated, updateStoreProductItem);
  router.delete("/api/v1/items/:id", isAuthenticated, deleteStoreProductItem);
};
