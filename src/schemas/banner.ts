import mongoose from "mongoose";

export const BannerSchema = new mongoose.Schema(
  {
    store: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Store",
    },
    branch: [
      {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "StoreBranch",
      },
    ],
    images: [{ type: String, required: true }],
    is_active: { type: Boolean, required: true, default: false },
  },
  { timestamps: true }
);

export const BannerModel = mongoose.model("Banner", BannerSchema);
