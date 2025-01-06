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
    palette: {
      color: { type: String, required: false, default: "black" },
      border: { type: String, required: false, default: "" },
      background: { type: String, required: false, default: "white" },
      header_background: { type: String, required: false, default: "black" },
      header_text_color: { type: String, required: false, default: "white" },
      price_color: { type: String, required: false, default: "white" },
      primary: { type: String, required: false, default: "#a41f13" },
    },
    background_image: { type: String, required: false, default: "" },
    renewal_date: { type: Date, required: false },
    renewal_cost: { type: Number, required: true },
    is_active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const StoreModel = mongoose.model("Store", StoreSchema);
