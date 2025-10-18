import { Router } from "express";
import {
  createUser,
  getAllUsers,
  linkUser,
  unlinkUser,
  deleteUser,
  updateUser,
} from "../controllers/userController";

const router = Router();

router.post("/", createUser);
router.get("/", getAllUsers);
router.post("/:id/link", linkUser);
router.delete("/:id/unlink", unlinkUser);
router.put("/:id", updateUser);
router.delete("/:id", deleteUser);

export default router;
