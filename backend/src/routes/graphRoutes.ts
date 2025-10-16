import { Router } from "express";
import { getGraphData } from "../controllers/graphController";

const router = Router();

router.get("/", getGraphData);

export default router;
