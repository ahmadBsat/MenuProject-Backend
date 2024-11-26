import express from "express";
import { getAllUsers } from "../controllers/user";
import { isAdmin, isAuthenticated } from "../middlewares";

export default (router: express.Router) => {
  router.get("/api/v1/admin/users", isAuthenticated, isAdmin, getAllUsers);
};
