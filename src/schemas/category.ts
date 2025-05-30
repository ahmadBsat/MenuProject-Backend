import mongoose from "mongoose";

export const CategorySchema = new mongoose.Schema(
  {
    store: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Store",
    },
    section: [
      {
        type: mongoose.Schema.Types.ObjectId,
        required: false,
        ref: "Section",
      },
    ],
    name: { type: String, required: true },
    order: { type: Number, required: true, default: 1 },
    is_active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const CategoryModel = mongoose.model("Category", CategorySchema);
