import mongoose from "mongoose";

const connectDB = async (uri?: string) => {
  const mongoUri = uri || process.env.MONGO_URI;
  if (!mongoUri) {
    console.error("MongoDB connection failed: MONGO_URI is missing");
    process.exit(1);
  }

  try {
    const conn = await mongoose.connect(mongoUri);
    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error("MongoDB connection failed:", error);
    process.exit(1);
  }
};

export default connectDB;
