import mongoose from "mongoose";

export const ProductItemSchema = new mongoose.Schema(
  {
    store: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Store",
    },
    name: { type: String, required: true },
    image: { type: String, required: false, default: "" },
    additional_price: { type: Number, required: true, default: 0 },
  },
  { timestamps: true }
);

export const ProductItemModel = mongoose.model(
  "ProductItem",
  ProductItemSchema
);
