import { error } from "console";
import express, { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { createUser } from "../controllers/usersControllers";
import { getAllUsers } from "../controllers/usersControllers";
import { getUserById } from "../controllers/usersControllers";
import { updateUser } from "../controllers/usersControllers";
import { deleteUser } from "../controllers/usersControllers";

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "secret";

const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ error: "Forbidden" });
    }
    next();
  });
};

router.post("/", authenticateToken, createUser);
router.get("/", authenticateToken, getAllUsers);
router.get("/:id", authenticateToken, getUserById);
router.put("/:id", authenticateToken, updateUser);
router.delete("/:id", authenticateToken, deleteUser);

export default router;
