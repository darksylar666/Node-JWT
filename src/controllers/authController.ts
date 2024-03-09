import { Request, Response } from "express";
import { hashPassword } from "../services/password.services";
import prisma from "../models/user";
import { generateToken } from "../services/auth.services";
import { compare } from "bcrypt";

export const register = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;
  try {
    const hashedPassword = await hashPassword(password);
    const user = await prisma.create({
      data: {
        email,
        password: hashedPassword,
      },
    });
    const token = generateToken(user);
    res.status(201).json({ token });
  } catch (error: any) {
    if (email === undefined || password === undefined) {
      res.status(400).json({ error: "Email and password are required" });
    }
    if (error.code === "P2002") {
      res.status(400).json({ error: "Email already in use" });
    } else {
      console.error(error);
      res.status(500).json({ error: "Error registering user" });
    }
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;
  try {
    const user = await prisma.findUnique({
      where: {
        email,
      },
    });
    if (!user) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }
    const passwordMatch = await compare(password, user.password);
    if (!passwordMatch) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }
    const token = generateToken(user);
    res.status(200).json({ token });
  } catch (error) {
    if (email === undefined || password === undefined) {
      res.status(400).json({ error: "Email and password are required" });
      return;
    }
    console.error(error);
    res.status(500).json({ error: "Error logging in" });
  }
};
