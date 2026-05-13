import mongoose from "mongoose";

/** @param {string} param */
export function productLookupFilter(param) {
  const p = param.trim();
  if (mongoose.Types.ObjectId.isValid(p) && String(new mongoose.Types.ObjectId(p)) === p) {
    return { _id: p };
  }
  return { slug: p.toLowerCase() };
}
