import express from "express";
import { isAuthenticated } from "../../middlewares";
import {
  createStoreBranch,
  deleteStoreBranch,
  getBranchById,
  getStoreBranches,
  updateStoreBranch,
} from "../../controllers/store/store_branch";

export default (router: express.Router) => {
  router.get("/api/v1/branches", isAuthenticated, getStoreBranches);
  router.get("/api/v1/branches/:id", isAuthenticated, getBranchById);

  router.post("/api/v1/branches", isAuthenticated, createStoreBranch);

  router.patch("/api/v1/branches/:id", isAuthenticated, updateStoreBranch);

  router.delete("/api/v1/branches", isAuthenticated, deleteStoreBranch);
};
