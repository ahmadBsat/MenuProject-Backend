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
    is_default: { type: Boolean, required: true },
    is_active: { type: Boolean, required: true },
  },
  { timestamps: true }
);

// Ensure only one currency per store can be default
CurrencySchema.index(
  { store: 1, is_default: 1 },
  { unique: true, partialFilterExpression: { is_default: true } }
);

export const CurrencyModel = mongoose.model("Currency", CurrencySchema);
