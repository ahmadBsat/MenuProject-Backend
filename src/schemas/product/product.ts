import mongoose from "mongoose";

export const ProductSchema = new mongoose.Schema(
  {
    store: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Store",
    },
    branch: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "StoreBranch",
    },
    name: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    images: [{ type: String, required: true }],
    is_active: { type: Boolean, required: true, default: false },
  },
  { timestamps: true }
);

export const ProductModel = mongoose.model("Product", ProductSchema);
