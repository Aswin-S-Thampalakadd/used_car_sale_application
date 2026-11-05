import { AppError } from "../../utils/AppError.js";
import {
  activateOperatorService,
  changeOperatorPasswordService,
  checkOperatorCarLimitService,
  createOperatorService,
  deactivateOperatorService,
  deleteOperatorService,
  getAllOperatorsAdminService,
  getMyOperatorProfileService,
  getMyOperatorsService,
  resetOperatorPasswordService,
} from "./operators.service.js";

export const createOperator = async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    throw new AppError(400, "Name, email and password are required");
  }
  const result = await createOperatorService(req.user.userId, { name, email, password });
  return res.status(201).json(result);
};

export const getMyOperators = async (req, res) => {
  const result = await getMyOperatorsService(req.user.userId, req.query);
  return res.json({ success: true, ...result });
};

export const activateOperator = async (req, res) => {
  const id = Number(req.params.id);
  if (isNaN(id)) throw new AppError(400, "Invalid operator ID");
  const result = await activateOperatorService(id, req.user.userId);
  return res.json(result);
};

export const deactivateOperator = async (req, res) => {
  const id = Number(req.params.id);
  if (isNaN(id)) throw new AppError(400, "Invalid operator ID");
  const result = await deactivateOperatorService(id, req.user.userId);
  return res.json(result);
};

export const deleteOperator = async (req, res) => {
  const id = Number(req.params.id);
  if (isNaN(id)) throw new AppError(400, "Invalid operator ID");
  const result = await deleteOperatorService(id, req.user.userId);
  return res.json(result);
};

export const resetOperatorPassword = async (req, res) => {
  const id = Number(req.params.id);
  const { newPassword } = req.body;
  if (isNaN(id)) throw new AppError(400, "Invalid operator ID");
  if (!newPassword || newPassword.length < 6) {
    throw new AppError(400, "Password must be at least 6 characters");
  }
  const result = await resetOperatorPasswordService(id, req.user.userId, newPassword);
  return res.json(result);
};

export const getMyOperatorProfile = async (req, res) => {
  const profile = await getMyOperatorProfileService(req.user.userId);
  return res.json(profile);
};

export const changeMyPassword = async (req, res) => {
  const { newPassword } = req.body;
  if (!newPassword || newPassword.length < 6) {
    throw new AppError(400, "Password must be at least 6 characters");
  }
  const result = await changeOperatorPasswordService(req.user.userId, newPassword);
  return res.json(result);
};

export const checkCarLimit = async (req, res) => {
  const result = await checkOperatorCarLimitService(req.user.userId);
  return res.json({ success: true, ...result });
};

export const getAllOperatorsAdmin = async (req, res) => {
  const result = await getAllOperatorsAdminService(req.query);
  return res.json({ success: true, ...result });
};
