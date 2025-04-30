import express from "express";
import { isAuthenticated } from "../middlewares";
import {
  createStoreSection,
  deleteStoreSection,
  getStoreSectionById,
  getStoreSections,
  updateStoreSection,
} from "../controllers/section";

export default (router: express.Router) => {
  router.get("/api/v1/sections/:id", isAuthenticated, getStoreSectionById);
  router.get("/api/v1/sections", isAuthenticated, getStoreSections);
  router.post("/api/v1/sections", isAuthenticated, createStoreSection);
  router.patch("/api/v1/sections/:id", isAuthenticated, updateStoreSection);
  router.delete("/api/v1/sections/:id", isAuthenticated, deleteStoreSection);
};
