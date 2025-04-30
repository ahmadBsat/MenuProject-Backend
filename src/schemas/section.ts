import mongoose from "mongoose";

export const SectionSchema = new mongoose.Schema(
  {
    store: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Store",
    },
    name: { type: String, required: true },
    order: { type: Number, required: true, default: 1 },
    is_active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const SectionModel = mongoose.model("Section", SectionSchema);