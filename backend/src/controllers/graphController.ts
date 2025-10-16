import { Request, Response } from "express";
import User from "../models/User";

export const getGraphData = async (_req: Request, res: Response) => {
  try {
    const users = await User.find().lean();

    const nodes = users.map((user) => ({
      id: user._id.toString(),
      label: `${user.username} (${user.age})`,
      popularityScore: user.popularityScore,
    }));

    const edges: { source: string; target: string }[] = [];
    const seen = new Set<string>();

    for (const user of users) {
      for (const friendId of user.friends) {
        const key = [user._id.toString(), friendId.toString()].sort().join("-");
        if (!seen.has(key)) {
          edges.push({ source: user._id.toString(), target: friendId.toString() });
          seen.add(key);
        }
      }
    }

    res.json({ nodes, edges });
  } catch (error: any) {
    console.error("getGraphData error:", error);
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};
