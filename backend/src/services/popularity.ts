import User, { IUser } from "../models/User";
import mongoose from "mongoose";

//Compute popularity score:
 //popularityScore = number of unique friends + (total hobbies shared with friends * 0.5)
export const computePopularityForUser = async (user: IUser | mongoose.Types.ObjectId) => {
  const userDoc = (user instanceof mongoose.Types.ObjectId) ? await User.findById(user) : user;
  if (!userDoc) throw new Error("User not found while computing popularity");

  const friendIds = userDoc.friends ?? [];
  const uniqueFriendsCount = friendIds.length;

  if (uniqueFriendsCount === 0) {
    return uniqueFriendsCount; 
  }

  const friends = await User.find({ _id: { $in: friendIds } }).select("hobbies");
  let totalSharedHobbies = 0;

  const userHobbiesSet = new Set((userDoc.hobbies || []).map(h => h.toLowerCase()));

  for (const f of friends) {
    const friendHobbies = (f.hobbies || []).map(h => h.toLowerCase());
    const shared = friendHobbies.filter(h => userHobbiesSet.has(h)).length;
    totalSharedHobbies += shared;
  }

  const score = uniqueFriendsCount + totalSharedHobbies * 0.5;
  return Math.round(score * 100) / 100;
};
