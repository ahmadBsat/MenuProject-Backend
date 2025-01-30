import express from "express";
import { isAuthenticated } from "../middlewares";
import {
  getBannerById,
  getStoreBanners,
  createStoreBanner,
  updateStoreBanner,
  deleteStoreBanner,
} from "../controllers/banner";

export default (router: express.Router) => {
  router.get("/api/v1/banners", isAuthenticated, getStoreBanners);
  router.get("/api/v1/banners/:id", isAuthenticated, getBannerById);
  router.post("/api/v1/banners", isAuthenticated, createStoreBanner);
  router.patch("/api/v1/banners/:id", isAuthenticated, updateStoreBanner);
  router.delete("/api/v1/banners/:id", isAuthenticated, deleteStoreBanner);
};
