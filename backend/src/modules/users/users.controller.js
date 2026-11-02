import { AppError } from "../../utils/AppError.js";
import { getUserByIdDB, updateUserDB } from "./users.repository.js";

export const getMyProfile = async (req, res) => {
  const user = await getUserByIdDB(req.user.userId);
  if (!user) {
    throw new AppError(404, "User not found");
  }
  return res.json(user);
};

export const updateMyProfile = async (req, res) => {
  const { name, phone, profileImage } = req.body;
  const user = await updateUserDB(req.user.userId, {
    name,
    phone,
    profileImage,
  });
  if (!user) {
    throw new AppError(404, "User not found");
  }
  return res.json({ message: "Profile updated successfully", user });
};
