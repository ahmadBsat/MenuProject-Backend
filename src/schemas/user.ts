import mongoose from "mongoose";

export const UserSchema = new mongoose.Schema(
  {
    firstname: { type: String, required: true },
    lastname: { type: String, required: false, default: "" },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: false, default: "" },
    is_archived: { type: Boolean, required: false, default: false },
    is_active: { type: Boolean, required: false, default: true },
    is_super_admin: { type: Boolean, required: false, default: false },
    role: { type: String, required: true },
    authentication: {
      recovery_token: { type: String, default: "" },
      recovery_sent_at: { type: String, default: "" },
      password: { type: String, required: true },
    },
  },
  { timestamps: true }
);

export const UserModel = mongoose.model("User", UserSchema);
