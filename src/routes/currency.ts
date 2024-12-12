import express from "express";
import { isAuthenticated } from "../middlewares";
import {
  createStoreCurrency,
  deleteStoreCurrency,
  getCurrencyById,
  getStoreCurrencies,
  updateStoreCurrency,
} from "../controllers/currency";

export default (router: express.Router) => {
  router.get("/api/v1/currencies", isAuthenticated, getStoreCurrencies);
  router.get("/api/v1/currencies/:id", isAuthenticated, getCurrencyById);
  router.post("/api/v1/currencies", isAuthenticated, createStoreCurrency);
  router.patch("/api/v1/currencies/:id", isAuthenticated, updateStoreCurrency);
  router.delete("/api/v1/currencies/:id", isAuthenticated, deleteStoreCurrency);
};
