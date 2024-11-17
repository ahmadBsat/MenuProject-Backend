import express from "express";
import {
  change_password,
  forgot_password,
  login,
  register,
  reset_user_password,
  validate,
} from "../controllers/authentication";
import { isAuthenticated } from "../middlewares";

export default (router: express.Router) => {
  router.get("/api/v1/auth/validate", validate);

  router.post("/api/v1/auth/register", register);
  router.post("/api/v1/auth/login", login);
  router.post("/api/v1/auth/change/password", isAuthenticated, change_password);
  router.post("/api/v1/auth/forgot/password", forgot_password);
  router.post("/api/v1/auth/reset/password", reset_user_password);
};
