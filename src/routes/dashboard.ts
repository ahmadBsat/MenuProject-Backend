import express from "express";
import { health } from "../controllers/dashboard";
// import { isAuthenticated } from "../middlewares";

export default (router: express.Router) => {
  router.get("/", health);
};
