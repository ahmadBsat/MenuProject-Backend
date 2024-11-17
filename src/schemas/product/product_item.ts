import mongoose from "mongoose";

export const ProductItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Product",
    },
    name: { type: String, required: true },
    image: { type: String, required: true },
    additional_price: { type: Number, required: true },
  },
  { timestamps: true }
);

export const ProductItemModel = mongoose.model(
  "ProductItem",
  ProductItemSchema
);
