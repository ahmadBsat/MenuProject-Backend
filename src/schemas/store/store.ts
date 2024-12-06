import mongoose from "mongoose";

export const StoreSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    logo: { type: String, default: "" },
    name: { type: String, required: true },
    domain: { type: String, required: true },
    palette: { type: String, required: false, default: "" },
    background_image: { type: String, required: false, default: "" },
    renewal_date: { type: Date, required: false },
    renewal_cost: { type: Number, required: true },
    is_active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const StoreModel = mongoose.model("Store", StoreSchema);
