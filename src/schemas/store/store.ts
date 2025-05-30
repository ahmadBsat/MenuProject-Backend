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
    custom_domain: { type: String, required: false },
    store_label: { type: String, required: false },
    palette: {
      color: { type: String, required: false, default: "black" },
      border: { type: String, required: false, default: "" },
      background: { type: String, required: false, default: "white" },
      header_background: { type: String, required: false, default: "black" },
      header_text_color: { type: String, required: false, default: "white" },
      price_color: { type: String, required: false, default: "white" },
      primary: { type: String, required: false, default: "#a41f13" },
      checkout_background: { type: String, required: false, default: "white" },
      checkout_content: { type: String, required: false, default: "white" },
      category_color:{ type: String, required: false, default: "white" },
      category_background:{ type: String, required: false, default: "white" },
      clear_button_color:{ type: String, required: false, default: "white" },
      clear_button_background:{ type: String, required: false, default: "white" },
      section_color:{ type: String, required: false, default: "white" },
      section_background:{ type: String, required: false, default: "white" },
      active_section_color:{ type: String, required: false, default: "white" },
      active_section_background:{ type: String, required: false, default: "white" },
    },
    settings: { display_pricing: { type: Boolean, default: true } },
    background_image: { type: String, required: false, default: "" },
    renewal_date: { type: Date, required: false },
    renewal_cost: { type: Number, required: true },
    watermark: { type: Boolean, default: true },
    logoDefault: { type: Boolean, default: true },
    use_sections: { type: Boolean, default: true },
    vat_exclusive: { type: Boolean, default: false },
    vat_percentage: { type: Number, required: false },
    is_active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const StoreModel = mongoose.model("Store", StoreSchema);
