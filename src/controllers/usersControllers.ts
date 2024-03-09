import { Request, Response } from "express";
import { hashPassword } from "../services/password.services";
import prisma from "../models/user";

export const createUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { email, password } = req.body;
  try {
    const hashedPassword = await hashPassword(password);
    const user = await prisma.create({
      data: {
        email,
        password: hashedPassword,
      },
    });
    res.status(201).json(user);
  } catch (error: any) {
    if (email === undefined || password === undefined) {
      res.status(400).json({ error: "Email and password are required" });
      return;
    }
    if (error.code === "P2002") {
      res.status(400).json({ error: "Email already in use" });
    } else {
      console.error(error);
      res.status(500).json({ error: "Error registering user" });
    }
  }
};

export const getAllUsers = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const users = await prisma.findMany();
    res.status(200).json(users);
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ error: "Error getting users" });
  }
};

export const getUserById = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { id } = req.params;
  try {
    const user = await prisma.findUnique({
      where: {
        id: Number(id),
      },
    });
    if (user === null) {
      res.status(404).json({ error: "User not found" });
      return;
    }
    res.status(200).json(user);
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ error: "Error getting user" });
  }
};

export const updateUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { id } = req.params;
  const { email, password } = req.body;
  try {
    let dataToUpdate: any = { ...req.body };
    if (password) {
      const hashedPassword = await hashPassword(password);
      dataToUpdate.password = hashedPassword;
    }
    if (email) {
      dataToUpdate.email = email;
    }
    const user = await prisma.update({
      where: {
        id: Number(id),
      },
      data: dataToUpdate,
    });
    res.status(200).json(user)
  } catch (error: any) {
    if (error?.code === "P2025" && error?.meta?.target?.includes("email")) {
      res.status(400).json({ error: "Email already in use" });
      return;
    } else if (error?.code === "P2025") {
      res.status(404).json({ error: "User not found" });
      return;
    } else {
      console.error(error);
      res.status(500).json({ error: "Error updating user" });
    }
  }
};

export const deleteUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { id } = req.params;
  try {
    await prisma.delete({
      where: {
        id: Number(id),
      },
    });
    res.status(200).json({
      message: `The user with id ${id} has been successfully deleted.`,
    }).end;
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ error: "Error deleting user" });
  }
};
