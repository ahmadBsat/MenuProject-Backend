import express from "express";
import { isAdmin, isAuthenticated } from "../../middlewares";
import {
  getAllStores,
  getStoreById,
  getUserStore,
  createStoreAdmin,
  deleteStoreAdmin,
  updateStoreAdmin,
  updateStoreUser,
} from "../../controllers/store/store";

export default (router: express.Router) => {
  router.get("/api/v1/store", isAuthenticated, getUserStore);
  router.get("/api/v1/admin/store", isAuthenticated, isAdmin, getAllStores);
  router.get("/api/v1/admin/store/:id", isAuthenticated, isAdmin, getStoreById);

  router.post(
    "/api/v1/admin/store",
    isAuthenticated,
    isAdmin,
    createStoreAdmin
  );

  router.patch("/api/v1/store", isAuthenticated, updateStoreUser);
  router.patch(
    "/api/v1/admin/store/:id",
    isAuthenticated,
    isAdmin,
    updateStoreAdmin
  );

  router.delete(
    "/api/v1/admin/store",
    isAuthenticated,
    isAdmin,
    deleteStoreAdmin
  );
};
