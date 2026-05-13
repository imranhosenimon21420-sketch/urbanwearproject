import mongoose from "mongoose";

const variantSchema = new mongoose.Schema(
  {
    size: { type: String, required: true, trim: true },
    color: { type: String, required: true, trim: true },
    stock: { type: Number, required: true, min: 0, default: 0 },
  },
  { _id: false }
);

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    category: {
      type: String,
      required: true,
      enum: ["Men", "Women", "Streetwear", "Accessories"],
    },
    price: { type: Number, required: true, min: 0 },
    /** Percent off list price (0–100). */
    discount: { type: Number, min: 0, max: 100, default: 0 },
    variants: { type: [variantSchema], default: [] },
    images: [{ type: String, trim: true }],
    description: { type: String, default: "" },
  },
  { timestamps: true }
);

productSchema.index({ category: 1, createdAt: -1 });
productSchema.index({ "variants.size": 1, "variants.color": 1 });

export default mongoose.models.Product ?? mongoose.model("Product", productSchema);
