import express from "express";
import { isAuthenticated } from "../middlewares";
import { uploadMutler } from "../middlewares/upload";
import { delete_file, upload_files } from "../controllers/upload";

export default (router: express.Router) => {
  router.post(
    "/api/v1/upload",
    uploadMutler.array("files", 8),
    isAuthenticated,
    upload_files
  );
  router.post("/api/v1/upload/remove", isAuthenticated, delete_file);
};
