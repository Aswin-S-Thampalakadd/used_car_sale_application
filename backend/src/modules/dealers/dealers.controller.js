import { AppError } from "../../utils/AppError.js";
import {
  getMyDealerCarsService,
  getMyDealerProfileService,
  getPublicDealerProfileService,
  updateDealerProfileService,
} from "./dealers.service.js";

export const getMyDealerProfile = async (req, res) => {
  const profile = await getMyDealerProfileService(req.user.userId);
  return res.json(profile);
};

export const getPublicDealerProfile = async (req, res) => {
  const dealerProfileId = Number(req.params.id);
  if (isNaN(dealerProfileId)) {
    throw new AppError(400, "Invalid dealer ID");
  }
  const profile = await getPublicDealerProfileService(dealerProfileId);
  return res.json(profile);
};

export const updateDealerProfile = async (req, res) => {
  const result = await updateDealerProfileService(req.user.userId, req.body);
  return res.json(result);
};

export const getMyDealerCars = async (req, res) => {
  const { status } = req.query;
  const cars = await getMyDealerCarsService(req.user.userId, status);
  return res.json({ cars });
};
