import mongoose from "mongoose";

export const CartItemSchema = new mongoose.Schema(
  {
    product_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Product",
    },
    product_additions: [
      {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "ProductItem",
      },
    ],
    quantity: { type: Number, required: true },
    instructions: { type: String, required: false, default: "" },
  },
  { _id: false }
);

export const CartSchema = new mongoose.Schema(
  {
    session_id: { type: String, required: true },
    store: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Store",
    },
    products: [CartItemSchema],
  },
  { timestamps: true }
);

export const CartModel = mongoose.model("Cart", CartSchema);
