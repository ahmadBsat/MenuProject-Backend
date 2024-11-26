import mongoose from "mongoose";

export const StoreSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    logo: { type: String, required: true },
    name: { type: String, required: true },
    background_image: { type: String, required: false, default: "" },
    palette: { type: String, required: false, default: "" },
    is_active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const StoreModel = mongoose.model("Store", StoreSchema);
