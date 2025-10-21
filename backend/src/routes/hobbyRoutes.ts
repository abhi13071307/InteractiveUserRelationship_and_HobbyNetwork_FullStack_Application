import { Router } from "express";
import { getAllHobbies, addHobbyToUser, removeHobbyFromUser } from "../controllers/hobbyController";

const router = Router();

router.get("/", getAllHobbies);

router.put("/:id/hobby", addHobbyToUser);

router.delete("/:id/hobby", removeHobbyFromUser);

export default router;
