import { Router } from "express";
import { addHobbyToUser, removeHobbyFromUser } from "../controllers/hobbyController";

const router = Router();

router.put("/:id/hobby", addHobbyToUser);
router.delete("/:id/hobby", removeHobbyFromUser);

export default router;
