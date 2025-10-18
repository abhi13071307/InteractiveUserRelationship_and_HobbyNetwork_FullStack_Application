import { Request, Response } from "express";
import mongoose from "mongoose";
import User from "../models/User";
import { updatePopularityForUsers } from "../services/popularity";

export const addHobbyToUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { hobby } = req.body;

    if (!hobby || typeof hobby !== "string") {
      return res.status(400).json({ message: "hobby is required and must be a string" });
    }
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid user id" });
    }

    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const normalized = hobby.trim().toLowerCase();
    const existing = (user.hobbies || []).map((h) => h.toLowerCase());
    if (existing.includes(normalized)) {
      return res.status(409).json({ message: "User already has this hobby" });
    }

    user.hobbies.push(hobby.trim());
    await user.save();

    const toUpdate = [user._id, ...(user.friends || [])];
    await updatePopularityForUsers(toUpdate);

    const updated = await User.findById(user._id);
    return res.status(200).json({ message: "Hobby added", user: updated });
  } catch (err: any) {
    console.error("addHobbyToUser error:", err);
    return res.status(500).json({ message: "Internal Server Error", error: err.message });
  }
};

export const removeHobbyFromUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { hobby } = req.body;

    if (!hobby || typeof hobby !== "string") {
      return res.status(400).json({ message: "hobby is required and must be a string" });
    }
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid user id" });
    }

    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const before = user.hobbies.length;
    user.hobbies = user.hobbies.filter((h) => h.toLowerCase() !== hobby.trim().toLowerCase());

    if (user.hobbies.length === before) {
      return res.status(404).json({ message: "Hobby not found in user's list" });
    }

    await user.save();

    const toUpdate = [user._id, ...(user.friends || [])];
    await updatePopularityForUsers(toUpdate);

    const updated = await User.findById(user._id);
    return res.status(200).json({ message: "Hobby removed", user: updated });
  } catch (err: any) {
    console.error("removeHobbyFromUser error:", err);
    return res.status(500).json({ message: "Internal Server Error", error: err.message });
  }
};
