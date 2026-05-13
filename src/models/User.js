import mongoose from "mongoose";

const addressSchema = new mongoose.Schema(
  {
    label: { type: String, trim: true, default: "Home" },
    fullName: { type: String, trim: true, required: true },
    line1: { type: String, trim: true, required: true },
    line2: { type: String, trim: true, default: "" },
    city: { type: String, trim: true, required: true },
    state: { type: String, trim: true, default: "" },
    postalCode: { type: String, trim: true, required: true },
    country: { type: String, trim: true, required: true },
    phone: { type: String, trim: true, default: "" },
  },
  { _id: true }
);

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: { type: String, required: true, select: false },
    name: { type: String, required: true, trim: true },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],
    addresses: [addressSchema],
  },
  { timestamps: true }
);

export default mongoose.models.User ?? mongoose.model("User", userSchema);
