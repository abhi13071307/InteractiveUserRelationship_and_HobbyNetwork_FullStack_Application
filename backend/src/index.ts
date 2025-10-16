import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db";
import userRoutes from "./routes/userRoutes";
import graphRoutes from "./routes/graphRoutes";

dotenv.config();

console.log("Loaded MONGO_URI:", process.env.MONGO_URI);
process.on("uncaughtException", (err) => {
  console.error("uncaughtException", err);
});
process.on("unhandledRejection", (err) => {
  console.error("unhandledRejection", err);
});

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/users", userRoutes);
app.use("/api/graph", graphRoutes);
app.get("/api/health", (_, res) => res.json({ status: "ok", time: new Date() }));

const start = async () => {
  await connectDB(process.env.MONGO_URI); 
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Backend running on http://localhost:${PORT}`);
  });
};

start().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
