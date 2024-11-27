import express from "express";
import {
  getAllUsers,
  createUser,
  deleteUserById,
  getUserById,
  updateUserById,
} from "../controllers/user";
import { isAdmin, isAuthenticated } from "../middlewares";

export default (router: express.Router) => {
  router.get("/api/v1/admin/users", isAuthenticated, isAdmin, getAllUsers);
  router.get("/api/v1/admin/users/:id", isAuthenticated, isAdmin, getUserById);
  router.post("/api/v1/admin/users", isAuthenticated, isAdmin, createUser);
  router.patch(
    "/api/v1/admin/users/:id",
    isAuthenticated,
    isAdmin,
    updateUserById
  );
  router.delete(
    "/api/v1/admin/users/:id",
    isAuthenticated,
    isAdmin,
    deleteUserById
  );
};
