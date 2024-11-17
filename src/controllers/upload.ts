import express from "express";
import mongoose from "mongoose";
import { deleteFile } from "../config/aws";
import { Logger } from "../entities/logger";
import { handleUpload } from "../config/aws";
import { extractKeyFromUrl } from "../utils/common";

export const upload_files = async (
  req: express.Request,
  res: express.Response
) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { type } = req.body;
    let files = req.files as Express.Multer.File[];

    if (!type) {
      await session.abortTransaction();
      return res.status(400).json({ message: "Type is required for upload" });
    }

    const created_files = await handleFiles(files, type);

    await session.commitTransaction();
    return res.status(200).json({ files: created_files }).end();
  } catch (error) {
    Logger.error(error);
    await session.abortTransaction();
    return res.status(406).send({ message: "File upload failed" });
  } finally {
    session.endSession();
  }
};

export const delete_file = async (
  req: express.Request,
  res: express.Response
) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { file } = req.body;

    await deleteFile(extractKeyFromUrl(file));

    await session.commitTransaction();
    return res
      .status(200)
      .json({ success: true, status: 200, message: "File deleted" })
      .end();
  } catch (error) {
    Logger.error(error);
    await session.abortTransaction();
    return res.status(406).send({ message: "File upload failed" });
  } finally {
    session.endSession();
  }
};

const handleFiles = async (files: Express.Multer.File[], type: string) => {
  if (!files || files.length === 0) return [];

  const uploaded_files = await handleUpload(files, type);

  return uploaded_files;
};
