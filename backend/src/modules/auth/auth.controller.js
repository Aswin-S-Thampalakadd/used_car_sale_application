import { AppError } from "../../utils/AppError.js";
import {
  customerSignupService,
  customerLoginService,
  dealerSignupService,
  dealerLoginService,
  customerGoogleSignInService,
  dealerGoogleSignInService,
  operatorLoginService,
  refreshAccessTokenService,
  logoutService,
  deactivateAccountService,
  activateAccountService,
  deleteAccountService,
} from "./auth.service.js";

export const customerSignup = async (req, res) => {
  const { name, email, phone, password } = req.body;

  if (!name || !email || !password) {
    throw new AppError(400, "Name, email and password are required");
  }

  const result = await customerSignupService({ name, email, phone, password });

  return res.status(201).json(result);
};

export const customerLogin = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new AppError(400, "Email and password are required");
  }

  const result = await customerLoginService({ email, password });

  return res.json(result);
};

export const dealerSignup = async (req, res) => {
  const {
    name,
    email,
    phone,
    password,
    dealershipName,
    description,
    logo,
    address,
    city,
    state,
    country,
    pincode,
    latitude,
    longitude,
    gstNumber,
  } = req.body;

  if (!name || !email || !password || !dealershipName) {
    throw new AppError(
      400,
      "Name, email, password and dealership name are required",
    );
  }

  const result = await dealerSignupService({
    name,
    email,
    phone,
    password,
    dealershipName,
    description,
    logo,
    address,
    city,
    state,
    country,
    pincode,
    latitude,
    longitude,
    gstNumber,
  });

  return res.status(201).json(result);
};

export const dealerLogin = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new AppError(400, "Email and password are required");
  }

  const result = await dealerLoginService({ email, password });

  return res.json(result);
};

export const customerGoogleSignIn = async (req, res) => {
  const { idToken } = req.body;

  if (!idToken) {
    throw new AppError(400, "Firebase ID token is required");
  }

  const result = await customerGoogleSignInService({ idToken });

  return res.json(result);
};

export const dealerGoogleSignIn = async (req, res) => {
  const { idToken, dealershipName } = req.body;

  if (!idToken) {
    throw new AppError(400, "Firebase ID token is required");
  }

  const result = await dealerGoogleSignInService({ idToken, dealershipName });

  return res.json(result);
};

export const refreshAccessToken = async (req, res) => {
  const { refreshToken } = req.body;

  const result = await refreshAccessTokenService(refreshToken);

  return res.json(result);
};

export const logout = async (req, res) => {
  const { refreshToken } = req.body;

  const result = await logoutService(refreshToken);

  return res.json(result);
};

export const deactivateAccount = async (req, res) => {
  const userId = req.user.userId;

  const result = await deactivateAccountService(userId);

  return res.json(result);
};

export const activateAccount = async (req, res) => {
  const userId = req.user.userId;

  const result = await activateAccountService(userId);

  return res.json(result);
};

export const deleteAccount = async (req, res) => {
  const userId = req.user.userId;

  const result = await deleteAccountService(userId);

  return res.json(result);
};

export const operatorLogin = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    throw new AppError(400, "Email and password are required");
  }
  const result = await operatorLoginService({ email, password });
  return res.json(result);
};
