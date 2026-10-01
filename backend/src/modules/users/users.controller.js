import { getUserByIdDB, updateUserDB } from "./users.repository.js";

export const getMyProfile = async (req, res) => {
  try {
    const user = await getUserByIdDB(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    return res.json(user);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to fetch profile" });
  }
};

export const updateMyProfile = async (req, res) => {
  try {
    const { name, phone, profileImage } = req.body;
    const user = await updateUserDB(req.user.userId, {
      name,
      phone,
      profileImage,
    });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    return res.json({ message: "Profile updated successfully", user });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to update profile" });
  }
};
