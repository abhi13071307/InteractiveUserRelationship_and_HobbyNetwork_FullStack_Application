import mongoose, { Document, Schema } from "mongoose";

export interface IUser extends Document {
  username: string;
  age: number;
  hobbies: string[];
  friends: mongoose.Types.ObjectId[]; 
  createdAt: Date;
  popularityScore: number;
}

const UserSchema = new Schema<IUser>(
  {
    username: { type: String, required: true, trim: true },
    age: { type: Number, required: true, min: 0 },
    hobbies: { type: [String], required: true, default: [] },
    friends: { type: [Schema.Types.ObjectId], ref: "User", default: [] },
    createdAt: { type: Date, default: () => new Date() },
    popularityScore: { type: Number, default: 0 },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

UserSchema.index({ username: 1 });

const User = mongoose.model<IUser>("User", UserSchema);
export default User;
