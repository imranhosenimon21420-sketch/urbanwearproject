import mongoose from "mongoose";

const MONGODB_URI =
  "mongodb+srv://masumparvezcc_db_user:wMyZRekwfFgY505B@cluster0.yb3v7u1.mongodb.net/urbanwear?retryWrites=true&w=majority&appName=Cluster0";

function getMongoUri() {
  return MONGODB_URI.trim().replace(/^["']|["']$/g, "");
}

/**
 * Cached connection for Next.js hot reload / serverless invocations.
 * @see https://mongoosejs.com/docs/lambda.html
 */
let cached = globalThis.mongoose;

if (!cached) {
  cached = globalThis.mongoose = { conn: null, promise: null };
}

export async function connectDB() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(getMongoUri(), opts).then((m) => m);
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    const msg = String(e?.message ?? e);
    if (msg.includes("bad auth") || e?.code === 8000) {
      throw new Error(
        "MongoDB authentication failed (bad auth). In Atlas: Database Access → your user → " +
          "Edit → reset password → update MONGODB_URI in src/lib/mongodb.js. " +
          "If the password contains @ : / ? # [ ] etc., URL-encode it in the URI (or use Atlas “Connect” which encodes it)."
      );
    }
    throw e;
  }

  return cached.conn;
}
