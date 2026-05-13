import Collection from "@/models/Collection";
import Product from "@/models/Product";
import { connectDB } from "@/lib/mongodb";

export async function getHomeCatalog() {
  await connectDB();

  const [latestCollection, trending, offers] = await Promise.all([
    Collection.findOne()
      .sort({ createdAt: -1 })
      .populate({
        path: "products",
        select: "name slug price discount images category variants",
      })
      .lean(),
    Product.find()
      .sort({ createdAt: -1 })
      .limit(8)
      .select("name slug price discount images category variants")
      .lean(),
    Product.find({ discount: { $gt: 0 } })
      .sort({ createdAt: -1 })
      .limit(4)
      .select("name slug price discount images category variants")
      .lean(),
  ]);

  return { latestCollection, trending, offers };
}
