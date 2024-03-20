import * as app from "express";
import { SubRoutes } from "../constants/routes.constant";
import { UsersController } from "../controllers/users.controller";

const router = app.Router();
const usersController = new UsersController();
const { createUser, deleteUser, findUser, getAllUsers, updateUser } =
  usersController;

router.get(SubRoutes.All, getAllUsers);

router.get("/:id", findUser);

router.post("", createUser);

router.put("/:id", updateUser);

router.delete("/:id", deleteUser);

export default router;
