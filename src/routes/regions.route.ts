import * as app from "express";
import { SubRoutes } from "../constants/routes.constant";
import { RegionsController } from "../controllers/regions.controller";

const router = app.Router();
const regionsController = new RegionsController();
const {
  createRegion,
  deleteRegion,
  findRegion,
  findRegionByNearbyPoint,
  findRegionContainingPoint,
  getAllRegions,
  updateRegion,
} = regionsController;

router.get(SubRoutes.All, getAllRegions);

router.post("", createRegion);

router.put("/:id", updateRegion);

router.delete("/:id", deleteRegion);

router.get(SubRoutes.Contains, findRegionContainingPoint);

router.get(SubRoutes.Nearby, findRegionByNearbyPoint);

router.get("/:id", findRegion);

export default router;
