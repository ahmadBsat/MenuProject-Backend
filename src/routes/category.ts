import express from "express";
import { isAuthenticated } from "../middlewares";
import {
  createStoreCategory,
  deleteStoreCategory,
  getCategoryById,
  getStoreCategoryes,
  updateStoreCategory,
} from "../controllers/category";

export default (router: express.Router) => {
  router.get("/api/v1/categories", isAuthenticated, getStoreCategoryes);
  router.get("/api/v1/categories/:id", isAuthenticated, getCategoryById);
  router.post("/api/v1/categories", isAuthenticated, createStoreCategory);
  router.patch("/api/v1/categories/:id", isAuthenticated, updateStoreCategory);
  router.delete("/api/v1/categories/:id", isAuthenticated, deleteStoreCategory);
};
