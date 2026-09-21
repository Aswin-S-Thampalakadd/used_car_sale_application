import {
  customerSignupService,
  customerLoginService,
  dealerSignupService,
  dealerLoginService,
  refreshAccessTokenService,
  logoutService,
  deactivateAccountService,
  activateAccountService,
  deleteAccountService,
} from "./auth.service.js";

export const customerSignup = async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Name, email and password are required",
      });
    }

    const result = await customerSignupService({
      name,
      email,
      phone,
      password,
    });

    return res.status(201).json(result);
  } catch (error) {
    console.error(error);

    if (error.message === "EMAIL_ALREADY_EXISTS") {
      return res.status(409).json({
        message: "Email already exists",
      });
    }

    if (error.message === "PHONE_ALREADY_EXISTS") {
      return res.status(409).json({
        message: "Phone number already exists",
      });
    }

    return res.status(500).json({
      message: "Failed to create customer account",
    });
  }
};

export const customerLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    const result = await customerLoginService({
      email,
      password,
    });

    return res.json(result);
  } catch (error) {
    console.error(error);

    if (error.message === "INVALID_CREDENTIALS") {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    if (error.message === "ACCOUNT_INACTIVE") {
      return res.status(403).json({
        message: "Account is inactive",
      });
    }

    return res.status(500).json({
      message: "Failed to login",
    });
  }
};

export const dealerSignup = async (req, res) => {
  try {
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
      return res.status(400).json({
        message: "Name, email, password and dealership name are required",
      });
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
  } catch (error) {
    console.error(error);

    if (error.message === "EMAIL_ALREADY_EXISTS") {
      return res.status(409).json({
        message: "Email already exists",
      });
    }

    if (error.message === "PHONE_ALREADY_EXISTS") {
      return res.status(409).json({
        message: "Phone number already exists",
      });
    }

    return res.status(500).json({
      message: "Failed to create dealer account",
    });
  }
};

export const dealerLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    const result = await dealerLoginService({
      email,
      password,
    });

    return res.json(result);
  } catch (error) {
    console.error(error);

    if (error.message === "INVALID_CREDENTIALS") {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    if (error.message === "ACCOUNT_INACTIVE") {
      return res.status(403).json({
        message: "Account is inactive",
      });
    }

    return res.status(500).json({
      message: "Failed to login",
    });
  }
};

export const refreshAccessToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    const result = await refreshAccessTokenService(refreshToken);

    return res.json(result);
  } catch (error) {
    console.error(error);

    if (
      error.message === "REFRESH_TOKEN_REQUIRED" ||
      error.message === "INVALID_REFRESH_TOKEN"
    ) {
      return res.status(401).json({
        message: "Invalid or expired refresh token",
      });
    }

    return res.status(500).json({
      message: "Failed to refresh access token",
    });
  }
};

export const logout = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    const result = await logoutService(refreshToken);

    return res.json(result);
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Failed to logout",
    });
  }
};

export const deactivateAccount = async (req, res) => {
  try {
    const userId = req.user.userId;

    const result = await deactivateAccountService(userId);

    return res.json(result);
  } catch (error) {
    console.error(error);

    if (error.message === "USER_NOT_FOUND") {
      return res.status(404).json({
        message: "User not found",
      });
    }

    return res.status(500).json({
      message: "Failed to deactivate account",
    });
  }
};

export const activateAccount = async (req, res) => {
  try {
    const userId = req.user.userId;

    const result = await activateAccountService(userId);

    return res.json(result);
  } catch (error) {
    console.error(error);

    if (error.message === "USER_NOT_FOUND") {
      return res.status(404).json({
        message: "User not found",
      });
    }

    return res.status(500).json({
      message: "Failed to activate account",
    });
  }
};

export const deleteAccount = async (req, res) => {
  try {
    const userId = req.user.userId;

    const result = await deleteAccountService(userId);

    return res.json(result);
  } catch (error) {
    console.error(error);

    if (error.message === "USER_NOT_FOUND") {
      return res.status(404).json({
        message: "User not found",
      });
    }

    return res.status(500).json({
      message: "Failed to delete account",
    });
  }
};
