import mongoose from "mongoose";

function getMongoUri() {
  const raw = process.env.MONGODB_URI;
  if (!raw) {
    throw new Error(
      "Please define the MONGODB_URI environment variable inside .env.local"
    );
  }
  // Trim and strip accidental quotes from editor paste
  return raw.trim().replace(/^["']|["']$/g, "");
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
          "Edit → reset password → copy the new connection string into .env.local as MONGODB_URI. " +
          "If the password contains @ : / ? # [ ] etc., URL-encode it in the URI (or use Atlas “Connect” which encodes it)."
      );
    }
    throw e;
  }

  return cached.conn;
}
