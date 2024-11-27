import mongoose from "mongoose";

export const StoreBranchSchema = new mongoose.Schema(
  {
    store: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Store",
    },
    name: { type: String, required: true },
    address: { type: String, default: "" },
    phone_number: { type: String, required: true },
  },
  { timestamps: true }
);

export const StoreBranchModel = mongoose.model(
  "StoreBranch",
  StoreBranchSchema
);
