import { Request, Response } from "express";
import mongoose from "mongoose";
import User from "../models/User";
import { computePopularityForUser } from "../services/popularity";

//Create user
export const createUser = async (req: Request, res: Response) => {
  try {
    const { username, age, hobbies, friends } = req.body;
    if (!username || typeof username !== "string") {
      return res.status(400).json({ message: "username is required and should be a string" });
    }
    if (age === undefined || typeof age !== "number") {
      return res.status(400).json({ message: "age is required and should be a number" });
    }
    if (!Array.isArray(hobbies)) {
      return res.status(400).json({ message: "hobbies is required and should be an array of strings" });
    }

    const user = new User({
      username: username.trim(),
      age,
      hobbies,
      friends: Array.isArray(friends) ? friends : [],
    });

    await user.save();

    const popularityScore = await computePopularityForUser(user);
    user.popularityScore = popularityScore;
    await user.save();

    return res.status(201).json({ message: "User created", user });
  } catch (error: any) {
    console.error("createUser error:", error);
    return res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};

//GET /api/users
export const getAllUsers = async (_req: Request, res: Response) => {
  try {
    const users = await User.find().lean();
    return res.json({ users });
  } catch (error: any) {
    console.error("getAllUsers error:", error);
    return res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};

//POST /api/users/:id/link
export const linkUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { friendId } = req.body;
    if (!friendId) return res.status(400).json({ message: "friendId is required" });
    if (!mongoose.isValidObjectId(id) || !mongoose.isValidObjectId(friendId)) {
      return res.status(400).json({ message: "Invalid user id(s)" });
    }
    if (id === friendId) return res.status(400).json({ message: "Cannot link user to themselves" });

    const user = await User.findById(id);
    const friend = await User.findById(friendId);
    if (!user || !friend) return res.status(404).json({ message: "User or friend not found" });

    const alreadyLinked = user.friends.some((f) => f.equals(friend._id)) || friend.friends.some((f) => f.equals(user._id));
    if (alreadyLinked) {
      return res.status(409).json({ message: "Users are already linked (friendship exists)" });
    }

//Add mutual connection
    user.friends.push(friend._id);
    friend.friends.push(user._id);

    await user.save();
    await friend.save();

    user.popularityScore = await computePopularityForUser(user);
    friend.popularityScore = await computePopularityForUser(friend);
    await user.save();
    await friend.save();

    return res.status(200).json({ message: "Users linked (mutual friendship created)", user, friend });
  } catch (error: any) {
    console.error("linkUser error:", error);
    return res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};

//DELETE /api/users/:id/unlink
export const unlinkUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { friendId } = req.body;
    if (!friendId) return res.status(400).json({ message: "friendId is required" });
    if (!mongoose.isValidObjectId(id) || !mongoose.isValidObjectId(friendId)) {
      return res.status(400).json({ message: "Invalid user id(s)" });
    }
    if (id === friendId) return res.status(400).json({ message: "Cannot unlink user from themselves" });

    const user = await User.findById(id);
    const friend = await User.findById(friendId);
    if (!user || !friend) return res.status(404).json({ message: "User or friend not found" });

    const wasLinked = user.friends.some((f) => f.equals(friend._id)) && friend.friends.some((f) => f.equals(user._id));
    if (!wasLinked) {
      return res.status(409).json({ message: "Users are not linked" });
    }

    user.friends = user.friends.filter((f) => !f.equals(friend._id));
    friend.friends = friend.friends.filter((f) => !f.equals(user._id));

    await user.save();
    await friend.save();

    user.popularityScore = await computePopularityForUser(user);
    friend.popularityScore = await computePopularityForUser(friend);
    await user.save();
    await friend.save();

    return res.status(200).json({ message: "Users unlinked (friendship removed)", user, friend });
  } catch (error: any) {
    console.error("unlinkUser error:", error);
    return res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};

//DELETE /api/users/:id
export const deleteUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) return res.status(400).json({ message: "Invalid user id" });

    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.friends && user.friends.length > 0) {
      return res.status(409).json({ message: "Cannot delete user while still linked to friends. Unlink first." });
    }

    await User.deleteOne({ _id: user._id });
    return res.status(200).json({ message: "User deleted" });
  } catch (error: any) {
    console.error("deleteUser error:", error);
    return res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};
