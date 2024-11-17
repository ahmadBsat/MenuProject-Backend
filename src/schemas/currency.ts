import mongoose from "mongoose";

export const CurrencySchema = new mongoose.Schema(
  {
    store: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Store",
    },
    name: { type: String, required: true },
    rate_change: { type: Number, required: true },
    // is_active: { type: Boolean, required: true, default: false },
  },
  { timestamps: true }
);

export const CurrencyModel = mongoose.model("Currency", CurrencySchema);
