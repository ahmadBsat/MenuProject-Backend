import express from "express";
import { isAdmin, isAuthenticated } from "../../middlewares";
import {
  createStoreProduct,
  deleteStoreProduct,
  getProductById,
  getProductsByStoreId,
  getStoreProducts,
  updateStoreProduct,
} from "../../controllers/product/product";

export default (router: express.Router) => {
  router.get("/api/v1/products", isAuthenticated, getStoreProducts);
  router.get("/api/v1/products/:id", isAuthenticated, getProductById);

  router.get(
    "/api/v1/admin/products/store/:id",
    isAuthenticated,
    isAdmin,
    getProductsByStoreId
  );

  router.post("/api/v1/products/:id", isAuthenticated, createStoreProduct);

  router.patch("/api/v1/products/:id", isAuthenticated, updateStoreProduct);

  router.delete("/api/v1/products/:id", isAuthenticated, deleteStoreProduct);
};
