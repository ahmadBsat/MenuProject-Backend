import mongoose from "mongoose";

export const CategorySchema = new mongoose.Schema(
  {
    store: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Store",
    },
    name: { type: String, unique: true, required: true, index: true },
    is_active: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const CategoryModel = mongoose.model("Category", CategorySchema);
