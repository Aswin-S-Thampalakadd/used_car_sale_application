import {
  getDealerCarsDB,
  getDealerProfileByIdDB,
  getDealerProfileByUserIdDB,
  updateDealerProfileDB,
} from "./dealers.repository.js";

export const getMyDealerProfileService = async (userId) => {
  const profile = await getDealerProfileByUserIdDB(userId);
  if (!profile) throw new Error("PROFILE_NOT_FOUND");
  return profile;
};

export const getPublicDealerProfileService = async (dealerProfileId) => {
  const profile = await getDealerProfileByIdDB(dealerProfileId);
  if (!profile) throw new Error("PROFILE_NOT_FOUND");
  return profile;
};

export const updateDealerProfileService = async (userId, data) => {
  const allowed = [
    "dealershipName",
    "description",
    "logo",
    "address",
    "city",
    "state",
    "country",
    "pincode",
    "latitude",
    "longitude",
    "gstNumber",
  ];

  const updateData = {};
  for (const key of allowed) {
    if (data[key] !== undefined) updateData[key] = data[key];
  }

  const profile = await updateDealerProfileDB(userId, updateData);
  if (!profile) throw new Error("PROFILE_NOT_FOUND");

  return { message: "Profile updated successfully", profile };
};

export const getMyDealerCarsService = async (userId, status) => {
  return await getDealerCarsDB(userId, status || null);
};
