import mongoose from "mongoose";
import User from "../models/User";

export const computePopularityForUserId = async (userId: string | mongoose.Types.ObjectId) => {
  const uid = typeof userId === "string" ? new mongoose.Types.ObjectId(userId) : userId;
  const user = await User.findById(uid).lean();
  if (!user) return 0;

  const friendIds = (user.friends || []).map((f: any) => f.toString());
  const uniqueFriendsCount = new Set(friendIds).size;

  if (uniqueFriendsCount === 0) return 0;

  const friends = await User.find({ _id: { $in: friendIds } }).select("hobbies").lean();
  const userHobbySet = new Set((user.hobbies || []).map((h: string) => h.toLowerCase()));

  let totalSharedHobbies = 0;
  for (const f of friends) {
    const friendHobbies = (f.hobbies || []).map((h: string) => h.toLowerCase());
    const shared = friendHobbies.filter((h) => userHobbySet.has(h)).length;
    totalSharedHobbies += shared;
  }

  const score = uniqueFriendsCount + totalSharedHobbies * 0.5;
  return Math.round(score * 100) / 100;
};

export const updatePopularityForUser = async (userId: string | mongoose.Types.ObjectId) => {
  const score = await computePopularityForUserId(userId);
  await User.findByIdAndUpdate(userId, { popularityScore: score }, { new: true });
  return score;
};

export const updatePopularityForUsers = async (userIds: Array<string | mongoose.Types.ObjectId>) => {
  const unique = Array.from(new Set(userIds.map((id) => id.toString())));
  const results: { id: string; score: number }[] = [];
  for (const id of unique) {
    const s = await updatePopularityForUser(id);
    results.push({ id: id.toString(), score: s });
  }
  return results;
};
