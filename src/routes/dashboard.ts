import express from "express";
import { health, traefik_config } from "../controllers/dashboard";
// import { isAuthenticated } from "../middlewares";

export default (router: express.Router) => {
  router.get("/", health);
  router.get("/api/v1/traefik-config", traefik_config);
};
