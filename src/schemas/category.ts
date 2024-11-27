import mongoose from "mongoose";

export const CategorySchema = new mongoose.Schema(
  {
    name: { type: String, unique: true, required: true, index: true },
    is_active: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const CategoryModel = mongoose.model("Category", CategorySchema);
