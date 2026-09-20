import {
  customerSignupService,
  customerLoginService,
  refreshAccessTokenService,
  logoutService,
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

    res.status(201).json(result);
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

    res.status(500).json({
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

    res.json(result);
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

    res.status(500).json({
      message: "Failed to login",
    });
  }
};

export const refreshAccessToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    const result = await refreshAccessTokenService(refreshToken);

    res.json(result);
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

    res.status(500).json({
      message: "Failed to refresh access token",
    });
  }
};

export const logout = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    const result = await logoutService(refreshToken);

    res.json(result);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to logout",
    });
  }
};
