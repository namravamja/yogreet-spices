import { Request, Response } from "express";
import * as authService from "../../services/common/auth.service";

export const signupBuyer = async (req: Request, res: Response) => {
  const result = await authService.signupBuyer(req.body);
  res.status(201).json(result);
};

export const loginBuyer = async (req: Request, res: Response) => {
  const { token, buyer } = await authService.loginBuyer(req.body);
  res.cookie("token", token, {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
  res.status(200).json({ message: "Login buyer successful", buyer });
};

export const signupSeller = async (req: Request, res: Response) => {
  const result = await authService.signupSeller(req.body);
  res.status(201).json(result);
};

export const loginSeller = async (req: Request, res: Response) => {
  const { token, seller } = await authService.loginSeller(req.body);
  res.cookie("token", token, {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
  res.status(200).json({ message: "Login seller successful", seller });
};

export const loginAdmin = async (req: Request, res: Response) => {
  const { token, admin } = await authService.loginAdmin(req.body);
  res.cookie("token", token, {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
  res.status(200).json({ message: "Login admin successful", admin });
};

