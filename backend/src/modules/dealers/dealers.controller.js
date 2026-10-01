import {
  getMyDealerCarsService,
  getMyDealerProfileService,
  getPublicDealerProfileService,
  updateDealerProfileService,
} from "./dealers.service.js";

export const getMyDealerProfile = async (req, res) => {
  try {
    const profile = await getMyDealerProfileService(req.user.userId);
    return res.json(profile);
  } catch (error) {
    if (error.message === "PROFILE_NOT_FOUND") {
      return res.status(404).json({ message: "Dealer profile not found" });
    }
    console.error(error);
    return res.status(500).json({ message: "Failed to fetch dealer profile" });
  }
};

export const getPublicDealerProfile = async (req, res) => {
  try {
    const dealerProfileId = Number(req.params.id);
    if (isNaN(dealerProfileId)) {
      return res.status(400).json({ message: "Invalid dealer ID" });
    }
    const profile = await getPublicDealerProfileService(dealerProfileId);
    return res.json(profile);
  } catch (error) {
    if (error.message === "PROFILE_NOT_FOUND") {
      return res.status(404).json({ message: "Dealer not found" });
    }
    console.error(error);
    return res.status(500).json({ message: "Failed to fetch dealer" });
  }
};

export const updateDealerProfile = async (req, res) => {
  try {
    const result = await updateDealerProfileService(req.user.userId, req.body);
    return res.json(result);
  } catch (error) {
    if (error.message === "PROFILE_NOT_FOUND") {
      return res.status(404).json({ message: "Dealer profile not found" });
    }
    console.error(error);
    return res.status(500).json({ message: "Failed to update profile" });
  }
};

export const getMyDealerCars = async (req, res) => {
  try {
    const { status } = req.query;
    const cars = await getMyDealerCarsService(req.user.userId, status);
    return res.json({ cars });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to fetch cars" });
  }
};
