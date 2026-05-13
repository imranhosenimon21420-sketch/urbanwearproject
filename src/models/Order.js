import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    quantity: { type: Number, required: true, min: 1 },
    size: { type: String, required: true, trim: true },
    color: { type: String, required: true, trim: true },
    /** Snapshot list price at checkout (before line discount if any). */
    unitPrice: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

const shippingAddressSchema = new mongoose.Schema(
  {
    fullName: { type: String, trim: true, required: true },
    line1: { type: String, trim: true, required: true },
    line2: { type: String, trim: true, default: "" },
    city: { type: String, trim: true, required: true },
    state: { type: String, trim: true, default: "" },
    postalCode: { type: String, trim: true, required: true },
    country: { type: String, trim: true, required: true },
    phone: { type: String, trim: true, default: "" },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    items: { type: [orderItemSchema], required: true },
    totalPrice: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      enum: ["pending", "processing", "shipped", "delivered", "cancelled"],
      default: "pending",
    },
    shippingAddress: { type: shippingAddressSchema, required: true },
  },
  { timestamps: true }
);

orderSchema.index({ userId: 1, createdAt: -1 });

export default mongoose.models.Order ?? mongoose.model("Order", orderSchema);
