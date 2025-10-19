import { Request, Response } from "express";
import mongoose from "mongoose";
import User from "../models/User";
import { updatePopularityForUser, updatePopularityForUsers } from "../services/popularity";

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

    await updatePopularityForUser(String(user._id));
    const fresh = await User.findById(user._id);

    return res.status(201).json({ message: "User created", user: fresh });
  } catch (error: any) {
    console.error("createUser error:", error);
    return res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};

export const getAllUsers = async (_req: Request, res: Response) => {
  try {
    const users = await User.find().lean();
    return res.json({ users });
  } catch (error: any) {
    console.error("getAllUsers error:", error);
    return res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};

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

    const userFriendIds = (user.friends || []).map((f: any) => String(f));
    const friendFriendIds = (friend.friends || []).map((f: any) => String(f));

    const alreadyLinked = userFriendIds.includes(String(friend._id)) || friendFriendIds.includes(String(user._id));
    if (alreadyLinked) {
      return res.status(409).json({ message: "Users are already linked (friendship exists)" });
    }

    const friendOid = new mongoose.Types.ObjectId(String(friend._id));
    const userOid = new mongoose.Types.ObjectId(String(user._id));

    user.friends.push(friendOid);
    friend.friends.push(userOid);

    await user.save();
    await friend.save();
    await updatePopularityForUsers([String(user._id), String(friend._id)]);

    const updatedUser = await User.findById(user._id);
    const updatedFriend = await User.findById(friend._id);

    return res.status(200).json({
      message: "Users linked (mutual friendship created)",
      user: updatedUser,
      friend: updatedFriend,
    });
  } catch (error: any) {
    console.error("linkUser error:", error);
    return res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};

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

    const userFriendIds = (user.friends || []).map((f: any) => String(f));
    const friendFriendIds = (friend.friends || []).map((f: any) => String(f));

    const wasLinked = userFriendIds.includes(String(friend._id)) && friendFriendIds.includes(String(user._id));
    if (!wasLinked) {
      return res.status(409).json({ message: "Users are not linked" });
    }

    user.friends = (user.friends || []).filter((f: any) => String(f) !== String(friend._id));
    friend.friends = (friend.friends || []).filter((f: any) => String(f) !== String(user._id));

    await user.save();
    await friend.save();

    await updatePopularityForUsers([String(user._id), String(friend._id)]);

    const updatedUser = await User.findById(user._id);
    const updatedFriend = await User.findById(friend._id);

    return res.status(200).json({
      message: "Users unlinked (friendship removed)",
      user: updatedUser,
      friend: updatedFriend,
    });
  } catch (error: any) {
    console.error("unlinkUser error:", error);
    return res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};

export const updateUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { username, age, hobbies } = req.body;

    if (!mongoose.isValidObjectId(id)) return res.status(400).json({ message: "Invalid user id" });

    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (username !== undefined) {
      if (typeof username !== "string" || username.trim() === "") {
        return res.status(400).json({ message: "username must be a non-empty string" });
      }
      user.username = username.trim();
    }

    if (age !== undefined) {
      if (typeof age !== "number" || age < 0) {
        return res.status(400).json({ message: "age must be a non-negative number" });
      }
      user.age = age;
    }

    if (hobbies !== undefined) {
      if (!Array.isArray(hobbies)) {
        return res.status(400).json({ message: "hobbies must be an array of strings" });
      }
      user.hobbies = hobbies;
    }

    await user.save();

    await updatePopularityForUser(String(user._id));
    const updated = await User.findById(user._id);

    return res.status(200).json({ message: "User updated", user: updated });
  } catch (error: any) {
    console.error("updateUser error:", error);
    return res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};

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
