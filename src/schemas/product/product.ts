import mongoose from "mongoose";

export const AdditionSchema = new mongoose.Schema(
  {
    group: { type: String, required: true },
    name: { type: String, required: true },
    item: [
      {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "ProductItem",
      },
    ],
    is_multiple: { type: Boolean, default: false },
  },
  { _id: false }
);

export const ProductSchema = new mongoose.Schema(
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
    name: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    images: [{ type: String, required: true }],
    additions: [AdditionSchema],
    category: [
      {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "Category",
      },
    ],
    is_active: { type: Boolean, required: true, default: false },
  },
  { timestamps: true }
);

export const ProductModel = mongoose.model("Product", ProductSchema);
