import { Request, Response } from "express";
import * as authService from "../../services/common/auth.service";

export const signupBuyer = async (req: Request, res: Response) => {
  try {
    const result = await authService.signupBuyer(req.body);
    res.status(201).json(result);
  } catch (err) {
    res.status(400).json({ message: (err as Error).message });
  }
};

export const loginBuyer = async (req: Request, res: Response) => {
  try {
    const { token, buyer } = await authService.loginBuyer(req.body);
    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    res.status(200).json({ message: "Login buyer successful", buyer });
  } catch (err) {
    res.status(401).json({ message: (err as Error).message });
  }
};

export const signupSeller = async (req: Request, res: Response) => {
  try {
    const result = await authService.signupSeller(req.body);
    res.status(201).json(result);
  } catch (err) {
    res.status(400).json({ message: (err as Error).message });
  }
};

export const loginSeller = async (req: Request, res: Response) => {
  try {
    const { token, seller } = await authService.loginSeller(req.body);
    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    res.status(200).json({ message: "Login seller successful", seller });
  } catch (err) {
    res.status(401).json({ message: (err as Error).message });
  }
};

