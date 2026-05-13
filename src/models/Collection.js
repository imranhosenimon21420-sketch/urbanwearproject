import mongoose from "mongoose";

const collectionSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    products: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],
    season: { type: String, trim: true, default: "" },
  },
  { timestamps: true }
);

export default mongoose.models.Collection ?? mongoose.model("Collection", collectionSchema);
